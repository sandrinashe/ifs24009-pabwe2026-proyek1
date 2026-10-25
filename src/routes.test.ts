import { describe, expect, it } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import { routes } from "./routes";

const flatten = (list: RouteRecordRaw[]): RouteRecordRaw[] =>
  list.flatMap((route) => [route, ...flatten(route.children ?? [])]);

describe("routes", () => {
  it("mendefinisikan rute auth, dashboard, dan 404", () => {
    const names = flatten(routes).map((r) => r.name);
    expect(names).toEqual(
      expect.arrayContaining(["login", "register", "home", "trip-detail", "not-found"])
    );
  });

  it("mengalihkan /auth ke /auth/login", () => {
    expect(routes.find((r) => r.path === "/auth")?.redirect).toBe("/auth/login");
  });

  it("setiap komponen dapat dimuat secara lazy", async () => {
    for (const route of flatten(routes)) {
      const loader = route.component as () => Promise<{ default: unknown }>;
      const module = await loader();
      expect(module.default).toBeDefined();
    }
  });
});
