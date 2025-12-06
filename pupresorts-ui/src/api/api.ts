import axios, { AxiosError, type AxiosResponse } from 'axios';

import type {DogData, LoginUser, RegisterUser, UpdateDog} from "../interfaces";
import type {BookingFormValuesWithPrice} from "../pages/BookingNew";
import {getAccessToken} from "../utils/auth.ts";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        throw error;
    }
);

axios.interceptors.response.use(
    function (response : AxiosResponse){
        return response
    },
    function (error: AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)

export async function registerUser(user: RegisterUser){
    try {
        const response = await api.post('api/auth/register', user)
        return response.data as { token: string }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data as string || 'Error registering user')
        } else {
            throw new Error('Unexpected error')
        }
    }

}

export async function loginUser(user: LoginUser){
    try {
        const response = await api.post('api/auth/login', user)
        return response.data as { token: string }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data as string || 'Error logging in user')
        } else {
            throw new Error('Unexpected error')
        }
    }
}

export async function doPayment(checkout : BookingFormValuesWithPrice) {
    try {
        const response = await api.post('api/payments/checkout', checkout)
        return response.data
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data as string || 'Error processing payment')
        } else {
            throw new Error('Unexpected error')
        }
    }
}

export async function getUserData(){
    try {
        const { data } = await api.get<{ name: string; lastName: string; email: string }>('/api/user/me');
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error((error.response?.data as string) || 'Error getting user data');
        }
        throw new Error('Unexpected error');
    }
}

// --- BOOKINGS ---
export type BookingDto = {
    id: string;
    startDate: string;
    endDate: string;
    dogId: string;
    ownerId: string;
    hotelBranch: string;
    price: number;
    orderStatus: string;
    dog?: { id: string; name: string } | null;
};

export async function getMyBookings(): Promise<BookingDto[]> {
    const { data } = await api.get<any>('/api/booking', {
    });

    if (Array.isArray(data)) return data as BookingDto[];
    if (Array.isArray(data?.data)) return data.data as BookingDto[];
    if (Array.isArray(data?.bookings)) return data.bookings as BookingDto[];
    return [];
}

export async function updateBooking(
    id: string,
    payload: { dogId: string; newStartDate: string; newEndDate: string }
) {
    const { data } = await api.put(`/api/booking/${id}`, payload);
    return data;
}

export async function cancelBooking(id: string) {
    const { data } = await api.post(`/api/booking/${id}/cancel`);
    return data;
}

export async function getBookingById(id: string): Promise<BookingDto> {
    const { data } = await api.get<any>(`/api/booking/${id}`);
    return data.booking as BookingDto;
}

export async function getDogsByOwner(): Promise<DogData[]> {
    const { data } = await api.get('/api/dog/getLoggedUserDogs');
    return data.dogs;
}

export async function updateUser(
    id: string,
    payload: { name: string; lastName: string; email: string; password?: string }
) {
    const { data } = await api.put(`/api/user/edit/${id}`, payload);
    return data;
}

export async function getDogById(id: string): Promise<DogData> {
    const { data } = await api.get(`/api/dog/getDogById/${id}`);
    return data.dog;
}

export async function updateDog(id: string, dogData: FormData): Promise<UpdateDog> {
    const { data } = await api.put(`/api/dog/edit/${id}`, dogData);
    return data;
}

export async function uploadImageToS3(presignedUrl: string, file: File): Promise<URL> {
    try {

        const url = new URL(presignedUrl);
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to S3: ${response.statusText}');
        }

        return url;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error('Error uploading image to S3: ${error.message}');
        }
        throw new Error('Unexpected error uploading image to S3');
    }
}

export async function createDog(values: any) {
    const { data } = await api.post("/api/dog/new", values);
    return data;
}

export async function deleteDog(id: string) {
    const { data } = await api.delete(`/api/dog/deleteDog/${id}`);
    return data;
}

export default api