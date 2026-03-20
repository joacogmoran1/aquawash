import { useEffect, useState } from "react";

// Context
import { useAuth } from "../context/AuthContext";

// Api
import api from "../api/api";

// Utils — DIAS_SEMANA ahora tiene claves lun/mar/mie/jue/vie/sab/dom
import { DIAS_SEMANA } from "../utils/constants";
import {
    validateConfiguracionGeneral,
    validateServicio,
} from "../utils/config/configValidators";
import {
    sanitizeText,
    sanitizeEmail,
    sanitizePhone,
    sanitizeTime,
    sanitizePrice,
    sanitizeInteger,
} from "../utils/config/configSanitizers";

const EMPTY_NEGOCIO_FORM = {
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
};

const EMPTY_SERVICIO_FORM = {
    nombre: "",
    precio: "",
    capacidad_por_hora: "",
    duracion_estimada_min: "",
};

export function useConfigPage(showToast) {
    const { user, updateUser, resendVerification, forgotPassword, deleteAccount } = useAuth();

    const [loading, setLoading] = useState(true);
    const [operacion, setOperacion] = useState({});
    const [negocioForm, setNegocioForm] = useState(EMPTY_NEGOCIO_FORM);

    const [initialOperacion, setInitialOperacion] = useState({});
    const [initialNegocioForm, setInitialNegocioForm] = useState(EMPTY_NEGOCIO_FORM);

    const [configEditing, setConfigEditing] = useState(false);

    const [form, setForm] = useState(EMPTY_SERVICIO_FORM);
    const [editing, setEditing] = useState(null);

    const [saving, setSaving] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [sendingPasswordReset, setSendingPasswordReset] = useState(false);

    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        loadOperacion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadOperacion() {
        try {
            const data = await api.get("/operacion");

            const negocioData = {
                nombre: sanitizeText(data.nombre ?? user?.nombre ?? ""),
                email: sanitizeEmail(data.email ?? user?.email ?? ""),
                telefono: sanitizePhone(data.telefono ?? user?.telefono ?? ""),
                direccion: sanitizeText(data.direccion ?? user?.direccion ?? ""),
            };

            setOperacion(data);
            setNegocioForm(negocioData);
            setInitialOperacion(data);
            setInitialNegocioForm(negocioData);
        } catch (e) {
            console.error(e);
            showToast("Error al cargar configuración", "error");
        } finally {
            setLoading(false);
        }
    }

    function cancelConfiguracionGeneral() {
        setOperacion(initialOperacion);
        setNegocioForm(initialNegocioForm);
        setConfigEditing(false);
    }

    async function saveConfiguracionGeneral() {
        const validationError = validateConfiguracionGeneral(negocioForm, operacion);
        if (validationError) {
            showToast(validationError, "error");
            return;
        }

        const payload = {
            nombre: sanitizeText(negocioForm.nombre).trim(),
            email: sanitizeEmail(negocioForm.email).trim(),
            telefono: sanitizePhone(negocioForm.telefono).trim(),
            direccion: sanitizeText(negocioForm.direccion).trim(),
        };

        for (const d of DIAS_SEMANA) {
            const abierto = operacion[d.key] === 1 ? 1 : 0;

            payload[d.key] = abierto;
            payload[`${d.key}_apertura`] = abierto
                ? sanitizeTime(operacion[`${d.key}_apertura`] || "")
                : "";
            payload[`${d.key}_cierre`] = abierto
                ? sanitizeTime(operacion[`${d.key}_cierre`] || "")
                : "";
        }

        setSavingConfig(true);

        try {
            const updated = await api.put("/operacion", payload);

            const negocioUpdated = {
                nombre: sanitizeText(updated.nombre ?? ""),
                email: sanitizeEmail(updated.email ?? ""),
                telefono: sanitizePhone(updated.telefono ?? ""),
                direccion: sanitizeText(updated.direccion ?? ""),
            };

            setOperacion(updated);
            setNegocioForm(negocioUpdated);
            setInitialOperacion(updated);
            setInitialNegocioForm(negocioUpdated);
            setConfigEditing(false);
            updateUser({
                ...negocioUpdated,
                email_verified: updated.email_verified ?? user?.email_verified ?? false,
            });


            showToast("Configuración guardada", "success");
        } catch (e) {
            showToast(e?.message || "Error al guardar configuración", "error");
        } finally {
            setSavingConfig(false);
        }
    }

    async function saveServicio() {
        const validationError = validateServicio(form);
        if (validationError) {
            showToast(validationError, "error");
            return;
        }

        const nombre = sanitizeText(form.nombre).trim();
        const precio = sanitizePrice(form.precio);
        const capacidad = sanitizeInteger(form.capacidad_por_hora);
        const duracion = sanitizeInteger(form.duracion_estimada_min);

        setSaving(true);

        try {
            const payload = {
                nombre,
                precio: parseFloat(precio),
                capacidad_por_hora: parseInt(capacidad, 10),
                duracion_estimada_min: parseInt(duracion, 10),
            };

            if (editing) {
                await api.put(`/servicios/${editing}`, payload);
                showToast("Servicio actualizado", "success");
            } else {
                await api.post("/servicios", {
                    ...payload,
                    activo: true,
                    tipo: nombre || "Personalizado",
                });
                showToast("Servicio creado", "success");
            }

            setForm(EMPTY_SERVICIO_FORM);
            setEditing(null);
            await loadOperacion();
        } catch (e) {
            showToast(e?.message || "Error al guardar servicio", "error");
        } finally {
            setSaving(false);
        }
    }

    async function deleteServicio(id) {
        try {
            await api.delete(`/servicios/${id}`);
            showToast("Servicio eliminado", "success");
            await loadOperacion();
        } catch (e) {
            showToast(e?.message || "Error al eliminar servicio", "error");
        }
    }

    async function resendVerificationEmail() {
        const email = initialNegocioForm.email || negocioForm.email || user?.email || "";
        if (!email) {
            showToast("No hay un email configurado para reenviar la verificación", "error");
            return;
        }

        setResendingVerification(true);
        try {
            const data = await resendVerification(email);
            showToast(data.message || "Revisá tu casilla para verificar el email", "success");
        } catch (e) {
            showToast(e?.message || "No se pudo reenviar la verificación", "error");
        } finally {
            setResendingVerification(false);
        }
    }

    async function sendPasswordResetEmail() {
        const email = initialNegocioForm.email || negocioForm.email || user?.email || "";
        if (!email) {
            showToast("No hay un email configurado para recuperar la contraseña", "error");
            return;
        }

        setSendingPasswordReset(true);
        try {
            const data = await forgotPassword(email);
            showToast(data.message || "Te enviamos un enlace para cambiar la contraseña", "success");
        } catch (e) {
            showToast(e?.message || "No se pudo enviar el enlace de cambio", "error");
        } finally {
            setSendingPasswordReset(false);
        }
    }

    async function deleteUserAccount(password) {
        setDeletingAccount(true);
        try {
            await deleteAccount(password);
        } catch (e) {
            showToast(e?.message || 'Error al eliminar la cuenta', 'error');
        } finally {
            setDeletingAccount(false);
        }
    }

    function handleHorarioChange(diaKey, field, value) {
        setOperacion((prev) => ({
            ...prev,
            [`${diaKey}_${field}`]: sanitizeTime(value),
        }));
    }

    return {
        loading,
        operacion,
        setOperacion,
        negocioForm,
        setNegocioForm,
        configEditing,
        setConfigEditing,
        form,
        setForm,
        editing,
        setEditing,
        saving,
        savingConfig,
        resendingVerification,
        sendingPasswordReset,
        cancelConfiguracionGeneral,
        saveConfiguracionGeneral,
        saveServicio,
        deleteServicio,
        resendVerificationEmail,
        sendPasswordResetEmail,
        handleHorarioChange,
        deletingAccount,
        deleteUserAccount,
    };
}