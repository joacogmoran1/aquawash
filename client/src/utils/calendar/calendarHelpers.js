import { dateKey } from "../dateUtils";

export function esPasado(fechaStr, horaStr) {
    if (!fechaStr || !horaStr) return false;
    return new Date(`${fechaStr}T${horaStr}:00`) <= new Date();
}

export function diaEsPasado(fechaStr) {
    if (!fechaStr) return false;
    return fechaStr < dateKey(new Date());
}