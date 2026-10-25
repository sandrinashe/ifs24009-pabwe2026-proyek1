import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./test-utils";
import App from "./App.vue";

describe("App", () => {
  it("merender halaman aktif lewat NuxtPage", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/" });
    expect(wrapper.find('[data-testid="stub"]').exists()).toBe(true);
  });
});
