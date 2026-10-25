import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import BudgetSummary from "./BudgetSummary.vue";
import type { TripSummary } from "../api/tripApi";

const summary = (override: Partial<TripSummary> = {}): TripSummary => ({
  total_budget: 1000000,
  total_expenses: 400000,
  remaining_budget: 600000,
  usage_percentage: 40,
  by_category: [
    { category: "Akomodasi", total: 300000 },
    { category: "Makanan", total: 100000 },
  ],
  ...override,
});

describe("BudgetSummary", () => {
  it("menampilkan statistik anggaran, pengeluaran, dan sisa", () => {
    const wrapper = mount(BudgetSummary, { props: { summary: summary() } });
    expect(wrapper.find('[data-testid="total-budget"]').text()).toContain("1.000.000");
    expect(wrapper.find('[data-testid="total-expenses"]').text()).toContain("400.000");
    expect(wrapper.find('[data-testid="remaining-budget"]').text()).toContain("600.000");
    expect(wrapper.find('[data-testid="remaining-budget"]').classes()).toContain("text-emerald-600");
    expect(wrapper.find('[data-testid="usage-percentage"]').text()).toBe("40%");
    expect(wrapper.find('[data-testid="usage-bar"]').attributes("style")).toContain("width: 40%");
  });

  it("menampilkan rincian per kategori", () => {
    const wrapper = mount(BudgetSummary, { props: { summary: summary() } });
    const rows = wrapper.findAll('[data-testid="category-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Akomodasi");
    expect(rows[0].html()).toContain("width: 75%");
  });

  it("menandai sisa anggaran negatif dan membatasi bar di 100%", () => {
    const wrapper = mount(BudgetSummary, {
      props: {
        summary: summary({
          total_expenses: 1200000,
          remaining_budget: -200000,
          usage_percentage: 120,
        }),
      },
    });
    expect(wrapper.find('[data-testid="remaining-budget"]').classes()).toContain("text-rose-600");
    const bar = wrapper.find('[data-testid="usage-bar"]');
    expect(bar.attributes("style")).toContain("width: 100%");
    expect(bar.classes()).toContain("bg-rose-500");
  });

  it("menampilkan pesan kosong jika belum ada pengeluaran", () => {
    const wrapper = mount(BudgetSummary, {
      props: {
        summary: summary({
          total_expenses: 0,
          remaining_budget: 1000000,
          usage_percentage: 0,
          by_category: [],
        }),
      },
    });
    expect(wrapper.findAll('[data-testid="category-row"]')).toHaveLength(0);
    expect(wrapper.text()).toContain("Belum ada pengeluaran");
  });
});
