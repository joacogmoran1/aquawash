export function formatFechaLarga(fs) {
  if (!fs) return '';
  return new Date(fs + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
