export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("File bukan gambar yang valid"));
    image.src = src;
  });
}

/**
 * Memperkecil gambar di browser dan mengembalikannya sebagai Blob JPEG yang siap diunggah.
 * Sisi terpanjang dibatasi `maxSize` piksel agar ukuran unggahan tetap kecil.
 */
export async function compressImage(
  file: File,
  maxSize = 1024,
  quality = 0.75
): Promise<Blob> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, atau WebP");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Ukuran gambar maksimal 5 MB");
  }
  const image = await loadImage(await readAsDataUrl(file));
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak mendukung pengolahan gambar");
  // Latar putih agar PNG transparan tidak menjadi hitam setelah jadi JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Gagal memproses gambar")),
      "image/jpeg",
      quality
    );
  });
}
