import "./index.css";

import {Form, Formik} from "formik";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import * as Yup from "yup";

import Button from "../../components/Button";
import FileUploader from "../../components/FileUploader";
import Hero from "../../components/Hero";
import Textfield from "../../components/Textfield";
import {createDog, uploadImageToS3} from "../../api/api.ts";

const BREED = [
    {id: "Labrador Retriever", name: "Labrador Retriever"},
    {id: "Pastor Alemán", name: "Pastor Alemán"},
    {id: "Golden Retriever", name: "Golden Retriever"},
    {id: "Bulldog", name: "Bulldog"},
    {id: "Pomeranian", name: "Pomeranian"},
    {id: "Labradoodle", name: "Labradoodle"},
    {id: "Rottweiler", name: "Rottweiler"},
    {id: "Caniche", name: "Caniche"},
    {id: "Boxer", name: "Boxer"},
];

export type DogFormValues = {
    name: string;
    birthdate: string;
    breed: string;
    image: File | null;
}

const DogSchema = Yup.object({
    name: Yup.string().required("Este campo es obligatorio"),
    birthdate: Yup.string().required("Este campo es obligatorio"),
    breed: Yup.string().required("Este campo es obligatorio"),
    image: Yup.mixed().required("La imagen es obligatoria").test(
        "is-file-or-url",
        "La imagen es obligatoria",
        (value) => {
            return value instanceof File || (typeof value === "string" && value.length > 0);
        }
    ),
});

function Fields({
                    values,
                    handleChange,
                    touched,
                    errors,
                    setFieldValue,
                }: {
    values: DogFormValues;
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
    touched: any;
    errors: any;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}) {
    const today = new Date().toISOString().split('T')[0]

    return (
        <Form className="dog-form-grid">
            <div className="ImageUploader-container">
                <FileUploader
                    onImageSelect={(file: File | null) => setFieldValue('image', file)}
                    selectedImage={values.image}
                />
                {touched.image && errors.image && (
                    <div className="form-error" style={{marginTop: '8px', textAlign: 'center'}}>
                        {errors.image}
                    </div>
                )}
            </div>
            <div className="form-inputs">
                <div className="form-row">
                    <Textfield
                        label="Nombre *"
                        placeholder="Pepe"
                        type="text"
                        name="name"
                        onChange={handleChange}
                        value={values.name}
                        helperText={touched.name && errors.name}
                        variant={touched.name && errors.name ? "error" : "default"}
                    />
                </div>
                <div className="form-row">
                    <Textfield
                        label="Fecha de nacimiento *"
                        type="date"
                        name="birthdate"
                        value={values.birthdate}
                        onChange={handleChange}
                        helperText={touched.birthdate && errors.birthdate}
                        variant={touched.birthdate && errors.birthdate ? "error" : "default"}
                        max={today}
                    />
                </div>
                <div className="form-row">
                    <label className="form-label" htmlFor="breed">Raza *</label>
                    <div className="select-wrap">
                        <select
                            id="breed"
                            name="breed"
                            className="form-select"
                            value={values.breed}
                            onChange={handleChange}
                        >
                            <option value="">Elegir</option>
                            {BREED.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    {touched.breed && errors.breed && <div className="form-error">{errors.breed}</div>}
                </div>
                <div className="form-actions span-2">
                    <Button type="submit" form="dog-form" variant="fulfilled" size="large">
                        Siguiente
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default function AddDog() {

    const navigate = useNavigate();

    const [isFirst, setIsFirst] = useState(true);

    const TAKES_MEDICINE = [
        {id: "Si", name: "Si"},
        {id: "No", name: "No"},
    ];

    type HealthFormValues = {
        weight: string;
        takesMedicine: string;
        allergies?: string;
        notes?: string;
    }

    type FullDogForm = DogFormValues & HealthFormValues

    const initialValues: FullDogForm = {
        name: "",
        birthdate: "",
        breed: "",
        weight: "",
        takesMedicine: "",
        allergies: "",
        notes: "",
        image: null
    };

    const HealthSchema: Yup.ObjectSchema<HealthFormValues> = Yup.object({
        weight: Yup.string().required("Este campo es obligatorio"),
        takesMedicine: Yup.string().required("Este campo es obligatorio"),
        allergies: Yup.string().optional(),
        notes: Yup.string().optional(),
    });

    const handleNext = async (
        _values: FullDogForm,
        validateForm: () => Promise<Record<string, string>>
    ) => {
        const errors = await validateForm();
        const step1Keys: (keyof DogFormValues)[] = ["name", "birthdate", "breed"];
        const hasStep1Errors = step1Keys.some((k) => !!errors[k as string]);
        if (hasStep1Errors) return;
        setIsFirst(false);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleFinish = async (values: FullDogForm) => {
        try {
            const payload = {
                name: values.name,
                birthDate: values.birthdate,
                breed: values.breed,
                weight: typeof values.weight === "string" ? parseFloat(values.weight) : values.weight,
                dailyMedicine: values.takesMedicine === "Si",
                comments: values.notes ?? "",
                allergies: values.allergies ?? null,
            };

            const response = await createDog(payload as any);

            const signed = response?.upload_url?.uploadUrl
            // upload image
            toast("Subiendo imagen...", { type: "info" });
            await uploadImageToS3(signed, values.image as File);

            toast("Perro guardado correctamente", { type: "success" });
            navigate("/my_dogs");
        } catch (err: any) {
            console.error("handleFinish error:", err);
            console.error("handleFinish err.response?.data:", err?.response?.data);
            toast(err?.response?.data?.error || err.message || "No se pudo guardar el perro", { type: "error" });
        }
    };

    const Health = (formik: any) => {
        const {values, handleChange, touched, errors} = formik;

        return (
            <Form className="dog-form-grid">
                <div className="form-inputs-health">
                <div className="form-row">
                    <Textfield
                        label="Peso(kg) *"
                        type="text"
                        name="weight"
                        onChange={handleChange}
                        value={values.weight}
                        helperText={touched.weight && errors.weight}
                        variant={touched.weight && errors.weight ? "error" : "default"}
                    />
                </div>

                <div className="form-row">
                    <label className="form-label" htmlFor="takesMedicine">Medicamento diario *</label>
                    <div className="select-wrap">
                        <select
                            id="takesMedicine"
                            name="takesMedicine"
                            className="form-select"
                            value={values.medicine}
                            onChange={handleChange}
                        >
                            <option value="">Elegir</option>
                            {TAKES_MEDICINE.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    {touched.takesMedicine && errors.takesMedicine &&
                        <div className="form-error">{errors.takesMedicine}</div>}
                </div>

                <div className="form-row">
                    <Textfield
                        label="Alergias"
                        placeholder="Al polen"
                        type="text"
                        name="allergies"
                        onChange={handleChange}
                        value={values.allergies}
                        helperText={touched.allergies && errors.allergies}
                        variant={touched.allergies && errors.allergies ? "error" : "default"}
                    />
                </div>

                <div className="form-row">
                    <Textfield
                        label="Comentarios/Indicaciones"
                        type="text"
                        name="notes"
                        onChange={handleChange}
                        value={values.notes}
                        helperText={touched.notes && errors.notes}
                        variant={touched.notes && errors.notes ? "error" : "default"}
                    />
                </div>

                <div className="form-actions span-2">
                    <Button variant="outlined" size="large" onClick={() => setIsFirst(true)}>
                        Volver
                    </Button>
                    <Button type="submit" variant="fulfilled" size="large">
                        Finalizar
                    </Button>
                </div>
                </div>
            </Form>
        );
    };

    if (isFirst) {
        return (
            <div className="dog-page">
                <div className="dog-title-wrap">
                    <h1 className="title-1">Agregar perro</h1>
                </div>

                <div className="dog-container">
                    <Hero
                        stepVariant={"dog-step1"}
                        Title={"General"}
                        SubTitle={"Complete con la información general de su perro"}
                    />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={DogSchema}
                        onSubmit={(vals, helpers) => handleNext(vals, helpers.validateForm)}
                    >
                        {(formik) => <Fields {...formik} />}
                    </Formik>

                </div>
            </div>
        );
    } else {
        return (
            <div className="dog-page">
                <div className="dog-title-wrap">
                    <h1 className="title-1">Agregar perro</h1>
                </div>

                <div className="dog-container">
                    <Hero
                        stepVariant={"dog-step2"}
                        Title={"Salud"}
                        SubTitle={"Complete con la información medicinal de su perro"}
                    />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={HealthSchema}
                        onSubmit={(vals) => handleFinish(vals as FullDogForm)}
                    >
                        {(formik) => <Health {...formik} />}
                    </Formik>
                </div>
            </div>
        );
    }
}