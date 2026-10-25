<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../states/authStore";
import ImagePicker from "../../common/components/ImagePicker.vue";

const auth = useAuthStore();
const name = ref(auth.user?.name ?? "");
const avatar = ref<string | null>(auth.user?.avatar ?? null);
const isSubmitting = ref(false);

async function onSubmit() {
  isSubmitting.value = true;
  await auth.asyncUpdateProfile({ name: name.value, avatar: avatar.value });
  isSubmitting.value = false;
}
</script>

<template>
  <div class="mx-auto max-w-xl space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold">Profil Saya</h1>
      <p class="text-sm text-slate-600">Perbarui nama dan foto profilmu.</p>
    </div>

    <form class="card space-y-5 p-6" @submit.prevent="onSubmit">
      <ImagePicker
        v-model="avatar"
        input-id="profile-avatar"
        label="Foto Profil"
        :max-size="256"
        rounded
      />
      <div>
        <label class="label-field" for="profile-name">Nama Lengkap</label>
        <input id="profile-name" v-model="name" required class="input-field" />
      </div>
      <div>
        <label class="label-field" for="profile-email">Alamat Email</label>
        <input
          id="profile-email"
          :value="auth.user?.email ?? ''"
          readonly
          class="input-field bg-slate-50 text-slate-600"
        />
      </div>
      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? "Menyimpan..." : "Simpan Perubahan" }}
        </button>
      </div>
    </form>
  </div>
</template>
