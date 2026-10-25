import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pageRoutes, type PageRoute } from "./routes";

const flatten = (list: PageRoute[]): PageRoute[] =>
  list.flatMap((route) => [route, ...flatten(route.children ?? [])]);

describe("pageRoutes", () => {
  it("mendefinisikan rute auth, dashboard, dan 404", () => {
    const names = flatten(pageRoutes).map((r) => r.name);
    expect(names).toEqual(
      expect.arrayContaining(["login", "register", "home", "profile", "trip-detail", "not-found"])
    );
  });

  it("mengalihkan /auth ke /auth/login", () => {
    expect(pageRoutes.find((r) => r.path === "/auth")?.redirect).toBe("/auth/login");
  });

  it("menandai rute auth sebagai guestOnly dan dashboard sebagai requiresAuth", () => {
    expect(pageRoutes.find((r) => r.path === "/auth")?.meta).toEqual({ guestOnly: true });
    expect(pageRoutes.find((r) => r.path === "/")?.meta).toEqual({ requiresAuth: true });
  });

  it("hanya menerima tripId numerik pada rute detail", () => {
    const detail = flatten(pageRoutes).find((r) => r.name === "trip-detail");
    expect(detail?.path).toBe("trips/:tripId(\\d+)");
  });

  it("setiap file komponen benar-benar ada", () => {
    for (const route of flatten(pageRoutes)) {
      const path = resolve(process.cwd(), "src", route.file);
      expect(existsSync(path), route.file).toBe(true);
    }
  });
});
