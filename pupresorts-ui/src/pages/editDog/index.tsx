import "./index.css";

import {Form, Formik} from "formik";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import * as Yup from "yup";

import Button from "../../components/Button";
import FileUploader from "../../components/FileUploader";
import Hero from "../../components/Hero";
import Textfield from "../../components/Textfield";
import {getDogById, updateDog, uploadImageToS3} from "../../api/api.ts";
import type {DogData} from "../../interfaces";

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

const TAKES_MEDICINE = [
    {id: "Si", name: "Si"},
    {id: "No", name: "No"},
];

type FormValues = {
    name: string;
    birthdate: string;
    breed: string;
    weight: string;
    takesMedicine: string;
    allergies: string;
    comments: string;
    image: File | string | null;
}

const StepOneSchema = Yup.object({
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

const StepTwoSchema = Yup.object({
    weight: Yup.string().required("Este campo es obligatorio"),
    takesMedicine: Yup.string().required("Este campo es obligatorio"),
});

function Fields({
                    values,
                    handleChange,
                    touched,
                    errors,
                    setFieldValue,
                    currentImageUrl
                }: any) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <Form className="dog-form-grid">
            <div className="ImageUploader-container">
                <FileUploader
                    onImageSelect={(file: File | null) => setFieldValue('image', file)}
                    currentImage={currentImageUrl}
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

function Health({
                    values,
                    handleChange,
                    touched,
                    errors,
                    setIsFirst,
                    isPosting
                }: any) {
    return (
        <Form className="dog-form-grid">
            <div className="form-inputs-health">
                <div className="form-row">
                    <Textfield
                        label={"Peso (kg) *"}
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
                            value={values.takesMedicine}
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
                        name="comments"
                        onChange={handleChange}
                        value={values.comments}
                        helperText={touched.comments && errors.comments}
                        variant={touched.comments && errors.comments ? "error" : "default"}
                    />
                </div>

                <div className="form-actions span-2">
                    <Button variant="outlined" size="large" onClick={() => setIsFirst(true)}>
                        Volver
                    </Button>
                    <Button type="submit" variant="fulfilled" size="large">
                        {isPosting ? "Guardando..." : "Finalizar"}
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default function EditDog() {
    const navigate = useNavigate();
    const [dog, setDog] = useState<DogData | null>(null);
    const [isFirst, setIsFirst] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const { id: dogId } = useParams<{ id: string }>();

    const fetchDogData = async () => {
        if (!dogId) {
            toast("ID de perro no válido", {type: "error"});
            navigate("/my_dogs");
            return;
        }

        try {
            setLoading(true);
            const dogData = await getDogById(dogId);

            if (dogData) {
                setDog(dogData);
            } else {
                toast("No se encontró el perro", {type: "error"});
                navigate("/my_dogs");
            }
        } catch (error) {
            console.error("Error fetching dog:", error);
            toast("Error al cargar los datos del perro", {type: "error"});
            navigate("/my_dogs");
        } finally {
            setLoading(false);
        }
    };

    const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return "";
        return dateString.split('T')[0];
    };

    useEffect(() => {
        fetchDogData();
    }, [dogId]);

    const initialValues: FormValues = {
        name: dog?.name || "",
        birthdate: formatDateForInput(dog?.birthDate),
        breed: dog?.breed || "",
        weight: dog?.weight || "",
        takesMedicine: dog?.dailyMedicine ? "Si" : "No",
        allergies: dog?.allergies || "",
        comments: dog?.comments || "",
        image: dog?.imageUrl || null,
    };

    const handleNext = async (
        _values: FormValues,
        validateForm: () => Promise<Record<string, string>>
    ) => {
        const errors = await validateForm();
        const step1Keys = ["name", "birthdate", "breed", "image"];
        const hasStep1Errors = step1Keys.some((k) => !!errors[k]);
        if (hasStep1Errors) return;
        setIsFirst(false);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleFinish = async (values: FormValues) => {
        setIsPosting(true);
        if (!dogId) return;

        try {
            const formData = new FormData();

            formData.append('name', values.name);
            formData.append('birthDate', values.birthdate);
            formData.append('breed', values.breed);
            formData.append('weight', values.weight);
            formData.append('dailyMedicine', values.takesMedicine === "Si" ? "true" : "false");
            formData.append('allergies', values.allergies || "");
            formData.append('comments', values.comments || "");

            const response = await updateDog(dogId, formData);
            if (values.image && values.image instanceof File){
                await uploadImageToS3(response.upload_url.uploadUrl, values.image);
            }

            toast("Perro actualizado correctamente", {type: "success"});
            setTimeout(() => {
                navigate("/my_dogs");
            }, 2000);
        } catch (error) {
            console.error("Error updating dog:", error);
            toast("Error al actualizar el perro", {type: "error"});
        }
        setIsPosting(false);
    };

    if (loading) {
        return (
            <div className="dog-page">
                <div className="dog-title-wrap">
                    <h1 className="title-1">Cargando...</h1>
                </div>
            </div>
        );
    }

    if (isFirst) {
        return (
            <div className="dog-page">
                <div className="dog-title-wrap">
                    <h1 className="title-1">Editar perro</h1>
                </div>

                <div className="dog-container">
                    <Hero
                        stepVariant={"dog-step1"}
                        Title={"General"}
                        SubTitle={"Complete con la información general de su perro"}
                    />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={StepOneSchema}
                        onSubmit={(vals, helpers) => handleNext(vals, helpers.validateForm)}
                        enableReinitialize={true}
                    >
                        {(formik) => (
                            <Fields
                                {...formik}
                                currentImageUrl={dog?.imageUrl}
                            />
                        )}
                    </Formik>
                </div>
            </div>
        );
    } else {
        return (
            <div className="dog-page">
                <div className="dog-title-wrap">
                    <h1 className="title-1">Editar perro</h1>
                </div>

                <div className="dog-container">
                    <Hero
                        stepVariant={"dog-step2"}
                        Title={"Salud"}
                        SubTitle={"Complete con la información medicinal de su perro"}
                    />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={StepTwoSchema}
                        onSubmit={(vals) => handleFinish(vals)}
                        enableReinitialize={true}
                    >
                        {(formik) => <Health {...formik} setIsFirst={setIsFirst} isPosting={isPosting} />}
                    </Formik>
                </div>
            </div>
        );
    }
}