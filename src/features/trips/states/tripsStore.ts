import { ref } from "vue";
import { defineStore } from "pinia";
import * as tripApi from "../api/tripApi";
import * as itineraryApi from "../api/itineraryApi";
import * as expenseApi from "../api/expenseApi";
import type { Trip, TripDetail, TripPayload } from "../api/tripApi";
import type { Itinerary, ItineraryPayload } from "../api/itineraryApi";
import type { Expense, ExpensePayload } from "../api/expenseApi";
import type { ActionResult } from "../../../helpers/notifyHelper";

export const useTripsStore = defineStore("trips", () => {
  const trips = ref<Trip[]>([]);
  const current = ref<TripDetail | null>(null);
  const itineraries = ref<Itinerary[]>([]);
  const expenses = ref<Expense[]>([]);
  const isLoading = ref(false);

  /**
   * Menjalankan aksi async dan mengembalikan hasilnya sebagai ActionResult.
   * Store tidak menampilkan notifikasi; itu tanggung jawab komponen pemanggil.
   */
  async function run(
    action: () => Promise<void>,
    successMessage = ""
  ): Promise<ActionResult> {
    try {
      await action();
      return { success: true, message: successMessage };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async function withLoading(
    action: () => Promise<void>
  ): Promise<ActionResult> {
    isLoading.value = true;
    const result = await run(action);
    isLoading.value = false;
    return result;
  }

  const refreshCurrent = async () => {
    current.value = await tripApi.getTrip(current.value!.id);
  };

  const asyncFetchTrips = () =>
    withLoading(async () => {
      trips.value = await tripApi.getTrips();
    });

  const asyncFetchTripDetail = (id: number) =>
    withLoading(async () => {
      const [detail, items, spending] = await Promise.all([
        tripApi.getTrip(id),
        itineraryApi.getItineraries(id),
        expenseApi.getExpenses(id),
      ]);
      current.value = detail;
      itineraries.value = items;
      expenses.value = spending;
    });

  const asyncSaveTrip = (payload: TripPayload, id?: number) =>
    run(
      async () => {
        if (id === undefined) await tripApi.createTrip(payload);
        else await tripApi.updateTrip(id, payload);
      },
      id === undefined
        ? "Perjalanan berhasil dibuat"
        : "Perjalanan berhasil diperbarui"
    );

  const asyncDeleteTrip = (id: number) =>
    run(async () => {
      await tripApi.deleteTrip(id);
    }, "Perjalanan berhasil dihapus");

  const asyncSaveItinerary = (payload: ItineraryPayload, id?: number) =>
    run(
      async () => {
        if (id === undefined) {
          await itineraryApi.createItinerary(current.value!.id, payload);
        } else {
          await itineraryApi.updateItinerary(id, payload);
        }
        itineraries.value = await itineraryApi.getItineraries(
          current.value!.id
        );
      },
      id === undefined
        ? "Agenda berhasil ditambahkan"
        : "Agenda berhasil diperbarui"
    );

  const asyncDeleteItinerary = (id: number) =>
    run(async () => {
      await itineraryApi.deleteItinerary(id);
      itineraries.value = await itineraryApi.getItineraries(current.value!.id);
    }, "Agenda berhasil dihapus");

  const asyncSaveExpense = (payload: ExpensePayload) =>
    run(async () => {
      await expenseApi.createExpense(current.value!.id, payload);
      expenses.value = await expenseApi.getExpenses(current.value!.id);
      await refreshCurrent();
    }, "Pengeluaran berhasil dicatat");

  const asyncDeleteExpense = (id: number) =>
    run(async () => {
      await expenseApi.deleteExpense(id);
      expenses.value = await expenseApi.getExpenses(current.value!.id);
      await refreshCurrent();
    }, "Pengeluaran berhasil dihapus");

  return {
    trips,
    current,
    itineraries,
    expenses,
    isLoading,
    asyncFetchTrips,
    asyncFetchTripDetail,
    asyncSaveTrip,
    asyncDeleteTrip,
    asyncSaveItinerary,
    asyncDeleteItinerary,
    asyncSaveExpense,
    asyncDeleteExpense,
  };
});
