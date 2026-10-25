import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as authApi from "../api/authApi";
import type { User } from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  async function asyncLogin(email: string, password: string): Promise<boolean> {
    try {
      const result = await authApi.login(email, password);
      putAccessToken(result.token);
      user.value = result.user;
      return true;
    } catch (error) {
      showErrorDialog((error as Error).message);
      return false;
    }
  }

  async function asyncRegister(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      await authApi.register(name, email, password);
      showSuccessDialog("Registrasi berhasil, silakan masuk");
      return true;
    } catch (error) {
      showErrorDialog((error as Error).message);
      return false;
    }
  }

  /** Memulihkan sesi dari token tersimpan. Mengembalikan true jika sesi valid. */
  async function asyncRestoreSession(): Promise<boolean> {
    if (user.value) return true;
    if (!getAccessToken()) return false;
    try {
      user.value = await authApi.getMe();
      return true;
    } catch {
      removeAccessToken();
      return false;
    }
  }

  function logout(): void {
    removeAccessToken();
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    asyncLogin,
    asyncRegister,
    asyncRestoreSession,
    logout,
  };
});
