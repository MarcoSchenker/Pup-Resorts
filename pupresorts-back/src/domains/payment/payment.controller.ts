import {Request, Response, Router} from "express";
import {PaymentService} from "@src/domains/payment/payment.service";
import {UserRepository} from "@src/domains/user/user.repository";
import { PrismaClient } from "@prisma/client";
import HttpStatus from "http-status";
import {withAuth} from "@src/domains/auth/utils/auth";

export const paymentRouter = Router();

const prismaClient : PrismaClient = new PrismaClient();
const userRepository : UserRepository = new UserRepository(prismaClient);
const service: PaymentService = new PaymentService(userRepository);

// POST /api/payments/checkout
paymentRouter.post(
    "/checkout",
    withAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = res.locals.context.id;
            const result = await service.createCheckout({
                userId: userId,
                hotelBranch: req.body.hotelBranch,
                room: req.body.room,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                dogId: req.body.dogId,
                price: req.body.price
            });
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(HttpStatus.OK).json(result);
        } catch (error: any) {
            console.error('Error during checkout creation:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message || 'Internal server error' });
        }
    }
);

// GET /api/payments/checkout/:id/status
paymentRouter.get(
    "/checkout/:id/status",
    withAuth,
    async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .json({ success: false, message: "Invalid checkout ID" });
            }

            const result = await service.getCheckoutStatus(id);
            const statusCode = result.success ? HttpStatus.OK : HttpStatus.NOT_FOUND;

            return res.status(statusCode).json(result);
        } catch (error: any) {
            console.error('Error fetching checkout status:', error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message || 'Internal server error' });
        }
    }
);

// POST /api/payments/webhook/mercadopago
paymentRouter.post(
    "/webhook/mercadopago",
    async (req: Request, res: Response) => {
        try {
            console.log('Received webhook from MercadoPago:', JSON.stringify(req.body));
            await service.handleMercadoPagoWebhook(req.body);
            return res.status(HttpStatus.OK).send("ok");
        } catch (error: any) {
            console.error('Error processing MercadoPago webhook:', error);
            // Always return 200 to avoid MP retries on non-critical errors, unless signature validation is added
            return res.status(HttpStatus.OK).send("ok");
        }
    }
);
