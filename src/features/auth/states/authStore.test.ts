import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as authApi from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Budi", email: "budi@example.com" };

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("asyncLogin menyimpan token dan pengguna", async () => {
    vi.mocked(authApi.login).mockResolvedValue({ token: "tok", user });
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(await store.asyncLogin("a@b.c", "rahasia")).toBe(true);
    expect(getAccessToken()).toBe("tok");
    expect(store.user).toEqual(user);
    expect(store.isAuthenticated).toBe(true);
  });

  it("asyncLogin menampilkan error jika gagal", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Email atau password salah"));
    const store = useAuthStore();
    expect(await store.asyncLogin("a@b.c", "salah")).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Email atau password salah");
    expect(store.user).toBeNull();
  });

  it("asyncRegister menampilkan notifikasi sukses", async () => {
    vi.mocked(authApi.register).mockResolvedValue(user);
    const store = useAuthStore();
    expect(await store.asyncRegister("Budi", "a@b.c", "rahasia")).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("asyncRegister menampilkan error jika gagal", async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error("Email sudah terdaftar"));
    const store = useAuthStore();
    expect(await store.asyncRegister("Budi", "a@b.c", "rahasia")).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
  });

  describe("asyncRestoreSession", () => {
    it("langsung true jika pengguna sudah ada di store", async () => {
      const store = useAuthStore();
      store.user = user;
      expect(await store.asyncRestoreSession()).toBe(true);
      expect(authApi.getMe).not.toHaveBeenCalled();
    });

    it("false jika tidak ada token tersimpan", async () => {
      const store = useAuthStore();
      expect(await store.asyncRestoreSession()).toBe(false);
      expect(authApi.getMe).not.toHaveBeenCalled();
    });

    it("memulihkan sesi dari token yang valid", async () => {
      putAccessToken("tok");
      vi.mocked(authApi.getMe).mockResolvedValue(user);
      const store = useAuthStore();
      expect(await store.asyncRestoreSession()).toBe(true);
      expect(store.user).toEqual(user);
    });

    it("menghapus token jika sudah tidak valid", async () => {
      putAccessToken("kedaluwarsa");
      vi.mocked(authApi.getMe).mockRejectedValue(new Error("Token tidak valid"));
      const store = useAuthStore();
      expect(await store.asyncRestoreSession()).toBe(false);
      expect(getAccessToken()).toBeNull();
    });
  });

  it("logout menghapus token dan pengguna", () => {
    putAccessToken("tok");
    const store = useAuthStore();
    store.user = user;
    store.logout();
    expect(getAccessToken()).toBeNull();
    expect(store.user).toBeNull();
  });
});
