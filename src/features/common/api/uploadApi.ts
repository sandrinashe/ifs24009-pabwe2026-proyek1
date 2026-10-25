import { apiFetch } from "../../../helpers/apiHelper";

export interface UploadResult {
  url: string;
}

/**
 * Mengunggah gambar (multipart/form-data) ke server dan mengembalikan URL-nya.
 * Database hanya menyimpan URL, bukan data gambar base64.
 */
export const uploadImage = (file: Blob, filename: string) => {
  const body = new FormData();
  body.append("file", file, filename);
  return apiFetch<UploadResult>("/uploads", { method: "POST", body });
};
