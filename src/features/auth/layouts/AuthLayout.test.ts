import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("menampilkan judul aplikasi dan tab navigasi", async () => {
    const { wrapper } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
    });
    expect(wrapper.text()).toContain("TripBuddy");
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
    expect(wrapper.find('[data-testid="stub"]').exists()).toBe(true);
  });

  it("memiliki landmark main dan satu h1", async () => {
    const { wrapper } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
    });
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.findAll("h1")).toHaveLength(1);
  });
});
