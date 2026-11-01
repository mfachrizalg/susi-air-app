export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (value: number) => String(value).padStart(2, '0');

const parts = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
};

export const formatHours = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatLimit = (value: number) => value.toLocaleString('en-US');

export const formatDate = (iso: string) => {
  const { year, month, day } = parts(iso);
  return `${day} ${MONTHS[month - 1].slice(0, 3)} ${year}`;
};

export const dayOfMonth = (iso: string) => String(parts(iso).day);

export const monthTitle = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;

export const toIsoDate = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const daysInMonth = (year: number, month: number) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

// Sakamoto's method. Returns 0 for Sunday.
const WEEKDAY_OFFSET = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
const weekday = (year: number, month: number, day: number) => {
  const y = month < 3 ? year - 1 : year;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + WEEKDAY_OFFSET[month - 1] + day) % 7;
};

export const monthWeeks = (year: number, month: number) => {
  const cells: (string | null)[] = Array.from({ length: weekday(year, month, 1) }, () => null);
  for (let day = 1; day <= daysInMonth(year, month); day += 1) {
    cells.push(toIsoDate(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

export const shiftMonth = (year: number, month: number, delta: number) => {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};
