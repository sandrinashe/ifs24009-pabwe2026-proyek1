import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as tripApi from "../api/tripApi";
import * as itineraryApi from "../api/itineraryApi";
import * as expenseApi from "../api/expenseApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  deferred,
  makeDetail,
  makeExpense,
  makeItinerary,
  renderWithProviders,
} from "../../../test-utils";
import TripModal from "../modals/TripModal.vue";
import ItineraryModal from "../modals/ItineraryModal.vue";
import ExpenseModal from "../modals/ExpenseModal.vue";
import DetailPage from "./DetailPage.vue";

vi.mock("../api/tripApi");
vi.mock("../api/itineraryApi");
vi.mock("../api/expenseApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const render = async () => {
  const result = await renderWithProviders(DetailPage, { route: "/trips/1" });
  await flushPromises();
  return result;
};

describe("DetailPage", () => {
  beforeEach(() => {
    vi.mocked(tripApi.getTrip).mockResolvedValue(makeDetail());
    vi.mocked(tripApi.deleteTrip).mockResolvedValue(null);
    vi.mocked(itineraryApi.getItineraries).mockResolvedValue([makeItinerary()]);
    vi.mocked(itineraryApi.deleteItinerary).mockResolvedValue(null);
    vi.mocked(expenseApi.getExpenses).mockResolvedValue([makeExpense()]);
    vi.mocked(expenseApi.deleteExpense).mockResolvedValue(null);
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
  });

  it("menampilkan status memuat sebelum data tiba", async () => {
    const pending = deferred<tripApi.TripDetail>();
    vi.mocked(tripApi.getTrip).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(DetailPage, { route: "/trips/1" });
    expect(wrapper.text()).toContain("Memuat detail perjalanan...");
    expect(wrapper.find("h1").text()).toBe("Detail Perjalanan");
    pending.resolve(makeDetail());
    await flushPromises();
    expect(wrapper.text()).not.toContain("Memuat detail perjalanan...");
  });

  it("menampilkan informasi perjalanan, ringkasan anggaran, dan agenda", async () => {
    const { wrapper } = await render();
    expect(tripApi.getTrip).toHaveBeenCalledWith(1);
    expect(wrapper.find('[data-testid="trip-title"]').text()).toBe("Liburan Bali");
    expect(wrapper.text()).toContain("5 hari");
    expect(wrapper.find('[data-testid="total-budget"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="itinerary-item"]')).toHaveLength(1);
  });

  it("kembali ke beranda jika perjalanan gagal dimuat", async () => {
    vi.mocked(tripApi.getTrip).mockRejectedValue(new Error("Perjalanan tidak ditemukan"));
    const { router } = await render();
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("berpindah antar tab agenda dan pengeluaran", async () => {
    const { wrapper } = await render();
    await wrapper.find('[data-testid="tab-expense"]').trigger("click");
    expect(wrapper.findAll('[data-testid="expense-item"]')).toHaveLength(1);
    expect(wrapper.findAll('[data-testid="itinerary-item"]')).toHaveLength(0);
    await wrapper.find('[data-testid="tab-itinerary"]').trigger("click");
    expect(wrapper.findAll('[data-testid="itinerary-item"]')).toHaveLength(1);
  });

  describe("agenda", () => {
    it("membuka modal tambah agenda lalu menutupnya setelah tersimpan", async () => {
      const { wrapper } = await render();
      await wrapper.find("button.btn-primary").trigger("click");
      expect(wrapper.findComponent(ItineraryModal).props("itinerary")).toBeNull();
      expect(wrapper.find('[data-testid="itinerary-modal"]').exists()).toBe(true);
      wrapper.findComponent(ItineraryModal).vm.$emit("saved");
      await flushPromises();
      expect(wrapper.find('[data-testid="itinerary-modal"]').exists()).toBe(false);
    });

    it("membuka modal ubah agenda berisi data lalu menutupnya", async () => {
      const { wrapper } = await render();
      await wrapper.find('[aria-label="Ubah agenda"]').trigger("click");
      expect(wrapper.findComponent(ItineraryModal).props("itinerary")).toMatchObject({ id: 1 });
      await wrapper.find('[aria-label="Tutup"]').trigger("click");
      expect(wrapper.find('[data-testid="itinerary-modal"]').exists()).toBe(false);
    });

    it("menghapus agenda setelah dikonfirmasi", async () => {
      const { wrapper } = await render();
      await wrapper.find('[aria-label="Hapus agenda"]').trigger("click");
      await flushPromises();
      expect(itineraryApi.deleteItinerary).toHaveBeenCalledWith(1);
    });

    it("tidak menghapus agenda jika dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { wrapper } = await render();
      await wrapper.find('[aria-label="Hapus agenda"]').trigger("click");
      await flushPromises();
      expect(itineraryApi.deleteItinerary).not.toHaveBeenCalled();
    });
  });

  describe("pengeluaran", () => {
    const openExpenseTab = async () => {
      const result = await render();
      await result.wrapper.find('[data-testid="tab-expense"]').trigger("click");
      return result;
    };

    it("membuka modal catat pengeluaran lalu menutupnya setelah tersimpan", async () => {
      const { wrapper } = await openExpenseTab();
      await wrapper.find("button.btn-primary").trigger("click");
      expect(wrapper.find('[data-testid="expense-modal"]').exists()).toBe(true);
      expect(wrapper.findComponent(ExpenseModal).props("defaultDate")).toBe("2026-12-01");
      wrapper.findComponent(ExpenseModal).vm.$emit("saved");
      await flushPromises();
      expect(wrapper.find('[data-testid="expense-modal"]').exists()).toBe(false);
    });

    it("menutup modal pengeluaran tanpa menyimpan", async () => {
      const { wrapper } = await openExpenseTab();
      await wrapper.find("button.btn-primary").trigger("click");
      await wrapper.find('[aria-label="Tutup"]').trigger("click");
      expect(wrapper.find('[data-testid="expense-modal"]').exists()).toBe(false);
    });

    it("menghapus pengeluaran setelah dikonfirmasi", async () => {
      const { wrapper } = await openExpenseTab();
      await wrapper.find('[aria-label="Hapus pengeluaran"]').trigger("click");
      await flushPromises();
      expect(expenseApi.deleteExpense).toHaveBeenCalledWith(1);
    });
  });

  describe("ubah & hapus perjalanan", () => {
    const buttonByText = (wrapper: { findAll: (s: string) => any[] }, text: string) =>
      wrapper.findAll("button").find((b) => b.text().includes(text))!;

    it("membuka modal ubah perjalanan dan memuat ulang setelah tersimpan", async () => {
      const { wrapper } = await render();
      await buttonByText(wrapper, "Ubah").trigger("click");
      expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(true);
      wrapper.findComponent(TripModal).vm.$emit("saved");
      await flushPromises();
      expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(false);
      expect(tripApi.getTrip).toHaveBeenCalledTimes(2);
    });

    it("menutup modal ubah perjalanan tanpa menyimpan", async () => {
      const { wrapper } = await render();
      await buttonByText(wrapper, "Ubah").trigger("click");
      await wrapper.find('[aria-label="Tutup"]').trigger("click");
      expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(false);
    });

    it("menghapus perjalanan lalu kembali ke beranda", async () => {
      const { wrapper, router } = await render();
      await buttonByText(wrapper, "Hapus").trigger("click");
      await flushPromises();
      expect(tripApi.deleteTrip).toHaveBeenCalledWith(1);
      expect(router.currentRoute.value.path).toBe("/");
    });

    it("tetap di halaman jika penghapusan gagal", async () => {
      vi.mocked(tripApi.deleteTrip).mockRejectedValue(new Error("Gagal"));
      const { wrapper, router } = await render();
      await buttonByText(wrapper, "Hapus").trigger("click");
      await flushPromises();
      expect(router.currentRoute.value.path).toBe("/trips/1");
    });

    it("tidak menghapus jika konfirmasi dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { wrapper } = await render();
      await buttonByText(wrapper, "Hapus").trigger("click");
      await flushPromises();
      expect(tripApi.deleteTrip).not.toHaveBeenCalled();
    });
  });
});
