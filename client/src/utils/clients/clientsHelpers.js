export function getLastVisitGroup(dateString) {
    if (!dateString) return "sin_visitas";

    const now = new Date();
    const lastVisit = new Date(dateString);
    const diffMs = now - lastVisit;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 30) return "mes";
    if (diffDays <= 365) return "anio";
    return "mas_de_un_anio";
}

export function formatLastVisit(dateString) {
    if (!dateString) return "Sin visitas";

    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR");
}