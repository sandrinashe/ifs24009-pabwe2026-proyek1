<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { LogOut, Plane } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";

const router = useRouter();
const auth = useAuthStore();
const initial = computed(() => (auth.user?.name ?? "?").charAt(0).toUpperCase());

function onLogout() {
  auth.logout();
  router.replace("/auth/login");
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-2 font-extrabold text-slate-900">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-brand-600 text-white"
        >
          <Plane :size="18" />
        </span>
        TripBuddy
      </RouterLink>
      <div class="flex items-center gap-3">
        <RouterLink
          to="/profile"
          class="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-100"
        >
          <span class="sr-only">Profil saya</span>
          <img
            v-if="auth.user?.avatar"
            :src="auth.user.avatar"
            alt=""
            class="h-8 w-8 rounded-full object-cover"
            data-testid="user-avatar"
          />
          <span
            v-else
            class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white"
            aria-hidden="true"
            data-testid="user-initial"
          >
            {{ initial }}
          </span>
          <span class="hidden text-sm font-medium text-slate-600 sm:inline" data-testid="user-name">
            {{ auth.user?.name }}
          </span>
        </RouterLink>
        <button class="btn-ghost !px-3 !py-2" @click="onLogout">
          <LogOut :size="16" />
          Keluar
        </button>
      </div>
    </div>
  </header>
</template>
