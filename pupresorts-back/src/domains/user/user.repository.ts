import { PrismaClient } from "@prisma/client";
import {EditUserDto} from "@src/domains/user/dto";

export class UserRepository {

    constructor(private readonly prisma: PrismaClient) {}

    async createUser(data: { name: string; email: string; password: string; lastName: string }) {
        return this.prisma.user.create({
            data,
        });
    }

    async getUserById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async getUserByEmailAndPassword(email: string, password: string) {
        return this.prisma.user.findFirst({
            where: { email, password },
        });
    }

    async getUserByEmailDifferentId(email: string, id: string) {
        return this.prisma.user.findFirst({
            where: { email, NOT: { id } },
            select: { id: true },
        });
    }

    async updateUser(
        id: string,
        data: EditUserDto
    ) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }


    // async deleteUser(id: number) {
    //     return this.prisma.user.delete({
    //         where: { id },
    //     });
    // }
}