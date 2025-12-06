import "./index.css";

import {Form, Formik} from "formik";
import {useEffect, useMemo, useState} from "react";
import {toast} from "react-toastify";
import * as Yup from "yup";

import {doPayment, getDogsByOwner} from "../../api/api.ts";
import {IconInfo} from "../../assets/IconInfo";
import Mp from "../../assets/MercadoPago.png"
import Button from "../../components/Button";
import Hero from "../../components/Hero";
import Textfield from "../../components/Textfield";
import {useSearchParams} from "react-router-dom";
import type { DogData } from "../../interfaces/index.tsx";

const BRANCHES = [
    {id: "Recoleta", label: "Recoleta"},
    {id: "Belgrano", label: "Belgrano"},
    {id: "Pilar", label: "Pilar"},
    {id: "Caballito", label: "Caballito"},
];

const ROOMS = [
    {id: "standard", label: "Standard", nightly: 10000},
    {id: "deluxe", label: "Deluxe", nightly: 15000},
];

type BookingFormValues = {
    hotelBranch: string;
    room: string;
    startDate: string;
    endDate: string;
    dogId: string;
};

export interface BookingFormValuesWithPrice extends BookingFormValues {
    price: number;
}

const calcNights = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (Number.isNaN(ms) || ms <= 0) return 0;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const calcTotal = (roomId: string, start?: string, end?: string) => {
    const nights = calcNights(start, end);
    const room = ROOMS.find((r) => r.id === roomId);
    if (!room || nights === 0) return 0;
    return nights * room.nightly;
};

const BookingSchema: Yup.ObjectSchema<BookingFormValues> = Yup.object({
    hotelBranch: Yup.string().required("Este campo es requerido"),
    room: Yup.string().required("Este campo es requerido"),
    startDate: Yup.string()
        .required("Este campo es requerido"),
    endDate: Yup.string()
        .required("Este campo es requerido")
        .test("end-after-start", "La fecha de fin debe ser posterior al inicio", function (val) {
            const {startDate} = this.parent as BookingFormValues;
            if (!val || !startDate) return false;
            return new Date(val).getTime() > new Date(startDate).getTime();
        }),
    dogId: Yup.string().required("Este campo es requerido"),
});


function Fields({
                    values,
                    handleChange,
                    touched,
                    errors,
                    setFieldValue,
                    dogOptions
                }: {
    values: BookingFormValues;
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
    touched: any;
    errors: any;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
    dogOptions: Pick<DogData, "id" | "name">[];
}) {
    const total = calcTotal(values.room, values.startDate, values.endDate);
    const nights = calcNights(values.startDate, values.endDate);
    const today = new Date().toISOString().split('T')[0]

    return (
        <Form className="booking-form-grid">
            <div className="form-row">
                <label className="form-label" htmlFor="hotelBranch">Sede *</label>
                <div className="select-wrap">
                    <select
                        id="hotelBranch"
                        name="hotelBranch"
                        className="form-select"
                        value={values.hotelBranch}
                        onChange={handleChange}
                    >
                        <option value="">Elegir</option>
                        {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                    </select>
                </div>
                {touched.hotelBranch && errors.hotelBranch && <div className="form-error">{errors.hotelBranch}</div>}
            </div>

            <div className="form-row">
                <label className="form-label" htmlFor="room">Habitación (precio por noche) *</label>
                <div className="select-wrap">
                    <select
                        id="room"
                        name="room"
                        className="form-select"
                        value={values.room}
                        onChange={handleChange}
                    >
                        <option value="">Elegir</option>
                        {ROOMS.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.label} (ARS ${r.nightly.toLocaleString("es-AR")}/noche)
                            </option>
                        ))}
                    </select>
                </div>
                {touched.room && errors.room && <div className="form-error">{errors.room}</div>}
            </div>

            <div className="form-row">
                <Textfield
                    label="Inicio de la estadía *"
                    type="date"
                    name="startDate"
                    value={values.startDate}
                    onChange={(e) => {
                        handleChange(e)
                        setFieldValue("endDate", "")
                    }}
                    helperText={touched.startDate && errors.startDate}
                    variant={touched.startDate && errors.startDate ? "error" : "default"}
                    min={today}
                />
            </div>

            <div className="form-row">
                <Textfield
                    label="Fin de la estadía *"
                    type="date"
                    name="endDate"
                    value={values.endDate}
                    onChange={handleChange}
                    helperText={touched.endDate && errors.endDate}
                    variant={touched.endDate && errors.endDate ? "error" : "default"}
                    min={values.startDate || today}
                />
            </div>

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
                        {dogOptions.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                    </select>
                </div>
                {touched.dogId && errors.dogId && <div className="form-error">{errors.dogId}</div>}
            </div>

            <div className="total-cell">
                <div className="total-inline">
                    <span className="total-title">Total: </span>
                    <span className="total-amount">${total.toLocaleString("es-AR")}</span>
                    <div className="tooltip total-tooltip" role="tooltip">
                        <IconInfo size={20} color={"var(--primary-500)"}/>
                        <div className="tooltip-panel tooltip-breakdown">
                            <ul>
                                {values.room && (
                                    <li>
                                        1 {ROOMS.find(r => r.id === values.room)?.label.toLowerCase()} (
                                        ${ROOMS.find(r => r.id === values.room)?.nightly.toLocaleString("es-AR")})
                                    </li>
                                )}
                                <li>{nights || 0} noche{nights === 1 ? "" : "s"}</li>
                            </ul>
                            <div className="tooltip-total">
                                Total: ${ROOMS.find(r => r.id === values.room)?.nightly.toLocaleString("es-AR") || 0}
                                {" "}* {nights || 0} = ${total.toLocaleString("es-AR")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-actions span-2">
                <Button type="submit" variant="fulfilled" size="large">
                    Siguiente
                </Button>
            </div>
        </Form>
    );
}

/* ── Página ─────────────────────────────────────────────────────────── */
export default function BookingNew() {
    const [searchParams] = useSearchParams();

    const [dogOptions, setDogOptions] = useState<Pick<DogData, "id" | "name">[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const dogs = await getDogsByOwner();
                setDogOptions((dogs ?? []).map((d) => ({ id: d.id, name: d.name })));
            } catch (err) {
                console.error("Error fetching dogs:", err);
                toast("Ocurrió un error al cargar tus perros", { type: "error" });
                setDogOptions([]);
            }
        })();
    }, []);

    const [formValues, setFromValues] = useState<BookingFormValuesWithPrice>({
        hotelBranch: '',
        room: '',
        startDate: '',
        endDate: '',
        dogId: '',
        price: 0
    });
    const [isFirst, setIsFirst] = useState(true);

    const initialValues: BookingFormValues = useMemo(
        () => ({
            hotelBranch: formValues?.hotelBranch || searchParams.get("hotelBranch") || "",
            room: formValues?.room ?? "",
            startDate: formValues?.startDate ?? "",
            endDate: formValues?.endDate ?? "",
            dogId: formValues?.dogId || searchParams.get("dogId") || ""
        }),
        [formValues, searchParams]
    );

    const handleSaveValues = (values: BookingFormValues) => {
        const price = calcTotal(values.room, values.startDate, values.endDate);
        setFromValues({...values, price});
        setIsFirst(false)
    };

    const handleGoToPayment = async (values: BookingFormValuesWithPrice) => {
        try {
            const payload = {...values, price: values.price * 0.1} // 10% de seña
            const {data} = await doPayment(payload);
            if (data && data.initPoint) {
                window.location.href = data.initPoint;
            }
        }
        catch (e){
            toast("Error procesando el pago", {type: "error"});
        }
    }

    if (isFirst) {
        return (
            <div className="booking-page">
                <div className="booking-title-wrap">
                    <h1 className="title-1">Crear reserva</h1>
                </div>

                <div className="booking-container">
                    <Hero stepVariant={"reserva-step1"} Title={"General"} SubTitle={"Complete con la información general de su reserva"}/>
                    <Formik initialValues={initialValues} validationSchema={BookingSchema} onSubmit={handleSaveValues}>
                        {(formik) => <Fields {...formik}  dogOptions={dogOptions} />}
                    </Formik>
                </div>
            </div>
        );
    } else {
        return (
            <div className="booking-page">
                <div className="booking-title-wrap">
                    <h1 className="title-1">Crear reserva</h1>
                </div>
                    <Hero stepVariant={"reserva-step2"} Title={"Pago"} SubTitle={"Complete el pago de su reserva"}/>
                <div className="booking-container">
                    <div className="mp-container">
                        <img className="mpLogo" alt="mercado pago" src={Mp}/>
                        <p className="mpText">El monto a abonar representa la seña de la reserva, en caso de cancelarla el monto no será reembolsado.</p>
                        <p className="mpText">En el hotel se abonará el saldo restante.</p>
                    </div>
                    <div className="form-actions span-2">
                        <Button variant="outlined" size="large" className="mpButton" onClick={() => setIsFirst(true)}>
                            Volver
                        </Button>
                        <Button onClick={() => handleGoToPayment(formValues)} variant="fulfilled" size="large" className="mpButton">
                            Ir a mercado pago
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}
