const TIME_ZONE = "Asia/Jakarta";

const shortDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

const longDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateParts = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export type EventDateParts = {
  day: string;
  weekday: string;
  month: string;
  year: string;
};

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((item) => item.type === type)?.value ?? "";
}

/** Short label: `28 Okt`. */
export function formatEventDate(date: Date): string {
  return shortDate.format(date);
}

/** Full label: `Rabu, 28 Oktober 2026`. */
export function formatEventLongDate(date: Date): string {
  return longDate.format(date);
}

/** Split date, useful for date blocks in agenda rows. */
export function formatEventDateParts(date: Date): EventDateParts {
  const parts = dateParts.formatToParts(date);

  return {
    day: part(parts, "day"),
    weekday: part(parts, "weekday"),
    month: part(parts, "month"),
    year: part(parts, "year"),
  };
}

/** Inclusive range: `5–28 Nov 2026`, `28 Des 2026–3 Jan 2027`. */
export function formatEventDateRange(start: Date, end: Date): string {
  const from = formatEventDateParts(start);
  const to = formatEventDateParts(end);

  if (from.day === to.day && from.month === to.month && from.year === to.year) {
    return `${from.day} ${from.month} ${from.year}`;
  }

  if (from.month === to.month && from.year === to.year) {
    return `${from.day}–${to.day} ${to.month} ${from.year}`;
  }

  if (from.year === to.year) {
    return `${from.day} ${from.month}–${to.day} ${to.month} ${from.year}`;
  }

  return `${from.day} ${from.month} ${from.year}–${to.day} ${to.month} ${to.year}`;
}

type AttendanceEvent = {
  quota: number | null;
  attendeeCount: number;
  registrationOpen: boolean;
};

export function isEventFull(event: Pick<AttendanceEvent, "quota" | "attendeeCount">) {
  return Boolean(event.quota) && event.attendeeCount >= (event.quota ?? 0);
}

export function formatEventAttendance(event: AttendanceEvent): string {
  if (isEventFull(event)) {
    return "Kuota penuh";
  }

  if (event.quota) {
    return `${event.attendeeCount} / ${event.quota} peserta`;
  }

  if (event.attendeeCount > 0) {
    return `${event.attendeeCount} peserta`;
  }

  return event.registrationOpen ? "Pendaftaran dibuka" : "Pendaftaran ditutup";
}

export function formatEventPrice(fee: string | null | undefined): string {
  if (!fee) {
    return "Gratis";
  }

  const value = fee.trim();
  if (!value || /gratis|free/i.test(value)) {
    return "Gratis";
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits ? `Rp ${Number(digits).toLocaleString("id-ID")}` : value;
}
