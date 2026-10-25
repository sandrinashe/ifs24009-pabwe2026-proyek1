import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage, MAX_FILE_BYTES } from "./imageHelper";

class FakeImage {
  static fail = false;
  static size = { width: 2000, height: 1000 };
  width = FakeImage.size.width;
  height = FakeImage.size.height;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_value: string) {
    queueMicrotask(() => (FakeImage.fail ? this.onerror?.() : this.onload?.()));
  }
}

const makeFile = (type = "image/png") => new File(["isi"], "foto", { type });

describe("compressImage", () => {
  const context = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
  let dimensions: [number, number];
  let blob: Blob | null;

  beforeEach(() => {
    FakeImage.fail = false;
    FakeImage.size = { width: 2000, height: 1000 };
    vi.stubGlobal("Image", FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as never
    );
    blob = new Blob(["jpeg"], { type: "image/jpeg" });
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
      this: HTMLCanvasElement,
      callback: BlobCallback
    ) {
      dimensions = [this.width, this.height];
      callback(blob);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("memperkecil gambar besar dan mengembalikan Blob JPEG", async () => {
    const result = await compressImage(makeFile());
    expect(result).toBe(blob);
    expect(dimensions).toEqual([1024, 512]);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.75
    );
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1024, 512);
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1024, 512);
  });

  it("mengikuti batas ukuran dan kualitas yang diberikan", async () => {
    await compressImage(makeFile("image/webp"), 256, 0.5);
    expect(dimensions).toEqual([256, 128]);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.5
    );
  });

  it("tidak memperbesar gambar yang sudah kecil", async () => {
    FakeImage.size = { width: 100, height: 50 };
    await compressImage(makeFile("image/jpeg"));
    expect(dimensions).toEqual([100, 50]);
  });

  it("menolak format selain JPG, PNG, dan WebP", async () => {
    await expect(compressImage(makeFile("image/gif"))).rejects.toThrow(/Format gambar/);
  });

  it("menolak file lebih dari 5 MB", async () => {
    const file = makeFile();
    Object.defineProperty(file, "size", { value: MAX_FILE_BYTES + 1 });
    await expect(compressImage(file)).rejects.toThrow(/maksimal 5 MB/);
  });

  it("menolak jika canvas gagal menghasilkan Blob", async () => {
    blob = null;
    await expect(compressImage(makeFile())).rejects.toThrow(/Gagal memproses/);
  });

  it("menolak jika browser tidak menyediakan canvas", async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    await expect(compressImage(makeFile())).rejects.toThrow(/tidak mendukung/);
  });

  it("menolak file yang tidak dapat dimuat sebagai gambar", async () => {
    FakeImage.fail = true;
    await expect(compressImage(makeFile())).rejects.toThrow(/bukan gambar/);
  });

  it("menolak jika file gagal dibaca", async () => {
    class FailingReader {
      onerror: (() => void) | null = null;
      readAsDataURL() {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("FileReader", FailingReader);
    await expect(compressImage(makeFile())).rejects.toThrow(/Gagal membaca/);
  });
});
