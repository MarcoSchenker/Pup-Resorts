interface UserInputDto {
    email: string;
    password: string;
    name: string | null;
    lastName: string | null;
}

interface LoginInputDto {
    email: string;
    password: string;
}

interface UserAuthDto {
    name: string | null;
    lastName: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}