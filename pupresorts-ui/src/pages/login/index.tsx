import "./index.css"

import axios from "axios";
import {Form, Formik, type FormikHelpers} from "formik";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";

import {loginUser} from "../../api/api.ts";
import {IconEye} from "../../assets/IconEye.tsx";
import {IconEyeOff} from "../../assets/IconEyeOff.tsx";
import Button from "../../components/Button";
import Textfield from "../../components/Textfield";
import {setAccessToken} from "../../utils/auth.ts";
import logo from "../../assets/logobig.png"

interface Login{
    email: string;
    password: string;
}

const LoginPage = () => {
    const [ showPassword, setShowPassword ] = useState(false);
    const [ formMessage, setFormMessage ] = useState<{text: string, type: string}>({ text: "", type: "" });
    const initialValues: Login = {
        email: "",
        password: ""
    }

    const navigate = useNavigate();

    const validateSchema = Yup.object().shape({
        email: Yup.string()
            .email("Ingrese un email válido")
            .required("Este campo es requerido"),
        password: Yup.string()
            .required("Este campo es requerido")
    })

    const handleLogInFormSubmit = async (values: Login, {
        setSubmitting
    }: FormikHelpers<Login>) => {
        const userData: Login = {
            email: values.email,
            password: values.password
        };
        try {
            const response = await loginUser(userData);

            if (response.token) {
                setAccessToken(response.token);
                navigate('/home')
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setFormMessage({text: error.response.data.message || 'Error de login', type: "error"});
            } else {
                setFormMessage({text: 'No se pudo iniciar sesión. Revisa tus credenciales', type: "error"});
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className= "login-general-div">
            <div className="left-login-image"></div>
            <div className= "login-form-div">
                <img className= "logo-login" alt="logo" src={logo}/>
                <Formik initialValues={initialValues} validationSchema={validateSchema} onSubmit={handleLogInFormSubmit}>
                    {({ values, handleChange, touched, errors }) => (
                        <Form className="login-form-wrapper">
                            <div className="login-inputs-container">
                                <Textfield
                                    label="Email"
                                    placeholder="example@mail.com"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    helperText={touched.email && errors.email}
                                    variant={errors.email && touched.email ? "error" : "default"}
                                />
                                <Textfield
                                    label="Contraseña"
                                    placeholder="Password123"
                                    type={showPassword ? "text" : "password"}
                                    value={values.password}
                                    name = "password"
                                    withIcon = {showPassword ? IconEyeOff : IconEye}
                                    onChange={handleChange}
                                    onClickIcon={() => setShowPassword((s) => !s)}
                                    helperText={touched.password && errors.password}
                                    variant={errors.password && touched.password ? "error" : "default"}
                                />

                            </div>
                            <div className="login-buttons-container">
                                <Button
                                    className="Login-Button"
                                    variant="fulfilled"
                                    type="submit"
                                    size="medium"
                                >
                                    Iniciar Sesión
                                </Button>
                                <Button
                                    className="Login-register-Button"
                                    variant="outlined"
                                    type="button"
                                    size="medium"
                                    onClick={() => { navigate("/register")}}
                                >
                                    Registrarse
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
    )
}

export default LoginPage;