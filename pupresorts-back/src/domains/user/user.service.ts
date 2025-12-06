import { UserRepository } from './user.repository';
import {ForbiddenException, NotFoundException, ValidationException} from "../../utils/errors";
import {EditUserDto, UserDto} from "../../domains/user/dto";
import bcrypt from "bcrypt";

export class UserService {

    constructor(private readonly userRepository: UserRepository) {}

    async getUserById(id: string): Promise<UserDto | null> {
        const user = await this.userRepository.getUserById(id);

        if (!user) {
            NotFoundException({message: 'User not found'})
        }
        return {
            email: user.email,
            name: user.name,
            lastName: user.lastName
        };
    }

    async editUser(authUserId: string, targetUserId: string, payload: EditUserDto): Promise<UserDto> {
        if (authUserId !== targetUserId) {
            ForbiddenException({ message: "You can only edit your own profile" });
        }

        const current = await this.userRepository.getUserById(targetUserId);
        if (!current) NotFoundException({ message: "User not found" });

        const data: EditUserDto = {};

        if (payload.name !== undefined) data.name = payload.name?.trim() ?? null;
        if (payload.lastName !== undefined) data.lastName = payload.lastName?.trim() ?? null;
        if (payload.email !== undefined) data.email = payload.email.trim().toLowerCase();

        if (data.email && data.email !== current.email) {
            const exists = await this.userRepository.getUserByEmailDifferentId(data.email, targetUserId);
            if (exists) ValidationException({ message: "Email is already in use" });
        }

        if (payload.password && payload.password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(payload.password, salt);
        }

        const updated = await this.userRepository.updateUser(targetUserId, data);

        return {
            email: updated.email,
            name: updated.name,
            lastName: updated.lastName,
        };
    }
}