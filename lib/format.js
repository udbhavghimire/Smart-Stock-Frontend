// Formatting helpers (spec §7.1, §7.5). Dates are plain calendar dates ("2026-10-05"),
// so everything is formatted in UTC to avoid the browser time zone shifting a day.

const dateParts = new Intl.DateTimeFormat("en-AU", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthFormat = new Intl.DateTimeFormat("en-AU", {
  timeZone: "UTC",
  month: "short",
  year: "numeric",
});

const DAY_MS = 86400000;

export function parseDate(iso) {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function toISO(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  return toISO(parseDate(iso) + days * DAY_MS);
}

function pick(iso) {
  const parts = Object.fromEntries(dateParts.formatToParts(parseDate(iso)).map((p) => [p.type, p.value]));
  return { day: parts.day, month: parts.month, year: parts.year };
}

/** "31 Aug 2026" */
export function formatDate(iso) {
  return dateParts.format(parseDate(iso));
}

/** Short axis label: "31 Aug" */
export function formatShortDate(iso) {
  const { day, month } = pick(iso);
  return `${day} ${month}`;
}

/** Monday-to-Sunday week label: "5 – 11 Oct 2026" or "28 Sep – 4 Oct 2026". */
export function formatWeekLabel(mondayISO) {
  const start = pick(mondayISO);
  const end = pick(addDays(mondayISO, 6));
  if (start.year !== end.year) {
    return `${start.day} ${start.month} ${start.year} – ${end.day} ${end.month} ${end.year}`;
  }
  if (start.month !== end.month) {
    return `${start.day} ${start.month} – ${end.day} ${end.month} ${end.year}`;
  }
  return `${start.day} – ${end.day} ${end.month} ${end.year}`;
}

/** "Nov 2026" */
export function formatMonthLabel(firstOfMonthISO) {
  return monthFormat.format(parseDate(firstOfMonthISO));
}

const moneyWhole = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const moneyCents = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** AUD; no cents above $1,000. */
export function formatMoney(value) {
  return Math.abs(value) >= 1000 ? moneyWhole.format(value) : moneyCents.format(value);
}

const wholeNumber = new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-AU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Units: 1 decimal under 10, otherwise whole numbers. */
export function formatUnits(value) {
  return Math.abs(value) < 10 ? oneDecimal.format(value) : wholeNumber.format(value);
}

export function formatWhole(value) {
  return wholeNumber.format(value);
}

export function formatPercent(fraction) {
  return `${Math.round(fraction * 100)}%`;
}
