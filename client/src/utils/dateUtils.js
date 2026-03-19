/**
 * Genera las celdas del mes para el calendario.
 * La semana empieza en LUNES (getDay() devuelve 0=Dom, 1=Lun…).
 * Convertimos con (getDay() + 6) % 7 → 0=Lun, …, 6=Dom
 */
export function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // Días del mes anterior para completar la primera semana (lunes=0)
  const startDay = (first.getDay() + 6) % 7;
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, current: false });
  }

  // Días del mes actual
  for (let i = 1; i <= last.getDate(); i++) {
    days.push({ date: new Date(year, month, i), current: true });
  }

  // Días del mes siguiente para completar la última semana (siempre 42 celdas = 6 filas)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), current: false });
  }

  return days;
}

/** Retorna "YYYY-MM-DD" local (sin conversión UTC) */
export function dateKey(d) {
  return (
    `${d.getFullYear()}-` +
    `${String(d.getMonth() + 1).padStart(2, "0")}-` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}

/** Compara dos fechas ignorando la hora */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Iniciales de un nombre (máx 2 letras) */
export function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Hora actual como "HH:MM" */
export function now() {
  const d = new Date();
  return (
    `${String(d.getHours()).padStart(2, "0")}:` +
    `${String(d.getMinutes()).padStart(2, "0")}`
  );
}