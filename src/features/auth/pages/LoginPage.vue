<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn, Mail, Lock } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const auth = useAuthStore();
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const isSubmitting = ref(false);

async function onSubmit() {
  isSubmitting.value = true;
  const success = await auth.asyncLogin(email.value, password.value);
  isSubmitting.value = false;
  if (success) router.replace("/");
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label-field" for="login-email">Alamat Email</label>
      <div class="relative">
        <Mail :size="16" class="absolute left-3 top-3.5 text-slate-400" />
        <input
          id="login-email"
          type="email"
          required
          placeholder="nama@email.com"
          class="input-field pl-9"
          :value="email"
          @input="onEmailChange"
        />
      </div>
    </div>
    <div>
      <label class="label-field" for="login-password">Kata Sandi</label>
      <div class="relative">
        <Lock :size="16" class="absolute left-3 top-3.5 text-slate-400" />
        <input
          id="login-password"
          type="password"
          required
          placeholder="••••••••"
          class="input-field pl-9"
          :value="password"
          @input="onPasswordChange"
        />
      </div>
    </div>
    <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
      <LogIn :size="16" />
      {{ isSubmitting ? "Memproses..." : "Masuk Sekarang" }}
    </button>
  </form>
</template>
