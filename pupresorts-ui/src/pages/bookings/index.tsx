import './index.css';

import type {GridColDef, GridValidRowModel} from "@mui/x-data-grid";
import {useEffect, useMemo, useState} from "react";
import {toast} from "react-toastify";

import {type BookingDto, getMyBookings} from "../../api/api.ts";
import {IconBooking} from "../../assets/IconBooking.tsx";
import {IconEdit} from "../../assets/IconEdit.tsx";
import Button from "../../components/Button";
import Grid from "../../components/Grid";
import {useSearchParams} from "react-router-dom";

const commonFields: GridValidRowModel = {
    width: 130,
    sortable: false,
    align: 'left',
    headerAlign: 'left',
    resizable: false,
    flex: 1,
    minWidth: 180
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

const orderStatusInSpanish: { [key: string]: string } = {
    PENDING_PAYMENT: 'PENDIENTE',
    CONFIRMED: 'CONFIRMADA',
    CANCELLED: 'CANCELADA',
    COMPLETED: 'COMPLETADA',
}

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

const BookingsEmptyOverlay = () => (
    <div className="bookings-empty-overlay">
        <h5 className="h2">¡No tienes ninguna reserva aún!</h5>
        {/*<Button*/}
        {/*    variant="fulfilled"*/}
        {/*    size="large"*/}
        {/*    type="button"*/}
        {/*    rightIcon={IconBooking}*/}
        {/*    onClick={() => (window.location.href = '/booking/new')}*/}
        {/*>*/}
        {/*    Reservar*/}
        {/*</Button>*/}
    </div>
);

export const MyBookings = () => {
    const [rows, setRows] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");


    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getMyBookings();
                setRows(data.map(mapDtoToRow)); // si no hay reservas => []
            } catch (e: any) {
                // Si es falta de auth, no muestres toast (ya redirige el interceptor / o queda la página en blanco)
                if (e?.code === 'UNAUTHORIZED') return;
                if (e?.response?.status === 401 || e?.response?.status === 403) return;
                // Otros errores sí se notifican
                toast('No se pudieron cargar tus reservas', { type: 'error' });
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (success === "true") {
            toast("¡Tu reserva fue creada con éxito!", { type: "success" });
        }
    }, [success]);

    const columnsWithEdit: GridColDef[] = useMemo(
        () => [
            ...columns,
            {
                field: "actions",
                headerName: "",
                width: 60,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                align: "center",
                headerAlign: "center",
                renderCell: (params) => {
                    // normalizamos el estado a mayúsculas por seguridad
                    const status = String(params.row.status || "").toUpperCase();
                    const canEdit = status !== "CANCELADA" && status !== "COMPLETADA";

                    if (!canEdit) return null;

                    return (
                        <button
                            className="grid-icon-button"
                            aria-label={`Editar reserva ${params.row.id}`}
                            title="Editar reserva"
                            onClick={() =>
                                (window.location.href = `/booking/${params.row.id}/edit`)
                            }
                        >
                            <IconEdit size={20} color="var(--grey-900)" />
                        </button>
                    );
                },
            },
        ],
        []
    );

    return (
        <div style={{display: "flex", height: "100%"}}>
            <div className="bookings-general-div">
                <div className="bookings-title">Mis reservas</div>
                <div className="bookings-grid-container">
                    <div className="bookings-toolbar">
                        {/*<div className="bookings-toolbar-left">*/}
                        {/*    <Button variant="ghost" size="small" type="button" leftIcon={IconColumns}>*/}
                        {/*        COLUMNAS*/}
                        {/*    </Button>*/}
                        {/*    <Button variant="ghost" size="small" type="button" leftIcon={IconFilter}>*/}
                        {/*        FILTRAR*/}
                        {/*    </Button>*/}
                        {/*</div>*/}
                        <Button
                            variant="fulfilled"
                            size="large"
                            type="button"
                            className="bookings-toolbar-btn-reserve"
                            rightIcon={IconBooking}
                            style={{ paddingLeft: '8px', paddingRight: '8px' }}
                            onClick={() => (window.location.href = '/booking/new')}
                        >
                            Reservar
                        </Button>
                    </div>

                    {/* Grid con overlay custom */}
                    <Grid
                        rows={rows}
                        columns={columnsWithEdit}
                        loading={loading}
                        NoRowsOverlay={BookingsEmptyOverlay}
                    />
                </div>
            </div>
        </div>
    );
}