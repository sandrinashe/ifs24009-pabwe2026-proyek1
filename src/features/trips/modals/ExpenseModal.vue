<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { EXPENSE_CATEGORIES } from "../../../helpers/toolsHelper";
import { useTripsStore } from "../states/tripsStore";

const props = defineProps<{ open: boolean; defaultDate: string }>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useTripsStore();
const isSubmitting = ref(false);
const form = reactive({
  name: "",
  amount: 0,
  date: "",
  category: EXPENSE_CATEGORIES[0] as string,
});

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    form.name = "";
    form.amount = 0;
    form.date = props.defaultDate;
    form.category = EXPENSE_CATEGORIES[0];
  },
  { immediate: true }
);

async function onSubmit() {
  isSubmitting.value = true;
  const success = await store.asyncSaveExpense({
    ...form,
    amount: Number(form.amount),
  });
  isSubmitting.value = false;
  if (success) emit("saved");
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
    data-testid="expense-modal"
    @click.self="emit('close')"
  >
    <form class="card w-full max-w-lg space-y-4 p-6 shadow-2xl" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Catat Pengeluaran</h2>
        <button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Tutup" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div>
        <label class="label-field" for="ex-name">Nama Pengeluaran</label>
        <input id="ex-name" v-model="form.name" required class="input-field" placeholder="Makan malam di Jimbaran" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label-field" for="ex-amount">Nominal (Rp)</label>
          <input id="ex-amount" v-model.number="form.amount" type="number" min="1" step="1" required class="input-field" />
        </div>
        <div>
          <label class="label-field" for="ex-date">Tanggal</label>
          <input id="ex-date" v-model="form.date" type="date" required class="input-field" />
        </div>
      </div>
      <div>
        <label class="label-field" for="ex-category">Kategori</label>
        <select id="ex-category" v-model="form.category" class="input-field">
          <option v-for="category in EXPENSE_CATEGORIES" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
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
