import { describe, expect, it } from "vitest";
import { resolveAuthRedirect } from "./authGuard";

describe("resolveAuthRedirect", () => {
  it("mengalihkan tamu yang membuka rute requiresAuth ke login", () => {
    expect(resolveAuthRedirect({ requiresAuth: true }, false)).toBe("/auth/login");
  });

  it("mengalihkan pengguna login yang membuka rute guestOnly ke beranda", () => {
    expect(resolveAuthRedirect({ guestOnly: true }, true)).toBe("/");
  });

  it("membiarkan navigasi yang diizinkan", () => {
    expect(resolveAuthRedirect({ requiresAuth: true }, true)).toBeNull();
    expect(resolveAuthRedirect({ guestOnly: true }, false)).toBeNull();
    expect(resolveAuthRedirect({}, false)).toBeNull();
  });
});
