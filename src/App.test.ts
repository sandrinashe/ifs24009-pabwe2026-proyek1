import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./test-utils";
import App from "./App.vue";

describe("App", () => {
  it("merender rute yang aktif lewat RouterView", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/" });
    expect(wrapper.find('[data-testid="stub"]').exists()).toBe(true);
  });
});
