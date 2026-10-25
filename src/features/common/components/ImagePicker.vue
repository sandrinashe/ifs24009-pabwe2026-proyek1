<script setup lang="ts">
import { compressImage } from "../../../helpers/imageHelper";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    inputId: string;
    label: string;
    maxSize?: number;
    rounded?: boolean;
  }>(),
  { maxSize: 1024, rounded: false }
);
const emit = defineEmits<{ (e: "update:modelValue", value: string | null): void }>();

async function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files![0];
  if (!file) return;
  try {
    emit("update:modelValue", await compressImage(file, props.maxSize));
  } catch (error) {
    showErrorDialog((error as Error).message);
  }
  // Kosongkan agar file yang sama bisa dipilih ulang.
  input.value = "";
}
</script>

<template>
  <div class="space-y-2">
    <label class="label-field" :for="inputId">{{ label }}</label>
    <div class="flex items-center gap-4">
      <img
        v-if="modelValue"
        :src="modelValue"
        :alt="`Pratinjau ${label}`"
        class="h-24 w-24 shrink-0 object-cover"
        :class="rounded ? 'rounded-full' : 'rounded-xl'"
      />
      <div
        v-else
        class="flex h-24 w-24 shrink-0 items-center justify-center border border-dashed border-slate-300 bg-slate-50 p-2 text-center text-xs text-slate-600"
        :class="rounded ? 'rounded-full' : 'rounded-xl'"
      >
        Belum ada gambar
      </div>
      <div class="min-w-0 space-y-2">
        <input
          :id="inputId"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
          @change="onChange"
        />
        <button
          v-if="modelValue"
          type="button"
          class="btn-ghost !px-3 !py-1.5 !text-xs"
          @click="emit('update:modelValue', null)"
        >
          Hapus gambar
        </button>
      </div>
    </div>
  </div>
</template>
