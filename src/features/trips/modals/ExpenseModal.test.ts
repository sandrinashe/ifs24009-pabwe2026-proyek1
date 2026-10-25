import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as tripApi from "../api/tripApi";
import * as expenseApi from "../api/expenseApi";
import { useTripsStore } from "../states/tripsStore";
import {
  deferred,
  makeDetail,
  makeExpense,
  renderWithProviders,
} from "../../../test-utils";
import ExpenseModal from "./ExpenseModal.vue";

vi.mock("../api/tripApi");
vi.mock("../api/expenseApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const value = (wrapper: { find: (s: string) => { element: Element } }, selector: string) =>
  (wrapper.find(selector).element as HTMLInputElement).value;

async function render(props: Record<string, unknown>) {
  const result = await renderWithProviders(ExpenseModal, { props });
  useTripsStore(result.pinia).current = makeDetail();
  return result;
}

describe("ExpenseModal", () => {
  beforeEach(() => {
    vi.mocked(expenseApi.createExpense).mockResolvedValue(makeExpense());
    vi.mocked(expenseApi.getExpenses).mockResolvedValue([]);
    vi.mocked(tripApi.getTrip).mockResolvedValue(makeDetail());
  });

  it("tidak merender apa pun saat tertutup", async () => {
    const { wrapper } = await render({ open: false, defaultDate: "2026-12-01" });
    expect(wrapper.find('[data-testid="expense-modal"]').exists()).toBe(false);
  });

  it("menampilkan form dengan tanggal dan kategori bawaan", async () => {
    const { wrapper } = await render({ open: true, defaultDate: "2026-12-01" });
    expect(value(wrapper, "#ex-date")).toBe("2026-12-01");
    expect(value(wrapper, "#ex-category")).toBe("Akomodasi");
    expect(wrapper.findAll("option")).toHaveLength(5);
  });

  it("mencatat pengeluaran baru", async () => {
    const { wrapper } = await render({ open: true, defaultDate: "2026-12-01" });
    await wrapper.find("#ex-name").setValue("Makan malam");
    await wrapper.find("#ex-amount").setValue("150000");
    await wrapper.find("#ex-date").setValue("2026-12-02");
    await wrapper.find("#ex-category").setValue("Makanan");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(expenseApi.createExpense).toHaveBeenCalledWith(1, {
      name: "Makan malam",
      amount: 150000,
      date: "2026-12-02",
      category: "Makanan",
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("mengosongkan form setiap kali dibuka kembali", async () => {
    const { wrapper } = await render({ open: false, defaultDate: "2026-12-01" });
    await wrapper.setProps({ open: true });
    await wrapper.find("#ex-name").setValue("Sisa input");
    await wrapper.setProps({ open: false });
    await wrapper.setProps({ open: true });
    expect(value(wrapper, "#ex-name")).toBe("");
  });

  it("tidak memancarkan saved jika gagal", async () => {
    vi.mocked(expenseApi.createExpense).mockRejectedValue(new Error("Gagal"));
    const { wrapper } = await render({ open: true, defaultDate: "2026-12-01" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menonaktifkan tombol simpan selama proses", async () => {
    const pending = deferred<expenseApi.Expense>();
    vi.mocked(expenseApi.createExpense).mockReturnValue(pending.promise);
    const { wrapper } = await render({ open: true, defaultDate: "2026-12-01" });
    await wrapper.find("form").trigger("submit");
    expect(wrapper.find('button[type="submit"]').text()).toBe("Menyimpan...");
    pending.resolve(makeExpense());
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').text()).toBe("Simpan");
  });

  it("memancarkan close dari tombol X, tombol Batal, dan klik latar", async () => {
    const { wrapper } = await render({ open: true, defaultDate: "2026-12-01" });
    await wrapper.find('[aria-label="Tutup"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal")!.trigger("click");
    await wrapper.find('[data-testid="expense-modal"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});
