import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserService } from '../src/domains/user/user.service';
import { UserRepository } from '../src/domains/user/user.repository';

type UserEntity = {
    id: string;
    email: string;
    password: string;
    name: string | null;
    lastName: string | null;
    createdAt: Date;
    updatedAt: Date;
};

describe('UserService - getUserById', () => {
    let userService: UserService;
    let mockRepo: jest.Mocked<Pick<UserRepository, 'getUserById'>>;

    beforeEach(() => {
        mockRepo = { getUserById: jest.fn() } as any;
        userService = new UserService(mockRepo as unknown as UserRepository);
    });

    const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
        id: '1',
        email: 'u@test.com',
        password: 'hashed',
        name: 'User',
        lastName: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        ...overrides,
    });

    it('should return a valid user dto without password if exists', async () => {
        const entity = makeUser({ id: '1' });
        mockRepo.getUserById.mockResolvedValue(entity);

        const result = await userService.getUserById('1');

        expect(result).toMatchObject({
            email: 'u@test.com',
            name: 'User',
            lastName: null,
        });
        expect(result).not.toHaveProperty('password'); // <- clave
    });

    it('should throw NotFound if user does not exist', async () => {
        mockRepo.getUserById.mockResolvedValue(null);

        await expect(userService.getUserById('999'))
            .rejects
            .toThrow(/Not Found|User not found/i);

        expect(mockRepo.getUserById).toHaveBeenCalledWith('999');
    });
});
