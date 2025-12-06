import {DogRepository} from "@src/domains/dog/dog.repository";
import {DogDto, DeletedDogDto} from "@src/domains/dog/dto";
import {v4 as uuidv4} from "uuid";
import {S3Service} from "@src/utils/s3";

export class DogService {
    constructor(private readonly dogRepository: DogRepository) {}

    async getDogById(id: string, requesterUserId: string) {
        const dog = await this.dogRepository.findById(id);
        if (!dog) throw new Error("Dog not found");
        if (dog.ownerId !== requesterUserId) {
            const err: any = new Error("Forbidden: you are not the owner of this dog");
            err.status = 403;
            throw err;
        }

        const dogDto: DogDto = {
            id: dog.id,
            name: dog.name,
            birthDate: dog.birthDate.toISOString(),
            breed: dog.breed,
            weight: dog.weight,
            dailyMedicine: dog.dailyMedicine,
            comments: dog.comments,
            allergies: dog.allergies,
            ownerId: dog.ownerId,
            imageUrl: dog.imageUrl ?? undefined,
        };
        return { dog: dogDto };
    }

    async createDog(params: {
        name: string,
        birthDate: Date,
        breed: string,
        weight: number,
        dailyMedicine: boolean,
        comments: string,
        allergies: string,
        ownerId: string,
    }) {
        const { name, birthDate, breed, weight, dailyMedicine, comments, allergies, ownerId } = params;
        const key =  `${uuidv4()}`;
        const signedUrl = await S3Service.getUploadSignedUrl(key)
        const publicUrl = S3Service.getPublicS3Url(key)

        const dog = await this.dogRepository.create({
            name,
            birthDate,
            breed,
            weight,
            dailyMedicine,
            comments,
            allergies,
            ownerId,
            imageUrl: publicUrl
        });

        const dogDto : DogDto = {
            id: dog.id,
            name: dog.name,
            birthDate: dog.birthDate.toISOString(),
            breed: dog.breed,
            weight: dog.weight,
            dailyMedicine: dog.dailyMedicine,
            comments: dog.comments,
            allergies: dog.allergies,
            ownerId: dog.ownerId,
            imageUrl: dog.imageUrl
        };
        return { dog: dogDto, upload_url: signedUrl };
    }

    async getDogsByOwner(ownerId: string) {
        const dogs =await this.dogRepository.findByOwner(ownerId);
        return {dogs: dogs};
    }

    async updateDog(id: string,
                    editorUserId: string,
                    params: {
                        name: string;
                        birthDate: string;
                        breed: string;
                        weight: number;
                        dailyMedicine: boolean;
                        comments: string;
                        allergies: string;
                        imageUrl?: string;
                    }){
        const existing = await this.dogRepository.findById(id);
        if (!existing) throw new Error("Dog not found");

        if (existing.ownerId !== editorUserId) {
            const err: any = new Error("Forbidden: you are not the owner of this dog");
            err.status = 403;
            throw err;
        }

        const date = new Date(params.birthDate);
        if (Number.isNaN(date.getTime())) {
            throw new Error("Invalid birthDate");
        }
        if (typeof params.weight !== "number" || !Number.isFinite(params.weight)) {
            throw new Error("Invalid weight");
        }

        const key = S3Service.extractKeyFromUrl(existing.imageUrl);
        if (!key) {
            throw new Error("Invalid existing image URL, cannot extract key");
        }
        const uploadSignedUrl = await S3Service.getUploadSignedUrl(key);
        const imageUrlToSave = existing.imageUrl;
        const updated = await this.dogRepository.update(id, {
            name: params.name,
            birthDate: date,
            breed: params.breed,
            weight: params.weight,
            dailyMedicine: params.dailyMedicine,
            comments: params.comments,
            allergies: params.allergies,
            ownerId: editorUserId,
            imageUrl: imageUrlToSave
        });

        const dogDto: DogDto = {
            id: updated.id,
            name: updated.name,
            birthDate: updated.birthDate.toISOString(),
            breed: updated.breed,
            weight: updated.weight,
            dailyMedicine: updated.dailyMedicine,
            comments: updated.comments,
            allergies: updated.allergies,
            ownerId: updated.ownerId,
            imageUrl: updated.imageUrl ?? undefined
        };
        if (uploadSignedUrl) {
            return { dog: dogDto, upload_url: uploadSignedUrl };
        }

        return { dog: dogDto };
    }

    async deleteDog(id: string, requesterUserId: string) {
        const dog = await this.dogRepository.findById(id);
        if (!dog) throw new Error("Dog not found");
        if (dog.ownerId !== requesterUserId) {
            const err: any = new Error("Forbidden: you are not the owner of this dog");
            err.status = 403;
            throw err;
        }
        const deleted = await this.dogRepository.delete(id);
        const deletedDogDto: DeletedDogDto = {
            id: dog.id,
            name: dog.name,
            birthDate: dog.birthDate.toISOString(),
            breed: dog.breed,
            weight: dog.weight,
            dailyMedicine: dog.dailyMedicine,
            comments: dog.comments,
            allergies: dog.allergies,
            ownerId: dog.ownerId,
            imageUrl: dog.imageUrl ?? undefined,
            isDeleted: true
        };
        return { dog: deletedDogDto };
    }
}