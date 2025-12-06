import "./index.css";

import Box from "@mui/material/Box";
import { Form, Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { getUserData, updateUser} from "../../api/api";
import {IconEye} from "../../assets/IconEye.tsx";
import {IconEyeOff} from "../../assets/IconEyeOff.tsx";
import Button from "../../components/Button";
import Textfield from "../../components/Textfield";
import { getAccessToken } from "../../utils/auth";

type UserEditValues = {
    name: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const EditSchema = Yup.object().shape({
    name: Yup.string().required("Este campo es requerido"),
    lastName: Yup.string().required("Este campo es requerido"),
    email: Yup.string()
        .required("Este campo es requerido")
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Por favor, ingresa un correo electrónico válido."),
    password: Yup.string()
        .nullable()
        .transform((v) => (typeof v === "string" && v.trim() === "" ? null : v))
        .test("password-strength","Debe tener al menos 8 caracteres, mayúscula, minúscula y un número",(value) => {
            if (!value) return true;
            const hasMinLength = value.length >= 8;
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasDigit = /\d/.test(value);
            return hasMinLength && hasUpper && hasLower && hasDigit;
        }),
    confirmPassword: Yup.string()
        .nullable()
        .transform((v) => (typeof v === "string" && v.trim() === "" ? null : v))
        .test("confirm-matches", "Las contraseñas no coinciden", function (value) {
            const password = this.parent.password as string | null;
            if (!password) return true;
            return value === password;
        }),
});

function decodeJwtId(token: string | null): string | null {
    try {
        if (!token) return null;
        const [, payload] = token.split(".");
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return String(json.id ?? json.sub ?? json.userId ?? json.uid ?? "");
    } catch {
        return null;
    }
}

function UserEdit() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState<string>("");
    const [initial, setInitial] = useState<UserEditValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = typeof getAccessToken === "function" ? getAccessToken() : null;
                const idFromToken = decodeJwtId(token);
                if (idFromToken) setUserId(idFromToken);

                const me = await getUserData();
                setInitial({
                    name: me.name ?? "",
                    lastName: me.lastName ?? "",
                    email: me.email ?? "",
                    password: "",
                    confirmPassword: "",
                });

                if (!idFromToken && (me as any)?.id) setUserId(String((me as any).id));
            } catch (e: any) {
                toast(e?.message ?? "No se pudo cargar el usuario", { type: "error" });
                navigate("/home");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const safeInitial = useMemo(
        () =>
            initial ?? {
                name: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
            },
        [initial]
    );

    const onSubmit = async (values: UserEditValues, { resetForm }: any) => {
        try {
            if (!userId) throw new Error("No se pudo resolver el id de usuario");
            const payload: any = {
                name: values.name,
                lastName: values.lastName,
                email: values.email,
            };
            if (values.password && values.password.trim()) payload.password = values.password;

            await updateUser(userId, payload);
            toast("Cambios guardados", { type: "success" });

            window.dispatchEvent(new Event("user-updated"));

            resetForm({ values: { ...values, password: "", confirmPassword: "" } });

            navigate("/home");
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "No se pudo guardar";
            toast(msg, { type: "error" });
        }
    };

    if (loading) return null;

    return (
        <div className="user-edit-page">
            <div className="user-edit-title-wrap">
                <h1 className="title-1">Editar Perfil</h1>
            </div>

            <div className="user-edit-container">
                <Formik
                    enableReinitialize
                    initialValues={safeInitial}
                    validationSchema={EditSchema}
                    onSubmit={onSubmit}
                >
                    {({ values, handleChange, setFieldValue, touched, errors, dirty, isValid }) => (
                        <Form className="user-edit-form-grid">
                            <div className="form-cell">
                                <Textfield
                                    label="Nombre"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    helperText={touched.name && (errors.name as string)}
                                    variant={touched.name && errors.name ? "error" : "default"}
                                    placeholder="Maria"
                                />
                            </div>

                            <div className="form-cell">
                                <Textfield
                                    label="Apellido"
                                    name="lastName"
                                    value={values.lastName}
                                    onChange={handleChange}
                                    helperText={touched.lastName && (errors.lastName as string)}
                                    variant={touched.lastName && errors.lastName ? "error" : "default"}
                                    placeholder="Perez"
                                />
                            </div>

                            <div className="form-cell">
                                <Textfield
                                    label="Email"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    helperText={touched.email && (errors.email as string)}
                                    variant={touched.email && errors.email ? "error" : "default"}
                                    placeholder="example@mail.com"
                                />
                            </div>

                            <div className="form-cell password-wrapper">
                                <Textfield
                                    label="Contraseña"
                                    placeholder="Password123"
                                    type={showPassword ? "text" : "password"}
                                    value={values.password}
                                    name="password"
                                    onChange={(e) => {
                                        handleChange(e);
                                        const next = e.target.value;
                                        if (typeof next === "string" && next.trim() === "") {
                                            setFieldValue("confirmPassword", "");
                                        }
                                    }}
                                    withIcon={showPassword ? IconEyeOff : IconEye}
                                    onClickIcon={() => setShowPassword((s) => !s)}
                                    helperText={errors.password}
                                    variant={touched.password && errors.password ? "error" : "default"}
                                />
                            </div>

                            <div className="form-row-center span-2">
                                <div className="form-cell password-wrapper">
                                    <Textfield
                                        label="Repetir contraseña"
                                        placeholder="Password123"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={values.confirmPassword}
                                        name="confirmPassword"
                                        onChange={handleChange}
                                        withIcon={showConfirmPassword ? IconEyeOff : IconEye}
                                        onClickIcon={() => setShowConfirmPassword((s) => !s)}
                                        helperText={touched.confirmPassword && errors.confirmPassword}
                                        variant={
                                            touched.confirmPassword && errors.confirmPassword ? "error" : "default"
                                        }
                                    />
                                </div>
                            </div>

                            <Box className="form-actions span-2">
                                <Button
                                    type="submit"
                                    variant="fulfilled"
                                    size="large"
                                    disabled={!dirty || !isValid}
                                >
                                    Guardar Cambios
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default UserEdit;
