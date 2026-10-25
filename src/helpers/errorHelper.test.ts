import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errorHelper";

describe("getErrorMessage", () => {
  it("mengambil pesan dari Error", () => {
    expect(getErrorMessage(new Error("Gagal"))).toBe("Gagal");
  });
  it("memakai string apa adanya", () => {
    expect(getErrorMessage("Teks")).toBe("Teks");
  });
  it("memberi pesan bawaan untuk nilai lain", () => {
    expect(getErrorMessage(42)).toBe("Terjadi kesalahan yang tidak diketahui");
    expect(getErrorMessage(null)).toBe("Terjadi kesalahan yang tidak diketahui");
  });
});
