import "./index.css";

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { Form,Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useLocation,useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";

import {cancelBooking, getBookingById, getDogsByOwner, updateBooking} from "../../api/api";
import Button from "../../components/Button";
import Textfield from "../../components/Textfield";
import type {DogData} from "../../interfaces";


type BookingEditValues = {
    startDate: string;
    endDate: string;
    dogId: string;
};

const EditSchema: Yup.ObjectSchema<BookingEditValues> = Yup.object({
    dogId: Yup.string().required("Este campo es requerido"),
    startDate: Yup.string()
        .required("Este campo es requerido"),
    endDate: Yup.string()
        .required("Este campo es requerido")
        .test("end-after-start", "La fecha de fin debe ser posterior al inicio", function (val) {
            const { startDate } = this.parent as BookingEditValues;
            if (!val || !startDate) return false;
            return new Date(val).getTime() > new Date(startDate).getTime();
        }),
});

export default function BookingEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation() as { state?: any };

    const [initial, setInitial] = useState<BookingEditValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [dogs, setDogs] = useState<DogData[]>([]);

    const toInputDate = (iso?: string) => (iso ? (iso.length > 10 ? iso.slice(0, 10) : iso) : "");

    useEffect(() => {
        (async () => {
            try {
                const row = location.state?.row;
                if (row) {
                    setInitial({
                        startDate: toInputDate(row.startDate),
                        endDate: toInputDate(row.endDate),
                        dogId: row.dogId ?? row.dog?.id ?? "",
                    });
                    return;
                }

                const b = await getBookingById(id??"");
                if (!b) throw new Error("Reserva no encontrada");
                setInitial({
                    startDate: toInputDate(b.startDate),
                    endDate: toInputDate(b.endDate),
                    dogId: b.dogId ?? b.dog?.id ?? "",
                });
            } catch (e: any) {
                toast(e?.message ?? "No se pudo cargar la reserva", { type: "error" });
                navigate("/my_bookings");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, navigate, location.state]);

    useEffect(() => {
        (async () => {
            try {
                const result = await getDogsByOwner();
                setDogs(Array.isArray(result) ? result : []);
            } catch {
                toast("No se pudieron cargar tus perros", { type: "error" });
            }
        })();
    }, []);

    const safeInitial = useMemo(
        () =>
            initial ?? {
                startDate: "",
                endDate: "",
                dogId: "",
            },
        [initial]
    );

    const onSubmit = async (values: BookingEditValues) => {
        try {
            await updateBooking(id!, {
                dogId: values.dogId,
                newStartDate: values.startDate,
                newEndDate: values.endDate,
            });
            toast("Cambios guardados", { type: "success" });
            navigate("/my_bookings");
        } catch (e: any) {
            const msg = e?.response?.data?.error || e?.response?.data?.message || "No se pudo guardar";
            toast(msg, { type: "error" });
        }
    };

    const onCancelBooking = async () => {

        try {
            await cancelBooking(id!);
            toast("Reserva cancelada", { type: "success" });
            navigate("/my_bookings");
        } catch {
            toast("No se pudo cancelar la reserva", { type: "error" });
        } finally {
            setIsCancelModalOpen(false);
        }
    };
    const onOpenCancelModal = () => {
        setIsCancelModalOpen(true);
    };

    const handleCloseCancelModal = () => {
        setIsCancelModalOpen(false);
    };

    const dogsForSelect = useMemo(() => {
        const exists = dogs.some((d) => d.id === safeInitial.dogId);
        return exists ? dogs : dogs;
    }, [dogs, safeInitial.dogId]);

    if (loading) return null;

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="booking-page">
            <div className="booking-title-wrap">
                <h1 className="title-1">Editar reserva</h1>
            </div>

            <div className="booking-container">
                <div className="booking-hero">
                    <h2 className="section-title">General</h2>
                    <p className="section-subtitle">Complete con la información general de su reserva</p>
                </div>

                <Formik enableReinitialize initialValues={safeInitial} validationSchema={EditSchema} onSubmit={onSubmit}>
                    {({ values, handleChange, touched, errors, setFieldValue }) => (
                        <Form className="booking-form-grid">
                            {/* Inicio */}
                            <div className="form-row">
                                <Textfield
                                    label="Inicio de la estadía *"
                                    type="date"
                                    name="startDate"
                                    value={values.startDate}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setFieldValue("endDate", "");
                                    }}
                                    helperText={touched.startDate && (errors.startDate as string)}
                                    variant={touched.startDate && errors.startDate ? "error" : "default"}
                                    min={today}
                                />
                            </div>

                            {/* Fin */}
                            <div className="form-row">
                                <Textfield
                                    label="Fin de la estadía *"
                                    type="date"
                                    name="endDate"
                                    value={values.endDate}
                                    onChange={handleChange}
                                    helperText={touched.endDate && (errors.endDate as string)}
                                    variant={touched.endDate && errors.endDate ? "error" : "default"}
                                    min={values.startDate || today}
                                />
                            </div>

                            {/* Mi perro */}
                            <div className="form-row">
                                <label className="form-label" htmlFor="dogId">Mi perro *</label>
                                <div className="select-wrap">
                                    <select
                                        id="dogId"
                                        name="dogId"
                                        className="form-select"
                                        value={values.dogId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Elegir perro</option>
                                        {dogsForSelect.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {touched.dogId && errors.dogId && <div className="form-error">{errors.dogId}</div>}
                            </div>

                            <div className="form-actions span-2">
                                <Button type="button" variant="outlined" size="large" onClick={onOpenCancelModal}>
                                    Cancelar reserva
                                </Button>
                                <Button type="submit" variant="fulfilled" size="large">
                                    Guardar cambios
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
                <Modal className="modal-cancel-booking"
                    open={isCancelModalOpen}
                    onClose={handleCloseCancelModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        fontFamily: 'var(--font-primary)'
                    }}>
                        <Typography id="modal-title" variant="h6" component="h2" >
                            Estás seguro de que queres cancelar tu reserva?
                        </Typography>
                        <Typography id="modal-title" component="h1" sx={{mt: 2}}>
                            Esta acción es irreversible.
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Tené en cuenta que el monto de la seña no será reembolsado.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                        <Button
                            onClick={handleCloseCancelModal}
                            variant="outlined"
                        >
                            No
                        </Button>
                        <Button
                            onClick={onCancelBooking}
                            variant="fulfilled"
                            className="btn-confirm-cancel"
                        >
                            Sí, cancelar
                        </Button>
                    </Box>
                    </Box>
                </Modal>
            </div>
        </div>
    );
}
