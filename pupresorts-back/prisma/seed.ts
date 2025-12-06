import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";
const prisma = new PrismaClient()
async function main(){
    const plainPassword = 'Tester123!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    const testUser = await prisma.user.upsert({
        where: {email: 'test@gmail.com' },
        update: {},
        create: {
            email: 'test@gmail.com',
            name: 'Test',
            lastName: 'User',
            password: hashedPassword,
        },
    });

    const ownerId = testUser.id;

    const dog1 = await prisma.dog.create({
        data: {
            id: 'perroUno',
            name: 'Max',
            birthDate: new Date('2020-05-15T00:00:00Z'),
            breed: 'Golden Retriever',
            weight: 30.5,
            dailyMedicine: false,
            comments: "Jugueton",
            allergies: "None",
            ownerId: ownerId,
        },
    });

    const dog2 = await prisma.dog.create({
        data: {
            id: 'perroDos',
            name: 'Juno',
            birthDate: new Date('2020-05-15T00:00:00Z'),
            breed: 'Yorkshire',
            weight: 3.5,
            dailyMedicine: false,
            comments: "Timido",
            allergies: "None",
            ownerId: ownerId,
        },
    });

    const dog3 = await prisma.dog.create({
        data: {
            id: 'perroTres',
            name: 'Toby',
            birthDate: new Date('2020-05-15T00:00:00Z'),
            breed: 'Caniche',
            weight: 2.5,
            dailyMedicine: false,
            comments: "Gruñon",
            allergies: "None",
            ownerId: ownerId,
        },
    });

    console.log('Seed data created successfully.');
}

main()
.catch((e) => {
    console.error(e);
})
.finally(async () => {
    await prisma.$disconnect();
});