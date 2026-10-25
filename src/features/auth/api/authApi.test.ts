import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { getMe, login, register, updateProfile } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("authApi", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue("hasil");
  });

  it("login memanggil POST /auth/login", async () => {
    expect(await login("a@b.c", "rahasia")).toBe("hasil");
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "rahasia" },
    });
  });

  it("register memanggil POST /auth/register", async () => {
    await register("Budi", "a@b.c", "rahasia");
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Budi", email: "a@b.c", password: "rahasia" },
    });
  });

  it("updateProfile memanggil PUT /auth/profile", async () => {
    await updateProfile({ name: "Budi", avatar: null });
    expect(apiFetch).toHaveBeenCalledWith("/auth/profile", {
      method: "PUT",
      body: { name: "Budi", avatar: null },
    });
  });

  it("getMe memanggil GET /auth/me", async () => {
    await getMe();
    expect(apiFetch).toHaveBeenCalledWith("/auth/me");
  });
});
