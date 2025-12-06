import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DogService } from '../src/domains/dog/dog.service';
import { DogRepository } from '../src/domains/dog/dog.repository';

type DogEntity = {
    id: string;
    name: string;
    birthDate: Date;
    breed: string;
    weight: number;
    dailyMedicine: boolean;
    comments: string;
    allergies: string;
    ownerId: string;
};

describe('DogService - create & update', () => {
    let service: DogService;

    let mockRepo: jest.Mocked<
        Pick<DogRepository, 'create' | 'findById' | 'update' | 'findByOwner'>
    >;

    beforeEach(() => {
        mockRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            findByOwner: jest.fn(),
        } as any;

        service = new DogService(mockRepo as unknown as DogRepository);
    });

    const makeDog = (overrides: Partial<DogEntity> = {}): DogEntity => ({
        id: 'dog-1',
        name: 'Chulo',
        birthDate: new Date('2025-05-14T00:00:00.000Z'),
        breed: 'Golden Retriever',
        weight: 28.5,
        dailyMedicine: false,
        comments: 'Es muy sociable y se lleva bien con otros perros.',
        allergies: 'Polen y polvo',
        ownerId: 'owner-123',
        ...overrides,
    });

    // ================== CREATE ==================

    it('createDog - happy path: devuelve DogDto', async () => {
        const entity = makeDog();
        mockRepo.create.mockResolvedValue(entity);

        const input = {
            name: entity.name,
            birthDate: entity.birthDate,
            breed: entity.breed,
            weight: entity.weight,
            dailyMedicine: entity.dailyMedicine,
            comments: entity.comments,
            allergies: entity.allergies,
            ownerId: entity.ownerId,
        };

        const result = await service.createDog(input);

        expect(mockRepo.create).toHaveBeenCalledWith(input);
        expect(result.dog).toMatchObject({
            id: entity.id,
            name: entity.name,
            breed: entity.breed,
            weight: entity.weight,
            dailyMedicine: entity.dailyMedicine,
            comments: entity.comments,
            allergies: entity.allergies,
            ownerId: entity.ownerId,
        });
        expect(result.dog.birthDate).toBe(entity.birthDate.toISOString());
    });

    it('createDog - propaga error si el repo falla', async () => {
        mockRepo.create.mockRejectedValue(new Error('DB error'));
        await expect(
            service.createDog({
                name: 'Rocky',
                birthDate: new Date('2024-01-10'),
                breed: 'Labrador',
                weight: 30,
                dailyMedicine: false,
                comments: '',
                allergies: '',
                ownerId: 'owner-123',
            }),
        ).rejects.toThrow('DB error');
    });

    // ================== UPDATE ==================

    it('updateDog - happy path: devuelve DogDto actualizado', async () => {
        const existing = makeDog({ id: 'dog-xyz', ownerId: 'owner-123' });
        mockRepo.findById.mockResolvedValue(existing);

        const updatedEntity = makeDog({
            id: 'dog-xyz',
            name: 'Chulo Actualizado',
            weight: 30,
            comments: 'Engordó un poquito',
        });
        mockRepo.update.mockResolvedValue(updatedEntity);

        const putBody = {
            name: 'Chulo Actualizado',
            birthDate: '2025-05-14',
            breed: 'Golden Retriever',
            weight: 30,
            dailyMedicine: false,
            comments: 'Engordó un poquito',
            allergies: 'Polen y polvo',
        };

        const result = await service.updateDog('dog-xyz', 'owner-123', putBody);

        expect(mockRepo.findById).toHaveBeenCalledWith('dog-xyz');

        expect(mockRepo.update).toHaveBeenCalledWith('dog-xyz', expect.objectContaining({
            name: 'Chulo Actualizado',
            birthDate: new Date('2025-05-14'),
            breed: 'Golden Retriever',
            weight: 30,
            dailyMedicine: false,
            comments: 'Engordó un poquito',
            allergies: 'Polen y polvo',
        }));

        expect(result.dog).toMatchObject({
            id: 'dog-xyz',
            name: 'Chulo Actualizado',
            weight: 30,
            comments: 'Engordó un poquito',
            ownerId: 'owner-123',
        });
        expect(result.dog.birthDate).toBe(updatedEntity.birthDate.toISOString());
    });

    it('updateDog - 404 si el perro no existe', async () => {
        mockRepo.findById.mockResolvedValue(null as any);
        await expect(
            service.updateDog('dog-inexistente', 'owner-123', {
                name: 'X',
                birthDate: '2025-01-01',
                breed: 'Labrador',
                weight: 10,
                dailyMedicine: false,
                comments: '',
                allergies: '',
            }),
        ).rejects.toThrow('Dog not found');

        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('updateDog - Forbidden si el user no es el dueño', async () => {
        const existing = makeDog({ id: 'dog-abc', ownerId: 'owner-real' });
        mockRepo.findById.mockResolvedValue(existing);

        await expect(
            service.updateDog('dog-abc', 'otro-owner', {
                name: 'X',
                birthDate: '2025-01-01',
                breed: 'Labrador',
                weight: 10,
                dailyMedicine: false,
                comments: '',
                allergies: '',
            }),
        ).rejects.toThrow('Forbidden');

        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('updateDog - birthDate inválido arroja error', async () => {
        const existing = makeDog({ id: 'dog-1', ownerId: 'owner-123' });
        mockRepo.findById.mockResolvedValue(existing);

        await expect(
            service.updateDog('dog-1', 'owner-123', {
                name: 'X',
                birthDate: 'no-es-una-fecha',
                breed: 'Labrador',
                weight: 10,
                dailyMedicine: false,
                comments: '',
                allergies: '',
            }),
        ).rejects.toThrow('Invalid birthDate');

        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('updateDog - weight inválido arroja error', async () => {
        const existing = makeDog({ id: 'dog-2', ownerId: 'owner-123' });
        mockRepo.findById.mockResolvedValue(existing);

        await expect(
            service.updateDog('dog-2', 'owner-123', {
                name: 'X',
                birthDate: '2025-01-01',
                breed: 'Labrador',
                // @ts-ignore
                weight: 'treinta',
                dailyMedicine: false,
                comments: '',
                allergies: '',
            }),
        ).rejects.toThrow('Invalid weight');

        expect(mockRepo.update).not.toHaveBeenCalled();
    });
});
