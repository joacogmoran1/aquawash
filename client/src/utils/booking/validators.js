export function validateNewClientForm(f) {
  if (!f.nombre.trim() || f.nombre.trim().length < 2) return 'El nombre completo es requerido.';
  if (!f.telefono.trim()) return 'El teléfono es requerido.';
  if (!/^[0-9+\-() ]+$/.test(f.telefono.trim())) return 'El teléfono contiene caracteres no válidos.';
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return 'El email no es válido.';
  if (!f.auto_marca.trim()) return 'La marca del vehículo es requerida.';
  if (!f.auto_modelo.trim()) return 'El modelo del vehículo es requerido.';
  if (!f.auto_patente.trim()) return 'La patente del vehículo es requerida.';
  if (f.auto_year) {
    const yr = Number(f.auto_year);
    if (!Number.isInteger(yr) || yr < 1900 || yr > new Date().getFullYear() + 1) return 'El año no es válido.';
  }
  return null;
}

export function validateNewAuto(f) {
  if (!f.marca.trim()) return 'La marca es requerida.';
  if (!f.modelo.trim()) return 'El modelo es requerido.';
  if (!f.patente.trim()) return 'La patente es requerida.';
  if (f.year) {
    const yr = Number(f.year);
    if (!Number.isInteger(yr) || yr < 1900 || yr > new Date().getFullYear() + 1) return 'El año no es válido.';
  }
  return null;
}
