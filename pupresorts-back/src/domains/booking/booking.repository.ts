import { PrismaClient, HotelBranch, OrderStatus } from '@prisma/client';

export class BookingRepository {

    constructor(private readonly prisma: PrismaClient) {}

    async create(data: {
        startDate: Date;
        endDate: Date;
        dogId: string;
        hotelBranch: HotelBranch;
        price: number;
        orderStatus: OrderStatus;
        expiresAt: Date;
        ownerId: string;
    }) {
        return this.prisma.booking.create({ data });
    }

    async countActiveByBranch(
        hotelBranch: HotelBranch,
        startDate: Date,
        endDate: Date
    ) {
        return this.prisma.booking.count({
            where: {
                hotelBranch,
                startDate: { lt: endDate },
                endDate:   { gt: startDate },
                NOT: { orderStatus: OrderStatus.CANCELLED },
            },
        });
    }

    async findByOwner(ownerId: string) {
        return this.prisma.booking.findMany({
            where: {
               ownerId: ownerId
            },
            include: {
                dog: true,
            },
        });
    }

    async findByBookingId(bookingId: string) {
        return this.prisma.booking.findUnique({
            where: {
               id: bookingId
            },
            include: {
                dog: true,
            },
        });
    }

    async updateBooking(bookingId: string, data: {bookingId: string, dogId: string, ownerId: string, newStartDate: Date, newEndDate: Date}) {
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                startDate: data.newStartDate,
                endDate: data.newEndDate,
                dogId: data.dogId,
            },
        });
    }

    async cancelBooking(bookingId: string) {
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                orderStatus: OrderStatus.CANCELLED,
            },
        });
    }
}