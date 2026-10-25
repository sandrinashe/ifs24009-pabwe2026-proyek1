import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { makeExpense } from "../../../test-utils";
import ExpensePanel from "./ExpensePanel.vue";

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

  it("memancarkan event add dan delete", async () => {
    const item = makeExpense();
    const wrapper = mount(ExpensePanel, { props: { items: [item] } });
    await wrapper.find("button.btn-primary").trigger("click");
    await wrapper.find('[aria-label="Hapus pengeluaran"]').trigger("click");
    expect(wrapper.emitted("add")).toHaveLength(1);
    expect(wrapper.emitted("delete")![0]).toEqual([item]);
  });
});
