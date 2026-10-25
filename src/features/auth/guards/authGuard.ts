export interface AuthRouteMeta {
  requiresAuth?: unknown;
  guestOnly?: unknown;
}

/**
 * Menentukan tujuan pengalihan berdasarkan meta rute dan status login.
 * Mengembalikan null bila navigasi boleh dilanjutkan.
 */
export function resolveAuthRedirect(
  meta: AuthRouteMeta,
  isAuthenticated: boolean
): string | null {
  if (meta.requiresAuth && !isAuthenticated) return "/auth/login";
  if (meta.guestOnly && isAuthenticated) return "/";
  return null;
}
