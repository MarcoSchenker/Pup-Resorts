export interface UserDto {
    email: string;
    name: string | null;
    lastName: string | null;
}

export interface EditUserDto {
    name?: string | null;
    lastName?: string | null;
    email?: string;
    password?: string;
}