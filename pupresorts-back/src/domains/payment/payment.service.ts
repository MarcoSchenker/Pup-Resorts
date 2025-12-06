import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { randomUUID } from "crypto";
import type { CheckoutRequest } from "./dto/index.js";
import {UserRepository} from "@src/domains/user/user.repository";
import {CheckoutStatus, HotelBranch, PrismaClient} from "@prisma/client";

export class PaymentService {
    private client: MercadoPagoConfig;
    private preference: Preference;
    private userRepository: UserRepository
    //private dogRepository: DogRepository
    //private roomRepository: RoomRepository
    private prisma : PrismaClient = new PrismaClient();

    //no se si pasar todos los repositories por constructor o inicializarlos con el new abajo
    constructor(userRepository: UserRepository) {
        const token = process.env.MP_ACCESS_TOKEN;
        if (!token) throw new Error("Missing MP_ACCESS_TOKEN env var");

        this.client = new MercadoPagoConfig({ accessToken: token });
        this.preference = new Preference(this.client);
        this.userRepository =  userRepository;
    }

    async createCheckout(request: CheckoutRequest): Promise<{
        success: boolean;
        message: string;
        data?: { preferenceId: string; initPoint: string; externalReference: string };
    }> {
        try {
            const user = await this.userRepository.getUserById(request.userId);
            if (!user) {
                return { success: false, message: "User not found" };
            }
            //lo dejo comentado por ahora porque no tengo los repositorios de dog y room
            /*for (const reservation of request.rooms) {
                const dog = await this.dogRepository.findById(reservation.dogId);
                if (!dog) {
                    return { success: false, message: `Dog with ID ${reservation.dogId} not found` };
                }

                const room = await this.roomRepository.findById(reservation.roomId);
                if (!room) {
                    return { success: false, message: `Room with ID ${reservation.roomId} not found` };
                }
            }*/
            const externalReference = randomUUID();

            const totalPrice = Number(request.price);
            const items = [{
                id: request.room,
                title: `Habitación ${request.room}`,
                quantity: 1,
                currency_id: "ARS",
                unit_price: totalPrice,
            }];

            // Transacción para garantizar consistencia
            const result = await this.prisma.$transaction(async (prismaClient) => {
                const checkout = await prismaClient.checkout.create({
                    data: {
                        userId: request.userId,
                        status: "PENDING",
                        totalPrice,
                        externalReference,
                    }
                });

                const preferenceBody = {
                    external_reference: externalReference,
                    items,
                    metadata: {
                        userId: request.userId,
                        dogId: request.dogId,
                        hotelBranch: request.hotelBranch,
                        startDate: request.startDate,
                        endDate: request.endDate,
                        price: totalPrice,
                    },
                    back_urls: {
                        success: process.env.MP_BACK_URL_SUCCESS,
                        failure: process.env.MP_BACK_URL_FAILURE,
                        pending: process.env.MP_BACK_URL_PENDING,
                    },
                    notification_url: process.env.MP_WEBHOOK_URL,
                };

                const preferenceResponse = await this.preference.create({ body: preferenceBody });

                await prismaClient.checkout.update({
                    where: { id: checkout.id },
                    data: {
                        preferenceId: preferenceResponse.id,
                        initPoint: preferenceResponse.init_point
                    }
                });

                return {
                    preferenceId: preferenceResponse.id!,
                    initPoint: preferenceResponse.init_point!,
                    externalReference
                };
            });

            return {
                success: true,
                message: "Checkout created successfully",
                data: result
            };
        } catch (error: any) {
            console.error("Error creating checkout:", error);
            return { success: false, message: error?.message ?? "Error creating Mercado Pago preference" };
        }
    }


    async getCheckoutStatus(id: number): Promise<{ success: boolean; message: string; data?: { status: string } }> {
        const checkout = await this.prisma.checkout.findUnique({ where: { id } });
        if (!checkout) {
            return { success: false, message: "Checkout not found" };
        }
        return { success: true, message: "Checkout status", data: { status: checkout.status } };
    }

    async handleMercadoPagoWebhook(body: any): Promise<void> {
        const bodyData = body || {};
        const type = bodyData.type || bodyData.topic || bodyData.action;

        let paymentId;
        if (bodyData.data?.id) {
            paymentId = bodyData.data.id;
        } else if (bodyData.resource) {
            // Extraer ID de recursos como "/v1/payments/123456"
            const match = bodyData.resource.match(/\/([^\/]+)\/([^\/]+)$/);
            if (match) paymentId = match[2];
        } else if (bodyData.id) {
            paymentId = bodyData.id;
        }

        if (!paymentId) return;

        // Fetch payment info
        const payment = new Payment(this.client);
        const paymentData = await payment.get({ id: paymentId });
        const status = paymentData.status as string;
        const externalReference = paymentData.external_reference as string;

        const checkout = await this.prisma.checkout.findFirst({ where: { externalReference } });
        if (!checkout) {
            console.error("[MP Webhook] Checkout not found for externalReference", externalReference);
            return;
        }

        if (checkout.status === "APPROVED") {
            return;
        }

        if (status === "approved") {
            await this.prisma.$transaction(async (prismaClient) => {
                const bookingCreated = await this.createBookingOnApproval(prismaClient, paymentData, checkout.userId);

                if (bookingCreated) {
                    await prismaClient.checkout.update({
                        where: { id: checkout.id },
                        data: { status: "APPROVED" }
                    });
                } else {
                    console.warn("[MP Webhook] Booking not created; leaving checkout as PENDING", { checkoutId: checkout.id });
                }
            });
        } else if (["rejected", "cancelled", "expired"].includes(status)) {
            await this.prisma.checkout.update({
                where: { id: checkout.id },
                data: { status: status.toUpperCase() as CheckoutStatus }
            });
        }
    }

    private async createBookingOnApproval(prismaClient: any, paymentData: any, userId: string): Promise<boolean> {
        const metadata = (paymentData && paymentData.metadata) || {};
        console.log("[MP Webhook] Metadata for booking:", metadata);

        const dogId = (metadata.dogId ?? metadata.dog_id) as string | undefined;
        const hotelBranchRaw = (metadata.hotelBranch ?? metadata.hotel_branch) as string | undefined;
        const startDateStr = (metadata.startDate ?? metadata.start_date) as string | undefined;
        const endDateStr = (metadata.endDate ?? metadata.end_date) as string | undefined;
        const price = Number(metadata.price);
        const hotelBranch = hotelBranchRaw as string | undefined;

        if (!dogId || !hotelBranch || !startDateStr || !endDateStr || !price || Number.isNaN(price)) {
            console.error("[MP Webhook] Missing metadata to create booking on approval", { dogId, hotelBranch, startDateStr, endDateStr, price });
            return false;
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const existing = await prismaClient.booking.findFirst({
            where: {
                ownerId: userId,
                dogId: dogId,
                hotelBranch: hotelBranch as HotelBranch,
                startDate: startDate,
                endDate: endDate,
            }
        });
        if (existing) {
            console.log("[MP Webhook] Booking already exists, skipping creation", { id: existing.id });
            return true;
        }

        const created = await prismaClient.booking.create({
            data: {
                startDate,
                endDate,
                dogId,
                ownerId: userId,
                hotelBranch: hotelBranch as HotelBranch,
                price,
                orderStatus: "CONFIRMED"
            }
        });
        console.log("[MP Webhook] Booking created", { id: created.id });
        return true;
    }
}