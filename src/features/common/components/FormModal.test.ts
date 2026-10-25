import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FormModal from "./FormModal.vue";

const props = { open: true, title: "Judul", testId: "my-modal", isSubmitting: false };
const mountModal = (override: Record<string, unknown> = {}) =>
  mount(FormModal, { props: { ...props, ...override }, slots: { default: "<p>isi</p>" } });

describe("FormModal", () => {
  it("tidak merender apa pun saat tertutup", () => {
    expect(mountModal({ open: false }).find("form").exists()).toBe(false);
  });

  it("menampilkan judul, slot, dan test id", () => {
    const wrapper = mountModal();
    expect(wrapper.find('[data-testid="my-modal"]').exists()).toBe(true);
    expect(wrapper.find("h2").text()).toBe("Judul");
    expect(wrapper.text()).toContain("isi");
  });

  it("memancarkan close dari tombol tutup, batal, dan klik latar", async () => {
    const wrapper = mountModal();
    await wrapper.find('[aria-label="Tutup"]').trigger("click");
    await wrapper.find("button.btn-ghost").trigger("click");
    await wrapper.find('[data-testid="my-modal"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });

  it("memancarkan submit dan menonaktifkan tombol saat menyimpan", async () => {
    const wrapper = mountModal();
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toHaveLength(1);
    expect(wrapper.find("button[type=submit]").text()).toBe("Simpan");
    await wrapper.setProps({ isSubmitting: true });
    const submit = wrapper.find("button[type=submit]");
    expect(submit.text()).toBe("Menyimpan...");
    expect(submit.attributes("disabled")).toBeDefined();
  });
});
