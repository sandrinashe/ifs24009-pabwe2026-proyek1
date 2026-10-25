<script setup lang="ts">
import { X } from "lucide-vue-next";

defineProps<{
  open: boolean;
  title: string;
  testId: string;
  isSubmitting: boolean;
}>();
const emit = defineEmits<{ (e: "close"): void; (e: "submit"): void }>();
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
    :data-testid="testId"
    @click.self="emit('close')"
  >
    <form
      class="card w-full max-w-lg space-y-4 p-6 shadow-2xl"
      @submit.prevent="emit('submit')"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold">{{ title }}</h2>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Tutup"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <slot />

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>
    </form>
  </div>
</template>
