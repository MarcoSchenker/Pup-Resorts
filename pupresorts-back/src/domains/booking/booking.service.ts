import { HotelBranch, OrderStatus } from '@prisma/client';
import { BookingRepository } from './booking.repository';
import {
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
    ValidationException
} from "../../utils/errors";

export class BookingService {
    private readonly repo: BookingRepository;

    constructor(bookingRepository: BookingRepository) {
        this.repo = bookingRepository;

    }
    async createBooking(params: {
        userId: string;
        dogId: string;
        hotelBranch: HotelBranch;
        startDate: Date;
        endDate: Date;
        price: number;
    }) {
        const { userId, dogId, hotelBranch, startDate, endDate, price } = params;

        if (startDate >= endDate) {
            throw new Error('La fecha de inicio debe ser anterior a la fecha de fin.');
        }

        const count = await this.repo.countActiveByBranch(hotelBranch, startDate, endDate);
        if (count >= 10) {
            throw new Error(`No hay disponibilidad en ${hotelBranch}.`);
        }

        const booking = await this.repo.create({
            ownerId: userId,
            startDate,
            endDate,
            dogId,
            hotelBranch,
            price,
            orderStatus: OrderStatus.PENDING_PAYMENT,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        const bookingDto: BookDto = {
            id: booking.id,
            startDate: booking.startDate.toISOString(),
            endDate: booking.endDate.toISOString(),
            dogId: booking.dogId,
            ownerId: booking.ownerId,
            hotelBranch: booking.hotelBranch,
            price: booking.price,
            orderStatus: booking.orderStatus,
        }
        return { booking: bookingDto}
    }

    async getBookingsByOwner(ownerId: string) {
        const bookings =await this.repo.findByOwner(ownerId);
        return {bookings: bookings};
    }

    async getBookingById(bookingId: string) {
        const booking = await this.repo.findByBookingId(bookingId);
        if (!booking) {
            NotFoundException({message: 'Reserva no encontrada'});
        }
        return {booking: booking};
    }

    async updateBooking( params: {bookingId: string; dogId: string; ownerId: string; newStartDate: Date; newEndDate: Date})
    {
        const booking = await this.repo.findByBookingId(params.bookingId);
        if (!params.ownerId){
            UnauthorizedException({message: 'Debes iniciar sesión para modificar una reserva'});
        }
        if (!booking) {
            NotFoundException({message: 'Reserva no encontrada'});
        }
        if (booking.ownerId !== params.ownerId) {
            ForbiddenException({message: 'No tienes permiso para modificar esta reserva'});
        }
        if (booking.orderStatus === OrderStatus.CANCELLED || booking.orderStatus === OrderStatus.COMPLETED) {
            ConflictException({message: 'No se puede modificar una reserva que ya no está activa'});
        }
        if (params.newStartDate >= params.newEndDate) {
            ValidationException({message: 'La fecha de inicio debe ser anterior a la fecha de fin.'});
        }
        const updatedBooking = await this.repo.updateBooking(params.bookingId, {
            bookingId: params.bookingId,
            ownerId: params.ownerId,
            dogId: params.dogId,
            newStartDate: params.newStartDate,
            newEndDate: params.newEndDate
        })
        return {updatedBooking: updatedBooking};
    }

    async cancelBooking(bookingId: string, ownerId: string) {
        const booking = await this.repo.findByBookingId(bookingId);
        if (!ownerId){
            UnauthorizedException({message: 'Debes iniciar sesión para cancelar una reserva'});
        }
        if (!booking) {
            NotFoundException({message: 'Reserva no encontrada'});
        }
        if (booking.ownerId !== ownerId) {
            ForbiddenException({message: 'No tienes permiso para cancelar esta reserva'});
        }
        if (booking.orderStatus === OrderStatus.CANCELLED) {
            ConflictException({message: 'La reserva ya está cancelada'});
        }
        if (booking.orderStatus === OrderStatus.COMPLETED) {
            ConflictException({message: 'No se puede cancelar una reserva completada'});
        }
        const cancelledBooking = await this.repo.cancelBooking(bookingId);
        return {cancelledBooking: cancelledBooking};
    }
}
