<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { Itinerary } from "../api/itineraryApi";
import FormModal from "../../common/components/FormModal.vue";
import { useTripsStore } from "../states/tripsStore";
import { notifyResult } from "../../../helpers/notifyHelper";

const props = defineProps<{ open: boolean; itinerary: Itinerary | null }>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useTripsStore();
const isSubmitting = ref(false);
const form = reactive({
  day_number: 1,
  title: "",
  location: "",
  time: "",
  notes: "",
});

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    form.day_number = props.itinerary?.day_number ?? 1;
    form.title = props.itinerary?.title ?? "";
    form.location = props.itinerary?.location ?? "";
    form.time = props.itinerary?.time ?? "";
    form.notes = props.itinerary?.notes ?? "";
  },
  { immediate: true }
);

async function onSubmit() {
  isSubmitting.value = true;
  const success = notifyResult(
    await store.asyncSaveItinerary(
      { ...form, day_number: Number(form.day_number) },
      props.itinerary?.id
    )
  );
  isSubmitting.value = false;
  if (success) emit("saved");
}
</script>

<template>
  <FormModal
    :open="open"
    :title="itinerary ? 'Ubah Agenda' : 'Tambah Agenda'"
    test-id="itinerary-modal"
    :is-submitting="isSubmitting"
    @close="emit('close')"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label-field" for="it-day">Hari ke-</label>
        <input id="it-day" v-model.number="form.day_number" type="number" min="1" step="1" required class="input-field" />
      </div>
      <div>
        <label class="label-field" for="it-time">Jam</label>
        <input id="it-time" v-model="form.time" type="time" class="input-field" />
      </div>
    </div>
    <div>
      <label class="label-field" for="it-title">Nama Kegiatan</label>
      <input id="it-title" v-model="form.title" required class="input-field" placeholder="Snorkeling di Nusa Penida" />
    </div>
    <div>
      <label class="label-field" for="it-location">Lokasi</label>
      <input id="it-location" v-model="form.location" class="input-field" placeholder="Crystal Bay" />
    </div>
    <div>
      <label class="label-field" for="it-notes">Catatan</label>
      <textarea id="it-notes" v-model="form.notes" rows="3" class="input-field" placeholder="Bawa sunscreen" />
    </div>
  </FormModal>
</template>
