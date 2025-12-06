import {UserRepository} from "@src/domains/user/user.repository";
import {ConflictException, NotFoundException, ValidationException} from "@src/utils/errors";
import {checkPassword, encryptPassword, generateAccessToken} from "@src/domains/auth/utils/auth";

export class AuthService {
    constructor(private readonly userRepository: UserRepository) { }

    async signUp(data: UserInputDto): Promise<{ token: string; userAuthDto: UserAuthDto }> {
        const existingUser = await this.userRepository.getUserByEmail(data.email);
        if (existingUser) {
            ConflictException({message: 'User already exists'})
        }

        const encryptedPassword = encryptPassword(data.password)

        const user = await this.userRepository.createUser({
            email: data.email,
            password: await encryptedPassword,
            name: data.name || '',
            lastName: data.lastName || ''
        });

        const token = generateAccessToken({id: String(user.id)});

        const userAuthDto: UserAuthDto = {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
        return {token, userAuthDto};
    }

    async login(data: LoginInputDto): Promise<string> {
        const user = await this.userRepository.getUserByEmail(data.email);
        if (!user) {
            NotFoundException({message: 'User not found'})
        }

        const isPasswordValid = await checkPassword(data.password, user.password)
        if (!isPasswordValid) {
            ValidationException({message: 'Incorrect password'})
        }

        const token = generateAccessToken({ id: String(user.id)})
        return token
    }
}


