import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { compressImage } from "../../../helpers/imageHelper";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import ImagePicker from "./ImagePicker.vue";

vi.mock("../../../helpers/imageHelper");
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn() }));

const props = { modelValue: null, inputId: "pic", label: "Foto" };
const file = new File(["x"], "a.png", { type: "image/png" });

async function choose(wrapper: ReturnType<typeof mount>, files: File[]) {
  const input = wrapper.find("input[type=file]");
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
  await flushPromises();
}

describe("ImagePicker", () => {
  beforeEach(() => {
    vi.mocked(compressImage).mockResolvedValue("data:image/jpeg;base64,AAAA");
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
      props: { ...props, modelValue: "data:image/jpeg;base64,BBBB" },
    });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("data:image/jpeg;base64,BBBB");
    expect(img.attributes("alt")).toBe("Pratinjau Foto");
    expect(img.classes()).toContain("rounded-xl");
  });

  it("memakai bentuk bulat untuk mode rounded, pada placeholder maupun pratinjau", () => {
    const empty = mount(ImagePicker, { props: { ...props, rounded: true } });
    expect(empty.find("div.border-dashed").classes()).toContain("rounded-full");
    const filled = mount(ImagePicker, {
      props: { ...props, rounded: true, modelValue: "data:image/jpeg;base64,BBBB" },
    });
    expect(filled.find("img").classes()).toContain("rounded-full");
  });

  it("mengompres file yang dipilih dengan ukuran bawaan lalu memancarkannya", async () => {
    const wrapper = mount(ImagePicker, { props });
    await choose(wrapper, [file]);
    expect(compressImage).toHaveBeenCalledWith(file, 1024);
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([
      "data:image/jpeg;base64,AAAA",
    ]);
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

  it("tombol hapus memancarkan null", async () => {
    const wrapper = mount(ImagePicker, {
      props: { ...props, modelValue: "data:image/jpeg;base64,BBBB" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([null]);
  });
});
