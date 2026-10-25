<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { UserPlus, User, Mail, Lock } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const auth = useAuthStore();
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const isSubmitting = ref(false);

async function onSubmit() {
  isSubmitting.value = true;
  const success = await auth.asyncRegister(
    name.value,
    email.value,
    password.value
  );
  isSubmitting.value = false;
  if (success) router.replace("/auth/login");
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label-field" for="register-name">Nama Lengkap</label>
      <div class="relative">
        <User :size="16" class="absolute left-3 top-3.5 text-slate-400" />
        <input
          id="register-name"
          type="text"
          required
          placeholder="Nama kamu"
          class="input-field pl-9"
          :value="name"
          @input="onNameChange"
        />
      </div>
    </div>
    <div>
      <label class="label-field" for="register-email">Alamat Email</label>
      <div class="relative">
        <Mail :size="16" class="absolute left-3 top-3.5 text-slate-400" />
        <input
          id="register-email"
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
      <label class="label-field" for="register-password">Kata Sandi</label>
      <div class="relative">
        <Lock :size="16" class="absolute left-3 top-3.5 text-slate-400" />
        <input
          id="register-password"
          type="password"
          required
          minlength="6"
          placeholder="Minimal 6 karakter"
          class="input-field pl-9"
          :value="password"
          @input="onPasswordChange"
        />
      </div>
    </div>
    <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
      <UserPlus :size="16" />
      {{ isSubmitting ? "Memproses..." : "Daftar Sekarang" }}
    </button>
  </form>
</template>
