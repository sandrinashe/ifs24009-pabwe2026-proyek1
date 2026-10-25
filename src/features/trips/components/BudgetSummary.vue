<script setup lang="ts">
import { PiggyBank, TrendingUp, Wallet } from "lucide-vue-next";
import type { TripSummary } from "../api/tripApi";
import {
  CATEGORY_COLORS,
  formatCurrency,
  usageBarClass,
} from "../../../helpers/toolsHelper";

defineProps<{ summary: TripSummary }>();
</script>

<template>
  <section class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="card p-5">
        <div class="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <Wallet :size="16" /> Total Anggaran
        </div>
        <p class="text-xl font-extrabold" data-testid="total-budget">
          {{ formatCurrency(summary.total_budget) }}
        </p>
      </div>
      <div class="card p-5">
        <div class="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <TrendingUp :size="16" /> Total Pengeluaran
        </div>
        <p class="text-xl font-extrabold" data-testid="total-expenses">
          {{ formatCurrency(summary.total_expenses) }}
        </p>
      </div>
      <div class="card p-5">
        <div class="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <PiggyBank :size="16" /> Sisa Anggaran
        </div>
        <p
          class="text-xl font-extrabold"
          :class="summary.remaining_budget < 0 ? 'text-rose-600' : 'text-emerald-600'"
          data-testid="remaining-budget"
        >
          {{ formatCurrency(summary.remaining_budget) }}
        </p>
      </div>
    </div>

    <div class="card p-5">
      <div class="mb-2 flex items-center justify-between text-sm font-semibold">
        <span>Penggunaan Anggaran</span>
        <span data-testid="usage-percentage">{{ summary.usage_percentage }}%</span>
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full transition-all"
          :class="usageBarClass(summary.usage_percentage)"
          :style="{ width: Math.min(summary.usage_percentage, 100) + '%' }"
          data-testid="usage-bar"
        />
      </div>

      <h3 class="mb-3 mt-6 text-sm font-bold text-slate-700">Rincian per Kategori</h3>
      <p v-if="summary.by_category.length === 0" class="text-sm text-slate-400">
        Belum ada pengeluaran yang tercatat.
      </p>
      <ul v-else class="space-y-3">
        <li v-for="item in summary.by_category" :key="item.category" data-testid="category-row">
          <div class="mb-1 flex justify-between text-sm">
            <span class="font-medium">{{ item.category }}</span>
            <span class="text-slate-500">{{ formatCurrency(item.total) }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full"
              :class="CATEGORY_COLORS[item.category]"
              :style="{ width: (item.total / summary.total_expenses) * 100 + '%' }"
            />
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
