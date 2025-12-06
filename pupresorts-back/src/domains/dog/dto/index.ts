export type DogDto = {
    id: string;
    name: string;
    birthDate: string;
    breed: string;
    weight: number;
    dailyMedicine: boolean;
    comments: string;
    allergies: string;
    ownerId: string;
    imageUrl?: string;
}

export type DeletedDogDto = {
    id: string;
    name: string;
    birthDate: string;
    breed: string;
    weight: number;
    dailyMedicine: boolean;
    comments: string;
    allergies: string;
    ownerId: string;
    imageUrl?: string;
    isDeleted: true
}