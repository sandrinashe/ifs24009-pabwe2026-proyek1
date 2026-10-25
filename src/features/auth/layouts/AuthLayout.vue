<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { Plane } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  if (await auth.asyncRestoreSession()) router.replace("/");
});
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4"
  >
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <div
          class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-brand-600 text-white shadow-lg"
        >
          <Plane :size="28" />
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight">TripBuddy</h1>
        <p class="mt-1 text-sm text-slate-500">
          Rencanakan perjalanan &amp; pantau anggaran wisatamu
        </p>
      </div>

      <div class="card p-6 shadow-xl shadow-slate-200/60">
        <nav class="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          <RouterLink
            to="/auth/login"
            class="rounded-xl py-2 text-center text-sm font-semibold text-slate-500"
            active-class="!bg-white !text-brand-600 shadow-sm"
          >
            Masuk Akun
          </RouterLink>
          <RouterLink
            to="/auth/register"
            class="rounded-xl py-2 text-center text-sm font-semibold text-slate-500"
            active-class="!bg-white !text-brand-600 shadow-sm"
          >
            Daftar Baru
          </RouterLink>
        </nav>
        <RouterView />
      </div>
    </div>
  </div>
</template>
