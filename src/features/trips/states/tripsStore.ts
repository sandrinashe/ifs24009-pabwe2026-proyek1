import { ref } from "vue";
import { defineStore } from "pinia";
import * as tripApi from "../api/tripApi";
import * as itineraryApi from "../api/itineraryApi";
import * as expenseApi from "../api/expenseApi";
import type { Trip, TripDetail, TripPayload } from "../api/tripApi";
import type { Itinerary, ItineraryPayload } from "../api/itineraryApi";
import type { Expense, ExpensePayload } from "../api/expenseApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const useTripsStore = defineStore("trips", () => {
  const trips = ref<Trip[]>([]);
  const current = ref<TripDetail | null>(null);
  const itineraries = ref<Itinerary[]>([]);
  const expenses = ref<Expense[]>([]);
  const isLoading = ref(false);

  /** Menjalankan aksi async; error ditampilkan lewat dialog dan dikembalikan sebagai false. */
  async function run(action: () => Promise<void>): Promise<boolean> {
    try {
      await action();
      return true;
    } catch (error) {
      showErrorDialog((error as Error).message);
      return false;
    }
  }

  async function withLoading(action: () => Promise<void>): Promise<boolean> {
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
    run(async () => {
      if (id === undefined) {
        await tripApi.createTrip(payload);
        showSuccessDialog("Perjalanan berhasil dibuat");
      } else {
        await tripApi.updateTrip(id, payload);
        showSuccessDialog("Perjalanan berhasil diperbarui");
      }
    });

  const asyncDeleteTrip = (id: number) =>
    run(async () => {
      await tripApi.deleteTrip(id);
      showSuccessDialog("Perjalanan berhasil dihapus");
    });

  const asyncSaveItinerary = (payload: ItineraryPayload, id?: number) =>
    run(async () => {
      if (id === undefined) {
        await itineraryApi.createItinerary(current.value!.id, payload);
        showSuccessDialog("Agenda berhasil ditambahkan");
      } else {
        await itineraryApi.updateItinerary(id, payload);
        showSuccessDialog("Agenda berhasil diperbarui");
      }
      itineraries.value = await itineraryApi.getItineraries(current.value!.id);
    });

  const asyncDeleteItinerary = (id: number) =>
    run(async () => {
      await itineraryApi.deleteItinerary(id);
      showSuccessDialog("Agenda berhasil dihapus");
      itineraries.value = await itineraryApi.getItineraries(current.value!.id);
    });

  const asyncSaveExpense = (payload: ExpensePayload) =>
    run(async () => {
      await expenseApi.createExpense(current.value!.id, payload);
      showSuccessDialog("Pengeluaran berhasil dicatat");
      expenses.value = await expenseApi.getExpenses(current.value!.id);
      await refreshCurrent();
    });

  const asyncDeleteExpense = (id: number) =>
    run(async () => {
      await expenseApi.deleteExpense(id);
      showSuccessDialog("Pengeluaran berhasil dihapus");
      expenses.value = await expenseApi.getExpenses(current.value!.id);
      await refreshCurrent();
    });

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
