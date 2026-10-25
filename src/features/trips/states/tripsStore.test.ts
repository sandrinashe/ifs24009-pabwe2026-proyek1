import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as tripApi from "../api/tripApi";
import * as itineraryApi from "../api/itineraryApi";
import * as expenseApi from "../api/expenseApi";
import { deferred, makeDetail, makeExpense, makeItinerary, makeTrip } from "../../../test-utils";
import { useTripsStore } from "./tripsStore";

vi.mock("../api/tripApi");
vi.mock("../api/itineraryApi");
vi.mock("../api/expenseApi");

const tripPayload = {
  title: "Bali",
  destination: "Bali",
  start_date: "2026-12-01",
  end_date: "2026-12-05",
  total_budget: 1000,
};
const itineraryPayload = {
  day_number: 1,
  title: "Pantai",
  location: "",
  time: "",
  notes: "",
};
const expensePayload = {
  name: "Hotel",
  amount: 1000,
  date: "2026-12-01",
  category: "Akomodasi",
};

describe("tripsStore", () => {
  let store: ReturnType<typeof useTripsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useTripsStore();
    vi.mocked(tripApi.getTrips).mockResolvedValue([makeTrip()]);
    vi.mocked(tripApi.getTrip).mockResolvedValue(makeDetail());
    vi.mocked(itineraryApi.getItineraries).mockResolvedValue([makeItinerary()]);
    vi.mocked(expenseApi.getExpenses).mockResolvedValue([makeExpense()]);
  });

  describe("asyncFetchTrips", () => {
    it("mengisi daftar perjalanan dan mengatur status loading", async () => {
      const pending = deferred<tripApi.Trip[]>();
      vi.mocked(tripApi.getTrips).mockReturnValue(pending.promise);
      const result = store.asyncFetchTrips();
      expect(store.isLoading).toBe(true);
      pending.resolve([makeTrip({ id: 2 })]);
      expect(await result).toMatchObject({ success: true });
      expect(store.isLoading).toBe(false);
      expect(store.trips.map((t) => t.id)).toEqual([2]);
    });

    it("menampilkan error dan mematikan loading jika gagal", async () => {
      vi.mocked(tripApi.getTrips).mockRejectedValue(new Error("Server mati"));
      expect(await store.asyncFetchTrips()).toEqual({
        success: false,
        message: "Server mati",
      });
      expect(store.isLoading).toBe(false);
    });
  });

  it("asyncFetchTripDetail memuat detail, agenda, dan pengeluaran", async () => {
    expect(await store.asyncFetchTripDetail(1)).toMatchObject({ success: true });
    expect(tripApi.getTrip).toHaveBeenCalledWith(1);
    expect(store.current?.title).toBe("Liburan Bali");
    expect(store.itineraries).toHaveLength(1);
    expect(store.expenses).toHaveLength(1);
  });

  it("asyncFetchTripDetail mengembalikan hasil gagal jika salah satu request gagal", async () => {
    vi.mocked(tripApi.getTrip).mockRejectedValue(new Error("Perjalanan tidak ditemukan"));
    expect(await store.asyncFetchTripDetail(99)).toEqual({
      success: false,
      message: "Perjalanan tidak ditemukan",
    });
  });

  describe("asyncSaveTrip", () => {
    it("membuat perjalanan baru jika id tidak diberikan", async () => {
      expect(await store.asyncSaveTrip(tripPayload)).toEqual({
        success: true,
        message: "Perjalanan berhasil dibuat",
      });
      expect(tripApi.createTrip).toHaveBeenCalledWith(tripPayload);
      expect(tripApi.updateTrip).not.toHaveBeenCalled();
    });

    it("memperbarui perjalanan jika id diberikan", async () => {
      expect(await store.asyncSaveTrip(tripPayload, 5)).toEqual({
        success: true,
        message: "Perjalanan berhasil diperbarui",
      });
      expect(tripApi.updateTrip).toHaveBeenCalledWith(5, tripPayload);
    });

    it("mengembalikan hasil gagal jika API menolak", async () => {
      vi.mocked(tripApi.createTrip).mockRejectedValue(new Error("end_date tidak valid"));
      expect(await store.asyncSaveTrip(tripPayload)).toEqual({
        success: false,
        message: "end_date tidak valid",
      });
    });
  });

  it("asyncDeleteTrip menghapus perjalanan", async () => {
    expect(await store.asyncDeleteTrip(4)).toEqual({
        success: true,
        message: "Perjalanan berhasil dihapus",
      });
    expect(tripApi.deleteTrip).toHaveBeenCalledWith(4);
  });

  describe("agenda harian", () => {
    beforeEach(async () => {
      await store.asyncFetchTripDetail(1);
      vi.mocked(itineraryApi.getItineraries).mockResolvedValue([
        makeItinerary({ id: 1 }),
        makeItinerary({ id: 2 }),
      ]);
    });

    it("asyncSaveItinerary membuat agenda baru lalu memuat ulang daftar", async () => {
      expect(await store.asyncSaveItinerary(itineraryPayload)).toMatchObject({ success: true });
      expect(itineraryApi.createItinerary).toHaveBeenCalledWith(1, itineraryPayload);
      expect(store.itineraries).toHaveLength(2);
    });

    it("asyncSaveItinerary memperbarui agenda jika id diberikan", async () => {
      expect(await store.asyncSaveItinerary(itineraryPayload, 8)).toEqual({
        success: true,
        message: "Agenda berhasil diperbarui",
      });
      expect(itineraryApi.updateItinerary).toHaveBeenCalledWith(8, itineraryPayload);
    });

    it("asyncDeleteItinerary menghapus agenda lalu memuat ulang daftar", async () => {
      expect(await store.asyncDeleteItinerary(8)).toMatchObject({ success: true });
      expect(itineraryApi.deleteItinerary).toHaveBeenCalledWith(8);
      expect(store.itineraries).toHaveLength(2);
    });
  });

  describe("pengeluaran", () => {
    beforeEach(async () => {
      await store.asyncFetchTripDetail(1);
      vi.mocked(expenseApi.getExpenses).mockResolvedValue([
        makeExpense({ id: 1 }),
        makeExpense({ id: 2 }),
      ]);
      vi.mocked(tripApi.getTrip).mockResolvedValue(
        makeDetail({ title: "Setelah refresh" })
      );
    });

    it("asyncSaveExpense mencatat pengeluaran dan menyegarkan ringkasan", async () => {
      expect(await store.asyncSaveExpense(expensePayload)).toMatchObject({ success: true });
      expect(expenseApi.createExpense).toHaveBeenCalledWith(1, expensePayload);
      expect(store.expenses).toHaveLength(2);
      expect(store.current?.title).toBe("Setelah refresh");
    });

    it("asyncDeleteExpense menghapus pengeluaran dan menyegarkan ringkasan", async () => {
      expect(await store.asyncDeleteExpense(2)).toMatchObject({ success: true });
      expect(expenseApi.deleteExpense).toHaveBeenCalledWith(2);
      expect(store.expenses).toHaveLength(2);
      expect(store.current?.title).toBe("Setelah refresh");
    });
  });
});
