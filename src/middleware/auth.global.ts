import { resolveAuthRedirect } from "../features/auth/guards/authGuard";
import { useAuthStore } from "../features/auth/states/authStore";

// Guard global: memulihkan sesi dari token lalu menerapkan meta rute
// (`requiresAuth` / `guestOnly`) yang didefinisikan di src/routes.ts.
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const isAuthenticated = await auth.asyncRestoreSession();
  const redirect = resolveAuthRedirect(to.meta, isAuthenticated);
  if (redirect) return navigateTo(redirect);
});
