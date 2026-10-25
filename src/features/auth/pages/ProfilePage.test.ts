import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../api/authApi";
import { compressImage } from "../../../helpers/imageHelper";
import { showSuccessDialog } from "../../../helpers/toolsHelper";
import { createMockPinia, deferred, renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import ProfilePage from "./ProfilePage.vue";

vi.mock("../api/authApi");
vi.mock("../../../helpers/imageHelper");
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Budi", email: "budi@example.com", avatar: null };
const AVATAR = "data:image/jpeg;base64,AAAA";

async function render(current: authApi.User | null = user) {
  const pinia = createMockPinia();
  useAuthStore(pinia).user = current;
  return renderWithProviders(ProfilePage, { pinia });
}

const inputValue = (wrapper: { find: (s: string) => { element: Element } }, s: string) =>
  (wrapper.find(s).element as HTMLInputElement).value;

async function chooseFile(wrapper: Awaited<ReturnType<typeof render>>["wrapper"]) {
  const input = wrapper.find("#profile-avatar");
  Object.defineProperty(input.element, "files", {
    value: [new File(["x"], "a.png", { type: "image/png" })],
    configurable: true,
  });
  await input.trigger("change");
  await flushPromises();
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.mocked(authApi.updateProfile).mockImplementation(async (payload) => ({
      ...user,
      ...payload,
    }));
    vi.mocked(compressImage).mockResolvedValue(AVATAR);
  });

  it("menampilkan satu h1 dan data pengguna, dengan email hanya-baca", async () => {
    const { wrapper } = await render();
    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(inputValue(wrapper, "#profile-name")).toBe("Budi");
    expect(inputValue(wrapper, "#profile-email")).toBe("budi@example.com");
    expect(wrapper.find("#profile-email").attributes("readonly")).toBeDefined();
    expect(wrapper.text()).toContain("Belum ada gambar");
  });

  it("menampilkan foto profil yang sudah tersimpan", async () => {
    const { wrapper } = await render({ ...user, avatar: AVATAR });
    expect(wrapper.find("img").attributes("src")).toBe(AVATAR);
  });

  it("tetap dapat dirender jika data pengguna belum ada", async () => {
    const { wrapper } = await render(null);
    expect(inputValue(wrapper, "#profile-name")).toBe("");
    expect(inputValue(wrapper, "#profile-email")).toBe("");
  });

  it("menyimpan perubahan nama dan memperbarui data pengguna", async () => {
    const { wrapper, pinia } = await render();
    await wrapper.find("#profile-name").setValue("Budi Santoso");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(authApi.updateProfile).toHaveBeenCalledWith({
      name: "Budi Santoso",
      avatar: null,
    });
    expect(useAuthStore(pinia).user?.name).toBe("Budi Santoso");
    expect(showSuccessDialog).toHaveBeenCalledWith("Profil berhasil diperbarui");
  });

  it("mengirim foto baru yang dipilih", async () => {
    const { wrapper } = await render();
    await chooseFile(wrapper);
    expect(wrapper.find("img").attributes("src")).toBe(AVATAR);
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(compressImage).toHaveBeenCalledWith(expect.any(File), 256);
    expect(authApi.updateProfile).toHaveBeenCalledWith({ name: "Budi", avatar: AVATAR });
  });

  it("mengirim null saat foto dihapus", async () => {
    const { wrapper } = await render({ ...user, avatar: AVATAR });
    await wrapper.find("button.btn-ghost").trigger("click");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(authApi.updateProfile).toHaveBeenCalledWith({ name: "Budi", avatar: null });
  });

  it("menonaktifkan tombol selama proses simpan", async () => {
    const pending = deferred<authApi.User>();
    vi.mocked(authApi.updateProfile).mockReturnValue(pending.promise);
    const { wrapper } = await render();
    await wrapper.find("form").trigger("submit");
    const button = wrapper.find('button[type="submit"]');
    expect(button.text()).toBe("Menyimpan...");
    expect(button.attributes("disabled")).toBeDefined();
    pending.resolve(user);
    await flushPromises();
    expect(button.text()).toBe("Simpan Perubahan");
  });
});
