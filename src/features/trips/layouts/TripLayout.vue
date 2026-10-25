<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import NavbarComponent from "../components/NavbarComponent.vue";

const router = useRouter();
const auth = useAuthStore();
const isReady = ref(false);

onMounted(async () => {
  if (await auth.asyncRestoreSession()) {
    isReady.value = true;
  } else {
    router.replace("/auth/login");
  }
});
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent />
    <main class="mx-auto max-w-6xl px-4 py-8">
      <RouterView v-if="isReady" />
      <template v-else>
        <h1 class="sr-only">TripBuddy</h1>
        <p class="text-sm text-slate-600" role="status">Memuat...</p>
      </template>
    </main>
  </div>
</template>
