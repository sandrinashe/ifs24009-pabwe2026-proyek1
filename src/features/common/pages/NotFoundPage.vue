<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Compass } from "lucide-vue-next";
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <div class="rounded-3xl bg-brand-50 p-5 text-brand-600">
      <Compass :size="48" />
    </div>
    <h1 class="text-6xl font-extrabold text-slate-900">404</h1>
    <p class="max-w-sm text-slate-600">
      Sepertinya kamu tersesat. Halaman yang kamu cari tidak ditemukan.
    </p>
    <RouterLink to="/" class="btn-primary">Kembali ke Beranda</RouterLink>
  </main>
</template>
