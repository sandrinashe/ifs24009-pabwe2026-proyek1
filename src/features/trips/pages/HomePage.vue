<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from "lucide-vue-next";
import type { Trip } from "../api/tripApi";
import { useTripsStore } from "../states/tripsStore";
import { notifyResult } from "../../../helpers/notifyHelper";
import TripModal from "../modals/TripModal.vue";
import {
  formatCurrency,
  formatDate,
  getUsagePercentage,
  showConfirmDialog,
  usageBarClass,
} from "../../../helpers/toolsHelper";

const store = useTripsStore();
const isModalOpen = ref(false);
const editingTrip = ref<Trip | null>(null);

const loadTrips = async () => notifyResult(await store.asyncFetchTrips());

onMounted(loadTrips);

function openCreate() {
  editingTrip.value = null;
  isModalOpen.value = true;
}

function openEdit(trip: Trip) {
  editingTrip.value = trip;
  isModalOpen.value = true;
}

async function onSaved() {
  isModalOpen.value = false;
  await loadTrips();
}

async function onDelete(trip: Trip) {
  const confirmed = await showConfirmDialog(
    "Hapus perjalanan?",
    `"${trip.title}" beserta agenda dan pengeluarannya akan dihapus permanen.`
  );
  if (!confirmed) return;
  notifyResult(await store.asyncDeleteTrip(trip.id));
  await loadTrips();
}

const usageOf = (trip: Trip) =>
  getUsagePercentage(trip.total_expenses ?? 0, trip.total_budget);
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">Perjalanan Saya</h1>
        <p class="text-sm text-slate-600">Semua rencana liburanmu dalam satu tempat.</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <Plus :size="16" /> Perjalanan Baru
      </button>
    </div>

    <p v-if="store.isLoading" class="text-sm text-slate-600">Memuat perjalanan...</p>

    <p
      v-else-if="store.trips.length === 0"
      class="card p-10 text-center text-sm text-slate-600"
      data-testid="empty-state"
    >
      Belum ada perjalanan. Klik "Perjalanan Baru" untuk memulai.
    </p>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="trip in store.trips" :key="trip.id" class="card flex flex-col gap-4 p-5" data-testid="trip-card">
        <RouterLink :to="`/trips/${trip.id}`" class="space-y-2">
          <h2 class="text-lg font-extrabold leading-tight hover:text-brand-600">{{ trip.title }}</h2>
          <p class="flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin :size="14" /> {{ trip.destination }}
          </p>
          <p class="flex items-center gap-1.5 text-sm text-slate-600">
            <CalendarDays :size="14" />
            {{ formatDate(trip.start_date) }} – {{ formatDate(trip.end_date) }}
          </p>
        </RouterLink>

        <div>
          <div class="mb-1 flex justify-between text-xs font-semibold text-slate-600">
            <span>{{ formatCurrency(trip.total_expenses ?? 0) }}</span>
            <span>{{ formatCurrency(trip.total_budget) }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full"
              :class="usageBarClass(usageOf(trip))"
              :style="{ width: Math.min(usageOf(trip), 100) + '%' }"
            />
          </div>
        </div>

        <div class="flex justify-end gap-1 border-t border-slate-100 pt-3">
          <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label="Ubah perjalanan" @click="openEdit(trip)">
            <Pencil :size="16" />
          </button>
          <button class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus perjalanan" @click="onDelete(trip)">
            <Trash2 :size="16" />
          </button>
        </div>
      </article>
    </div>

    <TripModal
      :open="isModalOpen"
      :trip="editingTrip"
      @close="isModalOpen = false"
      @saved="onSaved"
    />
  </div>
</template>
