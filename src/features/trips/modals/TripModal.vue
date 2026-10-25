<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { X } from "lucide-vue-next";
import type { Trip } from "../api/tripApi";
import { useTripsStore } from "../states/tripsStore";

const props = defineProps<{ open: boolean; trip: Trip | null }>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useTripsStore();
const isSubmitting = ref(false);
const form = reactive({
  title: "",
  destination: "",
  start_date: "",
  end_date: "",
  total_budget: 0,
});

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    form.title = props.trip?.title ?? "";
    form.destination = props.trip?.destination ?? "";
    form.start_date = props.trip?.start_date ?? "";
    form.end_date = props.trip?.end_date ?? "";
    form.total_budget = props.trip?.total_budget ?? 0;
  },
  { immediate: true }
);

async function onSubmit() {
  isSubmitting.value = true;
  const success = await store.asyncSaveTrip(
    { ...form, total_budget: Number(form.total_budget) },
    props.trip?.id
  );
  isSubmitting.value = false;
  if (success) emit("saved");
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
    data-testid="trip-modal"
    @click.self="emit('close')"
  >
    <form class="card w-full max-w-lg space-y-4 p-6 shadow-2xl" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold">
          {{ trip ? "Ubah Perjalanan" : "Perjalanan Baru" }}
        </h2>
        <button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Tutup" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div>
        <label class="label-field" for="trip-title">Judul Perjalanan</label>
        <input id="trip-title" v-model="form.title" required class="input-field" placeholder="Liburan Akhir Tahun" />
      </div>
      <div>
        <label class="label-field" for="trip-destination">Lokasi Tujuan</label>
        <input id="trip-destination" v-model="form.destination" required class="input-field" placeholder="Bali, Indonesia" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label-field" for="trip-start">Tanggal Mulai</label>
          <input id="trip-start" v-model="form.start_date" type="date" required class="input-field" />
        </div>
        <div>
          <label class="label-field" for="trip-end">Tanggal Selesai</label>
          <input id="trip-end" v-model="form.end_date" type="date" required :min="form.start_date" class="input-field" />
        </div>
      </div>
      <div>
        <label class="label-field" for="trip-budget">Total Anggaran (Rp)</label>
        <input id="trip-budget" v-model.number="form.total_budget" type="number" min="0" step="1000" required class="input-field" />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>
    </form>
  </div>
</template>
