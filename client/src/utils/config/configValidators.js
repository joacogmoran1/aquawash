import { DIAS_SEMANA } from "../constants";
import {
    sanitizeText,
    sanitizeEmail,
    sanitizePhone,
    sanitizeInteger,
    sanitizeTime,
    sanitizePrice,
} from "./configSanitizers";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida el formulario de configuración general.
 * Las claves de DIAS_SEMANA son ahora "lun", "mar", "mie", etc.
 * — coinciden con el modelo Lavadero del backend.
 * @returns {string|null} mensaje de error o null si todo está OK
 */
export function validateConfiguracionGeneral(negocioForm, operacion) {
    const nombre = sanitizeText(negocioForm.nombre).trim();
    const email = sanitizeEmail(negocioForm.email).trim();
    const telefono = sanitizePhone(negocioForm.telefono).trim();
    const direccion = sanitizeText(negocioForm.direccion).trim();

    if (!nombre) return "El nombre del negocio es obligatorio.";
    if (!email) return "El email es obligatorio.";
    if (!EMAIL_REGEX.test(email)) return "El email no es válido.";
    if (!telefono) return "El teléfono es obligatorio.";
    if (!direccion) return "La dirección es obligatoria.";

    for (const d of DIAS_SEMANA) {
        const abierto = operacion[d.key] === 1;
        const apertura = sanitizeTime(operacion[`${d.key}_apertura`] || "");
        const cierre = sanitizeTime(operacion[`${d.key}_cierre`] || "");

        if (!abierto) continue;

        if (!apertura || !cierre) {
            return `Completá la apertura y el cierre de ${d.label}.`;
        }

        if (apertura >= cierre) {
            return `En ${d.label}, la apertura debe ser menor al cierre.`;
        }
    }

    return null;
}

/**
 * Valida el formulario de un servicio.
 * @returns {string|null} mensaje de error o null si todo está OK
 */
export function validateServicio(form) {
    const nombre = sanitizeText(form.nombre).trim();
    const precio = sanitizePrice(form.precio);
    const capacidad = sanitizeInteger(form.capacidad_por_hora);
    const duracion = sanitizeInteger(form.duracion_estimada_min);

    if (!nombre) return "El nombre del servicio es obligatorio.";
    if (!precio) return "El precio es obligatorio.";
    if (!capacidad) return "La capacidad por hora es obligatoria.";
    if (!duracion) return "La duración estimada es obligatoria.";

    if (Number(precio) <= 0) return "El precio debe ser mayor a 0.";
    if (Number(capacidad) <= 0) return "La capacidad por hora debe ser mayor a 0.";
    if (Number(duracion) <= 0) return "La duración estimada debe ser mayor a 0.";

    return null;
}