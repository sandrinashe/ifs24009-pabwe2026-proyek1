import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { deferred, renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage.vue";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Budi", email: "budi@example.com" };

async function fillAndSubmit(wrapper: Awaited<ReturnType<typeof renderWithProviders>>["wrapper"]) {
  await wrapper.find("#login-email").setValue("budi@example.com");
  await wrapper.find("#login-password").setValue("rahasia123");
  await wrapper.find("form").trigger("submit");
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockResolvedValue({ token: "tok", user });
  });

  it("login berhasil lalu menuju beranda", async () => {
    const { wrapper, router } = await renderWithProviders(LoginPage, {
      route: "/auth/login",
    });
    await fillAndSubmit(wrapper);
    await flushPromises();
    expect(authApi.login).toHaveBeenCalledWith("budi@example.com", "rahasia123");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("menonaktifkan tombol selama proses login", async () => {
    const pending = deferred<authApi.LoginResult>();
    vi.mocked(authApi.login).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(LoginPage, {
      route: "/auth/login",
    });
    expect(wrapper.find("button").text()).toBe("Masuk Sekarang");
    await fillAndSubmit(wrapper);
    expect(wrapper.find("button").text()).toBe("Memproses...");
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    pending.resolve({ token: "tok", user });
    await flushPromises();
    expect(wrapper.find("button").text()).toBe("Masuk Sekarang");
  });

  it("tetap di halaman login dan menampilkan error jika gagal", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Email atau password salah"));
    const { wrapper, router } = await renderWithProviders(LoginPage, {
      route: "/auth/login",
    });
    await fillAndSubmit(wrapper);
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Email atau password salah");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});
