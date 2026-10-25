/** Tanggal ISO (YYYY-MM-DD) dapat dibandingkan sebagai string. */
export const isValidDateRange = (start: string, end: string): boolean =>
  Boolean(start) && Boolean(end) && end >= start;
