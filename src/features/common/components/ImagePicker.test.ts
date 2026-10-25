import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { deferred } from "../../../test-utils";
import { uploadImage } from "../api/uploadApi";
import { compressImage } from "../../../helpers/imageHelper";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import ImagePicker from "./ImagePicker.vue";

vi.mock("../../../helpers/imageHelper");
vi.mock("../api/uploadApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn() }));

const props = { modelValue: null, inputId: "pic", label: "Foto" };
const blob = new Blob(["jpeg"], { type: "image/jpeg" });
const file = new File(["x"], "a.png", { type: "image/png" });

async function choose(wrapper: ReturnType<typeof mount>, files: File[]) {
  const input = wrapper.find("input[type=file]");
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
  await flushPromises();
}

describe("ImagePicker", () => {
  beforeEach(() => {
    vi.mocked(compressImage).mockResolvedValue(blob);
    vi.mocked(uploadImage).mockResolvedValue({ url: "https://cdn.example.com/uploads/a.jpg" });
  });

  it("menghubungkan label dengan input file", () => {
    const wrapper = mount(ImagePicker, { props });
    expect(wrapper.find("label").attributes("for")).toBe("pic");
    expect(wrapper.find("input").attributes("id")).toBe("pic");
    expect(wrapper.find("input").attributes("accept")).toContain("image/jpeg");
  });

  it("menampilkan placeholder dan tanpa tombol hapus saat belum ada gambar", () => {
    const wrapper = mount(ImagePicker, { props });
    expect(wrapper.text()).toContain("Belum ada gambar");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("menampilkan pratinjau dengan teks alternatif", () => {
    const wrapper = mount(ImagePicker, {
      props: { ...props, modelValue: "https://cdn.example.com/uploads/b.jpg" },
    });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://cdn.example.com/uploads/b.jpg");
    expect(img.attributes("alt")).toBe("Pratinjau Foto");
    expect(img.classes()).toContain("rounded-xl");
  });

  it("memakai bentuk bulat untuk mode rounded, pada placeholder maupun pratinjau", () => {
    const empty = mount(ImagePicker, { props: { ...props, rounded: true } });
    expect(empty.find("div.border-dashed").classes()).toContain("rounded-full");
    const filled = mount(ImagePicker, {
      props: { ...props, rounded: true, modelValue: "https://cdn.example.com/uploads/b.jpg" },
    });
    expect(filled.find("img").classes()).toContain("rounded-full");
  });

  it("mengompres, mengunggah, lalu memancarkan URL gambar", async () => {
    const wrapper = mount(ImagePicker, { props });
    await choose(wrapper, [file]);
    expect(compressImage).toHaveBeenCalledWith(file, 1024);
    expect(uploadImage).toHaveBeenCalledWith(blob, expect.stringMatching(/\.jpg$/));
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["https://cdn.example.com/uploads/a.jpg"]);
  });

  it("memakai maxSize kustom", async () => {
    const wrapper = mount(ImagePicker, { props: { ...props, maxSize: 256 } });
    await choose(wrapper, [file]);
    expect(compressImage).toHaveBeenCalledWith(file, 256);
  });

  it("menampilkan error dan tidak memancarkan nilai jika file ditolak", async () => {
    vi.mocked(compressImage).mockRejectedValue(new Error("Ukuran gambar maksimal 5 MB"));
    const wrapper = mount(ImagePicker, { props });
    await choose(wrapper, [file]);
    expect(showErrorDialog).toHaveBeenCalledWith("Ukuran gambar maksimal 5 MB");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("tidak melakukan apa pun jika tidak ada file yang dipilih", async () => {
    const wrapper = mount(ImagePicker, { props });
    await choose(wrapper, []);
    expect(compressImage).not.toHaveBeenCalled();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("menampilkan status unggah dan menonaktifkan input selama mengunggah", async () => {
    const pending = deferred<{ url: string }>();
    vi.mocked(uploadImage).mockReturnValue(pending.promise);
    const wrapper = mount(ImagePicker, { props });
    await choose(wrapper, [file]);
    expect(wrapper.find("[role=status]").text()).toContain("Mengunggah");
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    pending.resolve({ url: "https://cdn.example.com/uploads/a.jpg" });
    await flushPromises();
    expect(wrapper.find("[role=status]").exists()).toBe(false);
    expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
  });

  it("menampilkan error dan tidak memancarkan nilai jika unggah gagal", async () => {
    vi.mocked(uploadImage).mockRejectedValue(new Error("Tidak dapat terhubung ke server"));
    const wrapper = mount(ImagePicker, { props });
    await choose(wrapper, [file]);
    expect(showErrorDialog).toHaveBeenCalledWith("Tidak dapat terhubung ke server");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("tombol hapus memancarkan null", async () => {
    const wrapper = mount(ImagePicker, {
      props: { ...props, modelValue: "https://cdn.example.com/uploads/b.jpg" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([null]);
  });
});
