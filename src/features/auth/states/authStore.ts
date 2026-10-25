import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as authApi from "../api/authApi";
import type { ProfilePayload, User } from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import { getErrorMessage } from "../../../helpers/errorHelper";
import type { ActionResult } from "../../../helpers/notifyHelper";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  const failure = (error: unknown): ActionResult => ({
    success: false,
    message: getErrorMessage(error),
  });

  async function asyncLogin(
    email: string,
    password: string
  ): Promise<ActionResult> {
    try {
      const result = await authApi.login(email, password);
      putAccessToken(result.token);
      user.value = result.user;
      return { success: true, message: "" };
    } catch (error) {
      return failure(error);
    }
  }

  async function asyncRegister(
    name: string,
    email: string,
    password: string
  ): Promise<ActionResult> {
    try {
      await authApi.register(name, email, password);
      return {
        success: true,
        message: "Registrasi berhasil, silakan masuk",
      };
    } catch (error) {
      return failure(error);
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

  async function asyncUpdateProfile(
    payload: ProfilePayload
  ): Promise<ActionResult> {
    try {
      user.value = await authApi.updateProfile(payload);
      return { success: true, message: "Profil berhasil diperbarui" };
    } catch (error) {
      return failure(error);
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
    asyncUpdateProfile,
    logout,
  };
});
