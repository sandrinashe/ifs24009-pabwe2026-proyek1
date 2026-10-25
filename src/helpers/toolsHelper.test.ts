import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatCurrency,
  formatDate,
  getTripDays,
  getUsagePercentage,
  showConfirmDialog,
  showErrorDialog,
  showImageDialog,
  showSuccessDialog,
  usageBarClass,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
  });

  it("showSuccessDialog menampilkan toast sukses", () => {
    showSuccessDialog("Berhasil");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ toast: true, icon: "success", title: "Berhasil" })
    );
  });

  it("showErrorDialog menampilkan dialog error", () => {
    showErrorDialog("Gagal");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "Gagal" })
    );
  });

  it("showImageDialog menampilkan gambar dengan teks alternatif", () => {
    showImageDialog("data:image/jpeg;base64,AAAA", "Bukti: Hotel");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Bukti: Hotel",
        imageUrl: "data:image/jpeg;base64,AAAA",
        imageAlt: "Bukti: Hotel",
      })
    );
  });

  it("showConfirmDialog mengembalikan hasil konfirmasi", async () => {
    expect(await showConfirmDialog("Hapus?", "Yakin?")).toBe(true);
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as never);
    expect(await showConfirmDialog("Hapus?", "Yakin?")).toBe(false);
  });

  it("formatCurrency memakai format Rupiah", () => {
    const text = formatCurrency(1500000);
    expect(text).toMatch(/^Rp/);
    expect(text).toContain("1.500.000");
  });

  it("formatDate memakai format Indonesia", () => {
    const text = formatDate("2026-12-01");
    expect(text).toContain("2026");
    expect(text).toContain("1");
  });

  it("getTripDays menghitung jumlah hari termasuk hari pertama dan terakhir", () => {
    expect(getTripDays("2026-12-01", "2026-12-05")).toBe(5);
    expect(getTripDays("2026-12-01", "2026-12-01")).toBe(1);
  });

  it("getUsagePercentage menangani anggaran nol", () => {
    expect(getUsagePercentage(250, 1000)).toBe(25);
    expect(getUsagePercentage(1234, 1000)).toBe(123.4);
    expect(getUsagePercentage(500, 0)).toBe(0);
  });

  it("usageBarClass memilih warna sesuai persentase", () => {
    expect(usageBarClass(50)).toBe("bg-emerald-500");
    expect(usageBarClass(80)).toBe("bg-amber-500");
    expect(usageBarClass(100)).toBe("bg-amber-500");
    expect(usageBarClass(100.1)).toBe("bg-rose-500");
  });
});
