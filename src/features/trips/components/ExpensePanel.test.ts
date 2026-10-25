import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { makeExpense } from "../../../test-utils";
import { showImageDialog } from "../../../helpers/toolsHelper";
import ExpensePanel from "./ExpensePanel.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showImageDialog: vi.fn(),
}));

describe("ExpensePanel", () => {
  it("menampilkan pesan kosong jika belum ada pengeluaran", () => {
    const wrapper = mount(ExpensePanel, { props: { items: [] } });
    expect(wrapper.text()).toContain("Belum ada pengeluaran");
    expect(wrapper.findAll('[data-testid="expense-item"]')).toHaveLength(0);
  });

  it("menampilkan nama, kategori, tanggal, dan nominal", () => {
    const wrapper = mount(ExpensePanel, { props: { items: [makeExpense()] } });
    const text = wrapper.find('[data-testid="expense-item"]').text();
    expect(text).toContain("Hotel");
    expect(text).toContain("Akomodasi");
    expect(text).toContain("2026");
    expect(text).toContain("1.000.000");
  });

  it("tidak menampilkan thumbnail jika pengeluaran tanpa bukti", () => {
    const wrapper = mount(ExpensePanel, { props: { items: [makeExpense()] } });
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("menampilkan thumbnail bukti yang membuka gambar saat diklik", async () => {
    const receipt = "data:image/jpeg;base64,AAAA";
    const wrapper = mount(ExpensePanel, {
      props: { items: [makeExpense({ receipt_image: receipt })] },
    });
    expect(wrapper.find("img").attributes("src")).toBe(receipt);
    await wrapper.find('[aria-label="Lihat bukti Hotel"]').trigger("click");
    expect(showImageDialog).toHaveBeenCalledWith(receipt, "Bukti: Hotel");
  });

  it("memancarkan event add dan delete", async () => {
    const item = makeExpense();
    const wrapper = mount(ExpensePanel, { props: { items: [item] } });
    await wrapper.find("button.btn-primary").trigger("click");
    await wrapper.find('[aria-label="Hapus pengeluaran"]').trigger("click");
    expect(wrapper.emitted("add")).toHaveLength(1);
    expect(wrapper.emitted("delete")![0]).toEqual([item]);
  });
});
