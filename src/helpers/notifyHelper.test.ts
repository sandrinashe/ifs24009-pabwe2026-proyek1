import { describe, expect, it, vi } from "vitest";
import { notifyResult } from "./notifyHelper";
import { showErrorDialog, showSuccessDialog } from "./toolsHelper";

vi.mock("./toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("notifyResult", () => {
  it("menampilkan dialog error saat gagal", () => {
    expect(notifyResult({ success: false, message: "Gagal" })).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("menampilkan toast saat sukses dengan pesan", () => {
    expect(notifyResult({ success: true, message: "Tersimpan" })).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("Tersimpan");
  });

  it("diam saat sukses tanpa pesan", () => {
    expect(notifyResult({ success: true, message: "" })).toBe(true);
    expect(showSuccessDialog).not.toHaveBeenCalled();
    expect(showErrorDialog).not.toHaveBeenCalled();
  });
});
