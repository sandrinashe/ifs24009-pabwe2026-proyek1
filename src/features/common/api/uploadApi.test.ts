import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { uploadImage } from "./uploadApi";

vi.mock("../../../helpers/apiHelper");

describe("uploadApi", () => {
  it("mengunggah file sebagai multipart ke /uploads dan mengembalikan URL", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ url: "https://cdn.example.com/a.jpg" });
    const blob = new Blob(["jpeg"], { type: "image/jpeg" });
    const result = await uploadImage(blob, "a.jpg");
    expect(result).toEqual({ url: "https://cdn.example.com/a.jpg" });
    const [path, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(path).toBe("/uploads");
    expect(options?.method).toBe("POST");
    const form = options?.body as FormData;
    expect((form.get("file") as File).name).toBe("a.jpg");
  });
});
