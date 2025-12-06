import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BookingService } from '../src/domains/booking/booking.service';
import { BookingRepository } from '../src/domains/booking/booking.repository';
import { HotelBranch, OrderStatus } from '@prisma/client';

type DogEntity = {
    id: string;
    ownerId: string;
    name: string;
    birthDate: Date;
    breed: string;
    weight: number;
    dailyMedicine: boolean;
    comments: string;
    allergies: string;
};

type BookingEntity = {
    id: string;
    startDate: Date;
    endDate: Date;
    dogId: string;
    ownerId: string;
    hotelBranch: HotelBranch;
    price: number;
    orderStatus: OrderStatus;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type BookingWithDog = BookingEntity & { dog: DogEntity };

describe('BookingService - create, edit y cancel', () => {
    let service: BookingService;

    let mockRepo: jest.Mocked<
        Pick<
            BookingRepository,
            | 'create'
            | 'countActiveByBranch'
            | 'findByOwner'
            | 'findByBookingId'
            | 'updateBooking'
            | 'cancelBooking'
        >
    >;

    beforeEach(() => {
        mockRepo = {
            create: jest.fn(),
            countActiveByBranch: jest.fn(),
            findByOwner: jest.fn(),
            findByBookingId: jest.fn(),
            updateBooking: jest.fn(),
            cancelBooking: jest.fn(),
        } as any;

        service = new BookingService(mockRepo as unknown as BookingRepository);
    });

    const makeDog = (o: Partial<DogEntity> = {}): DogEntity => ({
        id: 'dog-123',
        ownerId: 'owner-123',
        name: 'Chulo',
        birthDate: new Date('2025-05-14T00:00:00.000Z'),
        breed: 'Golden',
        weight: 28,
        dailyMedicine: false,
        comments: '',
        allergies: '',
        ...o,
    });

    const makeBooking = (o: Partial<BookingEntity> = {}): BookingEntity => ({
        id: 'booking-1',
        startDate: new Date('2025-12-01T00:00:00.000Z'),
        endDate: new Date('2025-12-05T00:00:00.000Z'),
        dogId: 'dog-123',
        ownerId: 'owner-123',
        hotelBranch: HotelBranch.Pilar,
        price: 2500,
        orderStatus: OrderStatus.PENDING_PAYMENT,
        expiresAt: new Date('2025-12-01T00:15:00.000Z'),
        createdAt: new Date('2025-11-01T00:00:00.000Z'),
        updatedAt: new Date('2025-11-01T00:00:00.000Z'),
        ...o,
    });

    const withDog = (b: BookingEntity, d: DogEntity = makeDog()): BookingWithDog =>
        ({ ...b, dog: d });

    // =============== CREATE ===============

    it('createBooking - happy path: devuelve bookingDto', async () => {
        mockRepo.countActiveByBranch.mockResolvedValue(2);
        const entity = makeBooking();
        mockRepo.create.mockResolvedValue(entity);

        const input = {
            userId: 'owner-123',
            dogId: 'dog-123',
            hotelBranch: HotelBranch.Pilar,
            startDate: new Date('2025-12-01T00:00:00.000Z'),
            endDate: new Date('2025-12-05T00:00:00.000Z'),
            price: 2500,
        };

        const result = await service.createBooking(input);

        expect(mockRepo.countActiveByBranch).toHaveBeenCalledWith(
            input.hotelBranch,
            input.startDate,
            input.endDate,
        );
        expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            ownerId: input.userId,
            dogId: input.dogId,
            hotelBranch: input.hotelBranch,
            price: input.price,
        }));
        expect(result.booking).toMatchObject({
            id: entity.id,
            dogId: entity.dogId,
            ownerId: entity.ownerId,
            hotelBranch: entity.hotelBranch,
            price: entity.price,
            orderStatus: entity.orderStatus,
        });
        expect(result.booking.startDate).toBe(entity.startDate.toISOString());
        expect(result.booking.endDate).toBe(entity.endDate.toISOString());
    });

    it('createBooking - lanza error si startDate >= endDate', async () => {
        const startDate = new Date('2025-12-05');
        const endDate = new Date('2025-12-05');

        await expect(
            service.createBooking({
                userId: 'owner-1',
                dogId: 'dog-1',
                hotelBranch: HotelBranch.Pilar,
                startDate,
                endDate,
                price: 1000,
            }),
        ).rejects.toThrow('La fecha de inicio debe ser anterior a la fecha de fin.');

        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('createBooking - lanza error si no hay disponibilidad', async () => {
        mockRepo.countActiveByBranch.mockResolvedValue(10);

        await expect(
            service.createBooking({
                userId: 'owner-1',
                dogId: 'dog-1',
                hotelBranch: HotelBranch.Pilar,
                startDate: new Date('2025-12-01'),
                endDate: new Date('2025-12-05'),
                price: 1000,
            }),
        ).rejects.toThrow(/No hay disponibilidad/);

        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    // =============== UPDATE ===============

    it('updateBooking - happy path', async () => {
        const existing = withDog(makeBooking());
        mockRepo.findByBookingId.mockResolvedValue(existing);

        const updatedEntity = withDog(makeBooking({
            id: existing.id,
            startDate: new Date('2025-12-02'),
            endDate: new Date('2025-12-06'),
            updatedAt: new Date('2025-11-02T00:00:00.000Z'),
        }));
        mockRepo.updateBooking.mockResolvedValue(updatedEntity);

        const result = await service.updateBooking({
            bookingId: existing.id,
            ownerId: existing.ownerId,
            dogId: existing.dogId,
            newStartDate: new Date('2025-12-02'),
            newEndDate: new Date('2025-12-06'),
        });

        expect(mockRepo.findByBookingId).toHaveBeenCalledWith(existing.id);
        expect(mockRepo.updateBooking).toHaveBeenCalledWith(existing.id, expect.objectContaining({
            dogId: existing.dogId,
            newStartDate: new Date('2025-12-02'),
            newEndDate: new Date('2025-12-06'),
        }));
        expect(result.updatedBooking.startDate).toEqual(updatedEntity.startDate);
        expect(result.updatedBooking.endDate).toEqual(updatedEntity.endDate);
    });

    it('updateBooking - lanza Unauthorized si no hay ownerId', async () => {
        const existing = withDog(makeBooking());
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.updateBooking({
                bookingId: existing.id,
                // @ts-ignore
                ownerId: null,
                dogId: existing.dogId,
                newStartDate: new Date('2025-12-02'),
                newEndDate: new Date('2025-12-06'),
            }),
        ).rejects.toThrow('Unauthorized. You must login to access this content.');

        expect(mockRepo.updateBooking).not.toHaveBeenCalled();
    });

    it('updateBooking - lanza Forbidden si el owner no coincide', async () => {
        const existing = withDog(makeBooking({ ownerId: 'otro-owner' }));
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.updateBooking({
                bookingId: existing.id,
                ownerId: 'owner-distinto',
                dogId: existing.dogId,
                newStartDate: new Date('2025-12-02'),
                newEndDate: new Date('2025-12-06'),
            }),
        ).rejects.toThrow('Forbidden. You are not allowed to perform this action');

        expect(mockRepo.updateBooking).not.toHaveBeenCalled();
    });

    it('updateBooking - lanza Conflict si la reserva está cancelada', async () => {
        const existing = withDog(makeBooking({ orderStatus: OrderStatus.CANCELLED }));
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.updateBooking({
                bookingId: existing.id,
                ownerId: existing.ownerId,
                dogId: existing.dogId,
                newStartDate: new Date('2025-12-02'),
                newEndDate: new Date('2025-12-06'),
            }),
        ).rejects.toThrow('Conflict');
    });

    it('updateBooking - lanza Validation si la fecha es inválida', async () => {
        const existing = withDog(makeBooking());
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.updateBooking({
                bookingId: existing.id,
                ownerId: existing.ownerId,
                dogId: existing.dogId,
                newStartDate: new Date('2025-12-10'),
                newEndDate: new Date('2025-12-05'),
            }),
        ).rejects.toThrow('Validation Error');
    });

    // =============== CANCEL ===============

    it('cancelBooking - happy path', async () => {
        const existing = withDog(makeBooking({ orderStatus: OrderStatus.PENDING_PAYMENT }));
        mockRepo.findByBookingId.mockResolvedValue(existing);

        const cancelled = withDog(makeBooking({ orderStatus: OrderStatus.CANCELLED }));
        mockRepo.cancelBooking.mockResolvedValue(cancelled);

        const result = await service.cancelBooking(existing.id, existing.ownerId);

        expect(mockRepo.findByBookingId).toHaveBeenCalledWith(existing.id);
        expect(mockRepo.cancelBooking).toHaveBeenCalledWith(existing.id);
        expect(result.cancelledBooking.orderStatus).toBe(OrderStatus.CANCELLED);
    });

    it('cancelBooking - lanza Unauthorized si no hay ownerId', async () => {
        const existing = withDog(makeBooking());
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            // @ts-ignore
            service.cancelBooking(existing.id, null),
        ).rejects.toThrow('Unauthorized. You must login to access this content.');
    });

    it('cancelBooking - lanza Forbidden si no es el dueño', async () => {
        const existing = withDog(makeBooking({ ownerId: 'otro-owner' }));
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.cancelBooking(existing.id, 'owner-distinto'),
        ).rejects.toThrow('Forbidden. You are not allowed to perform this action');
    });

    it('cancelBooking - lanza Conflict si ya está cancelada', async () => {
        const existing = withDog(makeBooking({ orderStatus: OrderStatus.CANCELLED }));
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.cancelBooking(existing.id, existing.ownerId),
        ).rejects.toThrow('Conflict');
    });

    it('cancelBooking - lanza Conflict si ya está completada', async () => {
        const existing = withDog(makeBooking({ orderStatus: OrderStatus.COMPLETED }));
        mockRepo.findByBookingId.mockResolvedValue(existing);

        await expect(
            service.cancelBooking(existing.id, existing.ownerId),
        ).rejects.toThrow('Conflict');
    });
});
