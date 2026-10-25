/** Mengambil pesan dari nilai `unknown` yang ditangkap di blok catch. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Terjadi kesalahan yang tidak diketahui";
}
