export const fmtCurrency = (n) =>
    `$${Number(n || 0).toLocaleString("es-AR")}`;

export const fmtHour = (ts) =>
    ts
        ? new Date(ts).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

export const getDurationMin = (order) => {
    if (!order?.hora_inicio || !order?.hora_fin) return null;
    return Math.round(
        (new Date(order.hora_fin) - new Date(order.hora_inicio)) / 60000
    );
};

export const getWeeklyTotal = (days = []) =>
    days.reduce((acc, day) => acc + Number(day.ingresos || 0), 0);

export const getMaxIncome = (days = []) =>
    Math.max(...days.map((d) => Number(d.ingresos || 0)), 1);