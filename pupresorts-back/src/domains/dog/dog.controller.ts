import {PrismaClient} from "@prisma/client";
import {Request, Response, Router} from "express";
import {withAuth} from "@src/domains/auth/utils/auth";
import {DogService} from "@src/domains/dog/dog.service";
import {DogRepository} from "@src/domains/dog/dog.repository";
import multer from "multer";
import { S3Service } from "@src/utils/s3";

const prisma = new PrismaClient()
const repository = new DogRepository(prisma)
const service = new DogService(repository);
export const dogRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
});

dogRouter.post('/new', withAuth, async (req: Request, res: Response) => {
    try {
        const ownerId = res.locals.context.id;
        const {name, birthDate, breed, weight, dailyMedicine, comments, allergies, imageUrl} = req.body;

        const dog = await service.createDog({
            name,
            birthDate: new Date(birthDate),
            breed,
            weight: parseFloat(weight),
            dailyMedicine: dailyMedicine === 'true' || dailyMedicine === true,
            comments,
            allergies,
            ownerId,
        });

        res.status(201).json(dog);
    } catch (e: any) {
        res.status(400).json({error: e.message});
    }
});

dogRouter.get('/getLoggedUserDogs', withAuth, async (req: Request, res: Response) => {
    try {
        const userId = res.locals.context.id;
        const dogs = await service.getDogsByOwner(userId);
        res.json(dogs);
    } catch (e: any) {
        res.status(400).json({error: e.message});
    }
});

dogRouter.put('/edit/:id', withAuth, async (req: Request, res: Response) => {
    try {
        const editorUserId = res.locals.context.id;
        const { id } = req.params;
        const { name, birthDate, breed, weight, dailyMedicine, comments, allergies, imageUrl } = req.body;

        const existing = await repository.findById(id);
        if (!existing) {
            return res.status(404).json({ error: "Dog not found" });
        }

        const result = await service.updateDog(id, editorUserId, {
            name,
            birthDate,
            breed,
            weight: parseFloat(weight),
            dailyMedicine: dailyMedicine === 'true' || dailyMedicine === true,
            comments,
            allergies,
            imageUrl: imageUrl ?? existing.imageUrl
        });


        res.json(result);
    } catch (e: any) {
        res.status(e.status ?? 400).json({ error: e.message });
    }
});

dogRouter.get('/getDogById/:id', withAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ownerId = res.locals.context.id;
        const dog = await service.getDogById(id, ownerId);
        res.json(dog);
    }
    catch (e: any) {
        res.status(e.status ?? 400).json({ error: e.message });
    }
});

dogRouter.delete('/deleteDog/:id', withAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ownerId = res.locals.context.id;
        const dog = await  service.deleteDog(id, ownerId);
        res.json(dog)
    }
    catch (e: any) {
        res.status(e.status ?? 400).json({ error: e.message });
    }
});