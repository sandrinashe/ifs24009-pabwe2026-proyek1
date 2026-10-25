import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { deferred, renderWithProviders } from "../../../test-utils";
import RegisterPage from "./RegisterPage.vue";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Budi", email: "budi@example.com" };

async function fillAndSubmit(wrapper: Awaited<ReturnType<typeof renderWithProviders>>["wrapper"]) {
  await wrapper.find("#register-name").setValue("Budi");
  await wrapper.find("#register-email").setValue("budi@example.com");
  await wrapper.find("#register-password").setValue("rahasia123");
  await wrapper.find("form").trigger("submit");
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.mocked(authApi.register).mockResolvedValue(user);
  });

  it("registrasi berhasil lalu menuju halaman login", async () => {
    const { wrapper, router } = await renderWithProviders(RegisterPage, {
      route: "/auth/register",
    });
    await fillAndSubmit(wrapper);
    await flushPromises();
    expect(authApi.register).toHaveBeenCalledWith("Budi", "budi@example.com", "rahasia123");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("menonaktifkan tombol selama proses registrasi", async () => {
    const pending = deferred<authApi.User>();
    vi.mocked(authApi.register).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(RegisterPage, {
      route: "/auth/register",
    });
    expect(wrapper.find("button").text()).toBe("Daftar Sekarang");
    await fillAndSubmit(wrapper);
    expect(wrapper.find("button").text()).toBe("Memproses...");
    pending.resolve(user);
    await flushPromises();
    expect(wrapper.find("button").text()).toBe("Daftar Sekarang");
  });

  it("tetap di halaman registrasi dan menampilkan error jika gagal", async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error("Email sudah terdaftar"));
    const { wrapper, router } = await renderWithProviders(RegisterPage, {
      route: "/auth/register",
    });
    await fillAndSubmit(wrapper);
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
    expect(router.currentRoute.value.path).toBe("/auth/register");
  });
});
