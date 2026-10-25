import { describe, expect, it } from "vitest";
import { isValidDateRange } from "./validationHelper";

describe("isValidDateRange", () => {
  it("menerima rentang yang benar, termasuk satu hari", () => {
    expect(isValidDateRange("2026-12-01", "2026-12-05")).toBe(true);
    expect(isValidDateRange("2026-12-01", "2026-12-01")).toBe(true);
  });
  it("menolak tanggal selesai sebelum mulai atau tanggal kosong", () => {
    expect(isValidDateRange("2026-12-05", "2026-12-01")).toBe(false);
    expect(isValidDateRange("", "2026-12-01")).toBe(false);
    expect(isValidDateRange("2026-12-01", "")).toBe(false);
  });
});
