import './index.css';

import axios from "axios";
import {Form, Formik, type FormikHelpers} from "formik";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";

import {registerUser} from "../../api/api.ts";
import {IconEye} from "../../assets/IconEye";
import {IconEyeOff} from "../../assets/IconEyeOff";
import Button from "../../components/Button";
import Textfield from "../../components/Textfield";
import type {RegisterUser} from "../../interfaces";
import {setAccessToken} from "../../utils/auth.ts";
import logo from "../../assets/logobig.png"


interface RegisterForm{
    name: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export type ValidationErrors = Record<string, string>;

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formMessage, setFormMessage] = useState<{text: string, type: string}>({ text: "", type: "" });
    const initialValues: RegisterForm = {
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    }

    const navigate = useNavigate();

    const validateSchema = Yup.object().shape({
        name: Yup.string().required("Este campo es requerido"),
        lastName: Yup.string().required("Este campo es requerido"),
        email: Yup.string()
            .required("Este campo es requerido")
            .matches(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Por favor, ingresa un correo electrónico válido."
            ),
        password: Yup.string()
            .required("Este campo es requerido")
            .min(8, "Mínimo 8 caracteres")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z]).+$/,
                "La contraseña debe contener al menos una mayúscula y una minúscula",
            )
            .matches(/\d/, "La contraseña debe tener al menos 1 número"),
        confirmPassword: Yup.string().when("password", ( password: string[],
                                                         field: Yup.StringSchema
        ): Yup.StringSchema => {
            if (password) {
                return field
                    .required("Las contraseñas no coinciden")
                    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
            }
            return field;
        }),
    })

    const handleRegisterFormSubmit = async (values: RegisterForm, {
        setSubmitting,
    }: FormikHelpers<RegisterForm>) => {
        const userData: RegisterUser = {
            name: values.name,
            lastName: values.lastName,
            email: values.email,
            password: values.password
        };
        try {
            const response = await registerUser(userData);

            if (response.token) {
                setAccessToken(response.token);
                navigate('/home')

            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setFormMessage({text: error.response.data.message || 'Error de registro', type: "error"});
            } else {
                setFormMessage({text: "No se ha podido registrar el usuario", type: "error"});
            }
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="register-main-container">
            <div className="left-image"></div>
            <div className="register-form-container">
                <img className="register-small-logo" alt="PupResorts logo" src={logo}/>
                <Formik initialValues={initialValues} validationSchema={validateSchema} onSubmit={handleRegisterFormSubmit}
                        validate={(values)=>{
                            try {
                                validateSchema.validateSync(values, {abortEarly: false});
                                return {};
                            } catch (e) {
                                if (e instanceof Yup.ValidationError) {
                                    const errors: ValidationErrors = e.inner.reduce((acc, current) => {
                                        if (!current.path) return acc;
                                        acc[current.path] = acc[current.path] ? acc[current.path] + "\n" + current.message : current.message;
                                        return acc;
                                    }, {} as ValidationErrors);
                                    return errors;
                                }
                                throw e;
                            }
                        }} >
                    {({ values, handleChange, touched, errors }) => (
                        <Form className="register-form-wrapper">
                            <div className="register-inputs-container">
                                <Textfield
                                    label="Nombre"
                                    placeholder="Maria"
                                    type="text"
                                    name="name"
                                    onChange={handleChange}
                                    value={values.name}
                                    helperText={touched.name && errors.name}
                                    variant={touched.name && errors.name ? "error" : "default"}
                                />
                                <Textfield
                                    label="Apellido"
                                    placeholder="Pérez"
                                    type="text"
                                    name="lastName"
                                    value={values.lastName}
                                    onChange={handleChange}
                                    helperText={touched.lastName && errors.lastName}
                                    variant={touched.lastName && errors.lastName ? "error" : "default"}
                                />
                                <Textfield
                                    label="Email"
                                    placeholder="example@mail.com"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    helperText={touched.email && errors.email}
                                    variant={touched.email && errors.email ? "error" : "default"}
                                />
                                <Textfield
                                    label="Contraseña"
                                    placeholder="Password123"
                                    type={showPassword ? "text" : "password"}
                                    value={values.password}
                                    name = "password"
                                    onChange={handleChange}
                                    withIcon = {showPassword ? IconEyeOff : IconEye}
                                    onClickIcon={() => setShowPassword((s) => !s)}
                                    helperText={errors.password}
                                    variant={touched.password && errors.password ? "error" : "default"}
                                />
                                <Textfield
                                    label="Repetir contraseña"
                                    placeholder="Password123"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={values.confirmPassword}
                                    name = "confirmPassword"
                                    onChange={handleChange}
                                    withIcon = {showConfirmPassword ? IconEyeOff : IconEye}
                                    onClickIcon={() => setShowConfirmPassword((s) => !s)}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                    variant={touched.confirmPassword && errors.confirmPassword ? "error" : "default"}
                                />
                            </div>
                            <div className="register-buttons-container">
                                <Button
                                    className="Register-Button"
                                    variant="fulfilled"
                                    type="submit"
                                    size="medium"
                                >
                                    Registrarse
                                </Button>
                                <Button
                                    className="Register-login-Button"
                                    variant="outlined"
                                    type="button"
                                    size="medium"
                                    onClick={() => { navigate("/login") }}
                                >
                                    Ya tengo una cuenta
                                </Button>
                            </div>
                            {formMessage.text && (
                                <div className={`form-message-${formMessage.type}`}>{formMessage.text}</div>
                            )}
                        </Form>
                    )}
                </Formik>
            </div>

        </div>
    );
}

export default Register;
