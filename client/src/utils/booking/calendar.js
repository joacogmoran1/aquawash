import { DIAS_ARR } from '../../utils/constants';

export function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildCalendarDays(year, month) {
  const cells = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = (first.getDay() + 6) % 7;

  for (let i = start - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), current: false });
  }

  for (let i = 1; i <= last.getDate(); i++) {
    cells.push({ date: new Date(year, month, i), current: true });
  }

  while (cells.length < 42) {
    cells.push({
      date: new Date(year, month + 1, cells.length - last.getDate() - start + 1),
      current: false,
    });
  }

  return cells;
}

export function lavaderoAbre(lav, date) {
  return !!(lav && lav[DIAS_ARR[date.getDay()]]);
}
