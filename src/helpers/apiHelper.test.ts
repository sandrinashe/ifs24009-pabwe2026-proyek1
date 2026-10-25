import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiFetch,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

const fetchMock = vi.fn();

const respond = (body: unknown, ok = true) =>
  fetchMock.mockResolvedValue({ ok, json: async () => body });

describe("apiHelper", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("menyimpan token di cookie SameSite=Strict, bukan di localStorage", () => {
    const setter = vi.spyOn(document, "cookie", "set");
    putAccessToken("a b;c");
    expect(setter.mock.calls[0][0]).toMatch(
      /^tripbuddy_token=a%20b%3Bc; path=\/; SameSite=Strict; max-age=\d+$/
    );
    expect(getAccessToken()).toBe("a b;c");
    expect(localStorage.length).toBe(0);
    setter.mockRestore();
  });

  it("menambahkan atribut Secure pada koneksi HTTPS", () => {
    vi.stubGlobal("location", { protocol: "https:" });
    const setter = vi.spyOn(document, "cookie", "set");
    putAccessToken("tok");
    expect(setter.mock.calls[0][0]).toContain("; Secure;");
    setter.mockRestore();
    vi.unstubAllGlobals();
  });

  it("mengirim FormData apa adanya tanpa Content-Type JSON", async () => {
    respond({ success: true, message: "ok", data: { url: "u" } });
    const body = new FormData();
    await apiFetch("/uploads", { method: "POST", body });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASEURL}/uploads`, {
      method: "POST",
      headers: {},
      body,
    });
  });

  it("mengirim GET tanpa body dan tanpa token", async () => {
    respond({ success: true, message: "ok", data: [1, 2] });
    const data = await apiFetch<number[]>("/trips");
    expect(data).toEqual([1, 2]);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASEURL}/trips`, {
      method: "GET",
      headers: {},
      body: undefined,
    });
  });

  it("mengirim body JSON dan token Bearer", async () => {
    putAccessToken("tok");
    respond({ success: true, message: "ok", data: { id: 1 } });
    await apiFetch("/trips", { method: "POST", body: { title: "A" } });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASEURL}/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer tok" },
      body: JSON.stringify({ title: "A" }),
    });
  });

  it("melempar pesan error dari server jika response tidak ok", async () => {
    respond({ success: false, message: "Token tidak valid" }, false);
    await expect(apiFetch("/trips")).rejects.toThrow("Token tidak valid");
  });

  it("melempar error jika success bernilai false meski status ok", async () => {
    respond({ success: false, message: "Gagal" }, true);
    await expect(apiFetch("/trips")).rejects.toThrow("Gagal");
  });

  it("melempar pesan koneksi jika fetch gagal", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(apiFetch("/trips")).rejects.toThrow(
      "Tidak dapat terhubung ke server"
    );
  });
});
