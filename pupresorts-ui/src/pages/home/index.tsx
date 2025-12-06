import './index.css';

import type {GridColDef, GridValidRowModel} from "@mui/x-data-grid";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";

import {type BookingDto, getDogsByOwner, getMyBookings, getUserData} from "../../api/api.ts";
import DogCard from "../../components/DogCard";
import Grid from "../../components/Grid";
import NewDog from "../../components/NewDog";
import type {DogData} from "../../interfaces";
import BookingCard, {type BookingDTO} from "../../components/BookingCard";
import {useNavigate} from "react-router-dom";

const commonFields: GridValidRowModel = {
    width: 130,
    sortable: false,
    align: 'left',
    headerAlign: 'left',
    resizable: false,
    flex: 1,
    minWidth: 130
}

type BookingRow = {
    id: string;
    dog: string;
    hotel_branch: string;
    initial_date: string;
    end_date: string;
    status: string;
};

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'Id',
        ...commonFields,
        type: 'number',
    },
    {
        field: 'dog',
        headerName: 'Perro',
        ...commonFields,
        type: 'string'
    },
    {
        field: 'hotel_branch',
        headerName: 'Sede',
        ...commonFields,
        type: 'string'
    },
    {
        field: 'initial_date',
        headerName: 'Fecha de inicio',
        ...commonFields,
        valueFormatter: (params: string) => {
            return params.slice(0, 10).split('-').reverse().join('/');
        }
    },
    {
        field: 'end_date',
        headerName: 'Fecha de fin',
        ...commonFields,
        valueFormatter: (params: string) => {
            return params.slice(0, 10).split('-').reverse().join('/');
        }
    },
    {
        field: 'status',
        headerName: 'Estado',
        ...commonFields,
        type: 'string'
    },
];

function mapDtoToRow(b: BookingDto): BookingRow {
    return {
        id: b.id,
        dog: b.dog?.name ?? b.dogId,
        hotel_branch: b.hotelBranch,
        initial_date: b.startDate,
        end_date: b.endDate,
        status: orderStatusInSpanish[b.orderStatus],
    };
}

const orderStatusInSpanish: { [key: string]: string } = {
    PENDING_PAYMENT: 'PENDIENTE',
    CONFIRMED: 'CONFIRMADA',
    CANCELLED: 'CANCELADA',
    COMPLETED: 'COMPLETADA',
}

const BookingsEmptyOverlay = () => (
    <div className="bookings-empty-overlay">
        <h5 className="h2">¡No tienes ninguna reserva aún!</h5>
    </div>
);

export const Home = () => {
    const [user, setUser] = useState<{ name: string; lastName: string; email: string; } | null>(null);
    const [rows, setRows] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [dog, setDog] = useState<DogData | null>(null);
    const [lastConfirmedBooking, setLastConfirmedBooking] = useState<BookingDTO>();
    const navigate = useNavigate();

    const fetchUserData = async () => {
        try {
            const userData = await getUserData();
            setUser(userData);
        } catch (error) {
        }
    }
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getMyBookings();

            setRows(data.map(mapDtoToRow));

            const confirmedBookings = data
                .filter(b => b.orderStatus === 'COMPLETED' || b.orderStatus === 'CONFIRMED')
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

            if (confirmedBookings.length > 0) {
                const latestBookingDto = confirmedBookings[0];

                const bookingCardData: BookingDTO = {
                    id: latestBookingDto.id,
                    dogId: latestBookingDto.dogId,
                    dogName: latestBookingDto.dog?.name,
                    startDate: latestBookingDto.startDate,
                    endDate: latestBookingDto.endDate,
                    hotelBranch: latestBookingDto.hotelBranch,
                };

                setLastConfirmedBooking(bookingCardData);
            }

        } catch (e: any) {
            toast('No se pudieron cargar tus reservas', {type: 'error'});
        } finally {
            setLoading(false);
        }
    }

    function calculateAge(birthDateString: string): number {
        const birthDate = new Date(birthDateString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    }

    const fetchDogData = async () => {
        try {
            const dogData = await getDogsByOwner();
            if (Array.isArray(dogData) && dogData.length > 0) {
                setDog({
                    id: dogData[0].id,
                    name: dogData[0].name,
                    age: calculateAge(dogData[0].birthDate),
                    breed: dogData[0].breed,
                    imageUrl: dogData[0].imageUrl,
                    birthDate: dogData[0].birthDate,
                    weight: dogData[0].weight,
                    dailyMedicine: dogData[0].dailyMedicine,
                });
            } else {
                setDog(null);
            }
        } catch (error) {
            setDog(null);
        }
    };

    useEffect(() => {
        fetchUserData().then();
        fetchBookings().then();
        fetchDogData().then();
    }, [])

    return (
            <div className="home-general-div">
                <h1 className="home-title">¡Hola, {user?.name}!</h1>
                <div className="home-content-div">
                    <div className="home-form-and-cards-div">
                        <Grid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            NoRowsOverlay={BookingsEmptyOverlay}
                        />
                    </div>
                    <div className="cards-div">
                        {dog ? (
                            <DogCard
                                id={dog.id}
                                name={dog.name}
                                age={dog.age}
                                breed={dog.breed}
                                imageUrl={dog.imageUrl}
                                onEdit={() => navigate(`/dog/edit/${dog.id}`)}
                                onDelete={() => fetchDogData().then()}
                            />
                        ) : (
                            <NewDog />
                        )}
                        {

                        }
                        <BookingCard booking={lastConfirmedBooking}/>
                    </div>
                </div>
            </div>
    )
}
