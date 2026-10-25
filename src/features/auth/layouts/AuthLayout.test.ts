import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../api/authApi";
import { putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

vi.mock("../api/authApi");

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: 1,
      name: "Budi",
      email: "budi@example.com",
    });
  });

  it("menampilkan judul aplikasi dan tab navigasi", async () => {
    const { wrapper } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
    });
    expect(wrapper.text()).toContain("TripBuddy");
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
    expect(wrapper.find('[data-testid="stub"]').exists()).toBe(true);
  });

  it("tetap di halaman auth jika belum login", async () => {
    const { router } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
    });
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("mengalihkan ke beranda jika sesi masih valid", async () => {
    putAccessToken("tok");
    const { router } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
    });
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/");
  });
});
