export interface RegisterUser{
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginUser{
    email: string;
    password: string;
}

export interface DogData {
    id: string;
    name: string;
    age: number;
    birthDate: string;
    breed: string;
    imageUrl: string | null;
    weight: string;
    dailyMedicine: boolean;
    allergies?: string;
    comments?: string;
}

export interface UpdateDog {
    dog: {
        name: string
        birthDate: string;
        breed: string;
        weight: string;
        dailyMedicine: boolean;
        allergies?: string;
        comments?: string;
        imageUrl: string | null;
    };
    upload_url: {
        uploadUrl: string;
    }
}
