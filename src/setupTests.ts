import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
  document.cookie = "tripbuddy_token=; path=/; max-age=0";
  vi.clearAllMocks();
});
