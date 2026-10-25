<script setup lang="ts">
import { Plus, Trash2 } from "lucide-vue-next";
import type { Expense } from "../api/expenseApi";
import {
  CATEGORY_COLORS,
  formatCurrency,
  formatDate,
} from "../../../helpers/toolsHelper";

defineProps<{ items: Expense[] }>();
defineEmits<{
  (e: "add"): void;
  (e: "delete", item: Expense): void;
}>();
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-extrabold">Catatan Pengeluaran</h2>
      <button class="btn-primary" @click="$emit('add')">
        <Plus :size="16" /> Catat Pengeluaran
      </button>
    </div>

    <p v-if="items.length === 0" class="card p-8 text-center text-sm text-slate-400">
      Belum ada pengeluaran yang dicatat.
    </p>

    <ul v-else class="card divide-y divide-slate-100">
      <li v-for="item in items" :key="item.id" class="flex items-center justify-between gap-3 px-5 py-4" data-testid="expense-item">
        <div>
          <p class="font-semibold">{{ item.name }}</p>
          <p class="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span class="inline-block h-2 w-2 rounded-full" :class="CATEGORY_COLORS[item.category]" />
            {{ item.category }} · {{ formatDate(item.date) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ formatCurrency(item.amount) }}</span>
          <button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus pengeluaran" @click="$emit('delete', item)">
            <Trash2 :size="16" />
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
