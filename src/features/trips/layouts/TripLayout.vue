<script setup lang="ts">
import NavbarComponent from "../components/NavbarComponent.vue";

// Akses halaman dijaga oleh middleware global (src/middleware/auth.global.ts).
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent />
    <main class="mx-auto max-w-6xl px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
