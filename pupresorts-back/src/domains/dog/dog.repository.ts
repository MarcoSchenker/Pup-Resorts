import { PrismaClient } from '@prisma/client';

type dogData = {
    name: string;
    birthDate: Date;
    breed: string;
    weight: number;
    dailyMedicine: boolean;
    comments: string;
    allergies: string;
    ownerId: string;
    imageUrl: string | null;
};

export class DogRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: dogData) {
        return this.prisma.dog.create({ data });
    }
    async findByOwner(ownerId: string) {
        return this.prisma.dog.findMany({
            where: {
                ownerId: ownerId,
                isDeleted: false,
            },
        });
    }

    async findById(id: string) {
        return this.prisma.dog.findFirst({
            where: {
                id: id,
                isDeleted: false
            },
        });
    }

    async update(id: string, data: dogData) {
        return this.prisma.dog.update({
                where: { id },
                data,
            }
        )
    }

    async delete(id: string){
        return this.prisma.dog.update({
            where: { id },
            data: { isDeleted: true},
        })
    }
}