import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as tripApi from "../api/tripApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { deferred, makeTrip, renderWithProviders } from "../../../test-utils";
import TripModal from "../modals/TripModal.vue";
import HomePage from "./HomePage.vue";

vi.mock("../api/tripApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const trips = [
  makeTrip({ id: 1, title: "Liburan Bali", total_expenses: 1000000 }),
  makeTrip({ id: 2, title: "Trip Tanpa Data", total_expenses: undefined }),
];

const buttonByText = (wrapper: { findAll: (s: string) => any[] }, text: string) =>
  wrapper.findAll("button").find((b) => b.text().includes(text))!;

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(tripApi.getTrips).mockResolvedValue(trips);
    vi.mocked(tripApi.deleteTrip).mockResolvedValue(null);
    vi.mocked(tripApi.createTrip).mockResolvedValue(makeTrip());
    vi.mocked(tripApi.updateTrip).mockResolvedValue(makeTrip());
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
  });

  it("menampilkan status memuat lalu daftar perjalanan", async () => {
    const pending = deferred<tripApi.Trip[]>();
    vi.mocked(tripApi.getTrips).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Memuat perjalanan...");
    pending.resolve(trips);
    await flushPromises();
    expect(wrapper.text()).not.toContain("Memuat perjalanan...");
    const cards = wrapper.findAll('[data-testid="trip-card"]');
    expect(cards).toHaveLength(2);
    expect(cards[0].text()).toContain("Liburan Bali");
    expect(cards[0].text()).toContain("Bali");
    expect(cards[0].find("a").attributes("href")).toBe("/trips/1");
    expect(cards[1].text()).toContain("Trip Tanpa Data");
  });

  it("menampilkan keadaan kosong jika belum ada perjalanan", async () => {
    vi.mocked(tripApi.getTrips).mockResolvedValue([]);
    const { wrapper } = await renderWithProviders(HomePage);
    await flushPromises();
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it("membuka modal untuk perjalanan baru", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await flushPromises();
    expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(false);
    await buttonByText(wrapper, "Perjalanan Baru").trigger("click");
    expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(true);
    expect(wrapper.findComponent(TripModal).props("trip")).toBeNull();
  });

  it("membuka modal berisi data saat mengubah, lalu menutupnya", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await flushPromises();
    await wrapper.findAll('[aria-label="Ubah perjalanan"]')[0].trigger("click");
    expect(wrapper.findComponent(TripModal).props("trip")).toMatchObject({ id: 1 });
    await wrapper.find('[aria-label="Tutup"]').trigger("click");
    expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(false);
  });

  it("menutup modal dan memuat ulang daftar setelah tersimpan", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await flushPromises();
    await buttonByText(wrapper, "Perjalanan Baru").trigger("click");
    wrapper.findComponent(TripModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(false);
    expect(tripApi.getTrips).toHaveBeenCalledTimes(2);
  });

  it("menghapus perjalanan setelah dikonfirmasi lalu memuat ulang", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await flushPromises();
    await wrapper.findAll('[aria-label="Hapus perjalanan"]')[0].trigger("click");
    await flushPromises();
    expect(showConfirmDialog).toHaveBeenCalled();
    expect(tripApi.deleteTrip).toHaveBeenCalledWith(1);
    expect(tripApi.getTrips).toHaveBeenCalledTimes(2);
  });

  it("tidak menghapus jika konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper } = await renderWithProviders(HomePage);
    await flushPromises();
    await wrapper.findAll('[aria-label="Hapus perjalanan"]')[0].trigger("click");
    await flushPromises();
    expect(tripApi.deleteTrip).not.toHaveBeenCalled();
    expect(tripApi.getTrips).toHaveBeenCalledTimes(1);
  });
});
