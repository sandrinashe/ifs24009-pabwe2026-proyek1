<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, CalendarDays, MapPin, Pencil, Trash2 } from "lucide-vue-next";
import type { Expense } from "../api/expenseApi";
import type { Itinerary } from "../api/itineraryApi";
import { useTripsStore } from "../states/tripsStore";
import BudgetSummary from "../components/BudgetSummary.vue";
import ItineraryPanel from "../components/ItineraryPanel.vue";
import ExpensePanel from "../components/ExpensePanel.vue";
import TripModal from "../modals/TripModal.vue";
import ItineraryModal from "../modals/ItineraryModal.vue";
import ExpenseModal from "../modals/ExpenseModal.vue";
import {
  formatDate,
  getTripDays,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useTripsStore();
const tripId = Number(route.params.tripId);

const tab = ref<"itinerary" | "expense">("itinerary");
const isTripModalOpen = ref(false);
const isItineraryModalOpen = ref(false);
const isExpenseModalOpen = ref(false);
const editingItinerary = ref<Itinerary | null>(null);

onMounted(async () => {
  const success = await store.asyncFetchTripDetail(tripId);
  if (!success) router.replace("/");
});

async function confirmThen(title: string, text: string, action: () => Promise<unknown>) {
  if (await showConfirmDialog(title, text)) await action();
}

async function onDeleteTrip() {
  await confirmThen(
    "Hapus perjalanan?",
    "Seluruh agenda dan pengeluaran terkait ikut terhapus.",
    async () => {
      if (await store.asyncDeleteTrip(tripId)) router.replace("/");
    }
  );
}

const onDeleteItinerary = (item: Itinerary) =>
  confirmThen("Hapus agenda?", `"${item.title}" akan dihapus.`, () =>
    store.asyncDeleteItinerary(item.id)
  );

const onDeleteExpense = (item: Expense) =>
  confirmThen("Hapus pengeluaran?", `"${item.name}" akan dihapus.`, () =>
    store.asyncDeleteExpense(item.id)
  );

function openAddItinerary() {
  editingItinerary.value = null;
  isItineraryModalOpen.value = true;
}

function openEditItinerary(item: Itinerary) {
  editingItinerary.value = item;
  isItineraryModalOpen.value = true;
}

async function onTripSaved() {
  isTripModalOpen.value = false;
  await store.asyncFetchTripDetail(tripId);
}
</script>

<template>
  <div v-if="store.current" class="space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600">
      <ArrowLeft :size="16" /> Semua Perjalanan
    </RouterLink>

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-extrabold" data-testid="trip-title">{{ store.current.title }}</h1>
        <p class="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin :size="14" /> {{ store.current.destination }}
        </p>
        <p class="flex items-center gap-1.5 text-sm text-slate-500">
          <CalendarDays :size="14" />
          {{ formatDate(store.current.start_date) }} – {{ formatDate(store.current.end_date) }}
          ({{ getTripDays(store.current.start_date, store.current.end_date) }} hari)
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost" @click="isTripModalOpen = true">
          <Pencil :size="16" /> Ubah
        </button>
        <button class="btn-ghost !text-rose-600" @click="onDeleteTrip">
          <Trash2 :size="16" /> Hapus
        </button>
      </div>
    </div>

    <BudgetSummary :summary="store.current.summary" />

    <div class="inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
      <button
        class="rounded-xl px-4 py-2"
        :class="tab === 'itinerary' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'"
        data-testid="tab-itinerary"
        @click="tab = 'itinerary'"
      >
        Agenda Harian
      </button>
      <button
        class="rounded-xl px-4 py-2"
        :class="tab === 'expense' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'"
        data-testid="tab-expense"
        @click="tab = 'expense'"
      >
        Pengeluaran
      </button>
    </div>

    <ItineraryPanel
      v-if="tab === 'itinerary'"
      :items="store.itineraries"
      @add="openAddItinerary"
      @edit="openEditItinerary"
      @delete="onDeleteItinerary"
    />
    <ExpensePanel
      v-else
      :items="store.expenses"
      @add="isExpenseModalOpen = true"
      @delete="onDeleteExpense"
    />

    <TripModal
      :open="isTripModalOpen"
      :trip="store.current"
      @close="isTripModalOpen = false"
      @saved="onTripSaved"
    />
    <ItineraryModal
      :open="isItineraryModalOpen"
      :itinerary="editingItinerary"
      @close="isItineraryModalOpen = false"
      @saved="isItineraryModalOpen = false"
    />
    <ExpenseModal
      :open="isExpenseModalOpen"
      :default-date="store.current.start_date"
      @close="isExpenseModalOpen = false"
      @saved="isExpenseModalOpen = false"
    />
  </div>
  <p v-else class="text-sm text-slate-400">Memuat detail perjalanan...</p>
</template>
