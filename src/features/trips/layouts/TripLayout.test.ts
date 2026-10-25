import { describe, expect, it } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../../auth/states/authStore";
import TripLayout from "./TripLayout.vue";

describe("TripLayout", () => {
  it("menampilkan navbar, landmark main, dan konten halaman aktif", async () => {
    const pinia = createMockPinia();
    useAuthStore(pinia).user = { id: 1, name: "Budi", email: "budi@example.com" };
    const { wrapper } = await renderWithProviders(TripLayout, { pinia });
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.find('[data-testid="stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="user-name"]').text()).toBe("Budi");
  });
});
