import { showErrorDialog, showSuccessDialog } from "./toolsHelper";

/** Hasil aksi store: store hanya melaporkan, komponen yang menampilkan notifikasi. */
export interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Menampilkan notifikasi untuk hasil aksi store (toast sukses bila ada pesan,
 * dialog error bila gagal) dan mengembalikan status keberhasilannya.
 */
export function notifyResult(result: ActionResult): boolean {
  if (!result.success) showErrorDialog(result.message);
  else if (result.message) showSuccessDialog(result.message);
  return result.success;
}
