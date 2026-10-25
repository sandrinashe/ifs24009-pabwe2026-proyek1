import Swal from "sweetalert2";

export const EXPENSE_CATEGORIES = [
  "Akomodasi",
  "Transportasi",
  "Makanan",
  "Tiket/Wisata",
  "Lain-lain",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Akomodasi: "bg-indigo-500",
  Transportasi: "bg-sky-500",
  Makanan: "bg-amber-500",
  "Tiket/Wisata": "bg-emerald-500",
  "Lain-lain": "bg-slate-400",
};

export const showSuccessDialog = (message: string) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 2500,
  });

export const showErrorDialog = (message: string) =>
  Swal.fire({
    icon: "error",
    title: "Terjadi Kesalahan",
    text: message,
    confirmButtonColor: "#4f46e5",
  });

export const showImageDialog = (imageUrl: string, title: string) =>
  Swal.fire({
    title,
    imageUrl,
    imageAlt: title,
    showConfirmButton: false,
    showCloseButton: true,
    width: 600,
  });

export async function showConfirmDialog(
  title: string,
  text: string
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
  });
  return result.isConfirmed;
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Persentase penggunaan anggaran (tidak dibatasi 100 agar overspend terlihat). */
export const getUsagePercentage = (spent: number, budget: number): number =>
  budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;

export const usageBarClass = (percentage: number): string => {
  if (percentage > 100) return "bg-rose-500";
  if (percentage >= 80) return "bg-amber-500";
  return "bg-emerald-500";
};

export const getTripDays =(start: string, end: string): number => {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
};
