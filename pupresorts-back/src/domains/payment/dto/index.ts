export type CheckoutRequest = {
    userId: string;
    hotelBranch: string;
    room: string;
    startDate: string;
    endDate: string;
    dogId: string;
    price: number;
}