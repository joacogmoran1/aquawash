import { dateKey } from "./dateUtils";

export function estadoBadge(estado) {
    const badgeMap = {
        agendado: "cyan",
        reservado: "cyan",
        confirmado: "green",
        lavando: "cyan",
        esperando: "orange",
        listo: "green",
        entregado: "muted",
        completado: "muted",
        cancelado: "red",
    };

    return (
        <span className={`badge badge-${badgeMap[estado] || "muted"}`}>
            {estado?.toUpperCase()}
        </span>
    );
}

export function esPasado(fechaStr, horaStr) {
    if (!fechaStr || !horaStr) return false;

    const dt = new Date(`${fechaStr}T${horaStr}:00`);
    return dt <= new Date();
}

export function diaEsPasado(fechaStr) {
    if (!fechaStr) return false;

    const hoy = dateKey(new Date());
    return fechaStr < hoy;
}