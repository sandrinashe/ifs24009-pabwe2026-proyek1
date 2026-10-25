<script setup lang="ts">
import { computed } from "vue";
import { Clock, MapPin, Pencil, Plus, StickyNote, Trash2 } from "lucide-vue-next";
import type { Itinerary } from "../api/itineraryApi";

const props = defineProps<{ items: Itinerary[] }>();
defineEmits<{
  (e: "add"): void;
  (e: "edit", item: Itinerary): void;
  (e: "delete", item: Itinerary): void;
}>();

// Items sudah diurutkan dari API (hari, lalu jam); kelompokkan per hari
const groups = computed(() => {
  const map = new Map<number, Itinerary[]>();
  for (const item of props.items) {
    map.set(item.day_number, [...(map.get(item.day_number) ?? []), item]);
  }
  return [...map.entries()].map(([day, items]) => ({ day, items }));
});
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-extrabold">Agenda Harian</h2>
      <button class="btn-primary" @click="$emit('add')">
        <Plus :size="16" /> Tambah Agenda
      </button>
    </div>

    <p v-if="groups.length === 0" class="card p-8 text-center text-sm text-slate-400">
      Belum ada agenda. Mulai susun kegiatan hari pertamamu!
    </p>

    <div v-for="group in groups" :key="group.day" class="card overflow-hidden" data-testid="day-group">
      <div class="bg-brand-50 px-5 py-2.5 text-sm font-extrabold text-brand-700">
        Hari {{ group.day }}
      </div>
      <ul class="divide-y divide-slate-100">
        <li v-for="item in group.items" :key="item.id" class="flex items-start justify-between gap-3 px-5 py-4" data-testid="itinerary-item">
          <div class="space-y-1">
            <p class="font-semibold">{{ item.title }}</p>
            <p v-if="item.time" class="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock :size="12" /> {{ item.time }}
            </p>
            <p v-if="item.location" class="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin :size="12" /> {{ item.location }}
            </p>
            <p v-if="item.notes" class="flex items-center gap-1.5 text-xs text-slate-500">
              <StickyNote :size="12" /> {{ item.notes }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" aria-label="Ubah agenda" @click="$emit('edit', item)">
              <Pencil :size="16" />
            </button>
            <button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus agenda" @click="$emit('delete', item)">
              <Trash2 :size="16" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
