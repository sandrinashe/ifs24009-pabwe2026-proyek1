import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../../auth/api/authApi";
import { putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";
import TripLayout from "./TripLayout.vue";

vi.mock("../../auth/api/authApi");

describe("TripLayout", () => {
  beforeEach(() => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: 1,
      name: "Budi",
      email: "budi@example.com",
    });
  });

  it("mengalihkan ke login jika belum ada sesi", async () => {
    const { wrapper, router } = await renderWithProviders(TripLayout, {
      route: "/",
    });
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.find("main").exists()).toBe(false);
  });

  it("menampilkan navbar dan konten jika sesi valid", async () => {
    putAccessToken("tok");
    const { wrapper, router } = await renderWithProviders(TripLayout, {
      route: "/",
    });
    expect(wrapper.find("main").exists()).toBe(false);
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/");
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.find('[data-testid="user-name"]').text()).toBe("Budi");
  });
});
