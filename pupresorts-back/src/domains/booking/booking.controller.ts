import {Router, Request, Response, request} from 'express';
import {PrismaClient} from '@prisma/client';
import {BookingService} from './booking.service';
import {withAuth} from "@src/domains/auth/utils/auth";
import {BookingRepository} from "@src/domains/booking/booking.repository";

const prisma = new PrismaClient()
const repository = new BookingRepository(prisma)
const service = new BookingService(repository);
export const bookingRouter = Router();

bookingRouter.post('/', withAuth, async (req: Request, res: Response) => {
    try {
        const userId = res.locals.context.id;
        const {dogId, hotelBranch, startDate, endDate, price} = req.body;

        const booking = await service.createBooking({
            userId,
            dogId,
            hotelBranch,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            price: Number(price),
        });

        res.status(201).json(booking);
    } catch (e: any) {
        res.status(400).json({error: e.message});
    }
});


bookingRouter.get('/', withAuth, async (req: Request, res: Response) => {
    try {
        const userId = res.locals.context.id;
        const bookings = await service.getBookingsByOwner(userId);
        res.json(bookings);
    } catch (e: any) {
        res.status(400).json({error: e.message});
    }
});

bookingRouter.get('/:id', withAuth, async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.id;
        const booking = await service.getBookingById(bookingId);
        res.json(booking);
    } catch (e: any) {
        res.status(400).json({error: e.message});
    }
});

bookingRouter.put('/:id', withAuth, async (req: Request, res: Response) => {
    const bookingId = req.params.id;
    const {dogId, newStartDate, newEndDate} = req.body;
    const userId = res.locals.context.id;

    const updatedBooking = await service.updateBooking({
        bookingId,
        dogId,
        ownerId: userId,
        newStartDate: new Date(newStartDate),
        newEndDate: new Date(newEndDate)
    });
    res.json(updatedBooking);
})

bookingRouter.post('/:id/cancel', withAuth, async (req: Request, res: Response)=> {
    const bookingId = req.params.id;
    const ownerId = res.locals.context.id;

    const cancelledBooking = await service.cancelBooking(
        bookingId,
        ownerId
    );
    res.json(cancelledBooking);
})


