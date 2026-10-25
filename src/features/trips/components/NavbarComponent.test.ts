import { describe, expect, it } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../../auth/states/authStore";
import NavbarComponent from "./NavbarComponent.vue";

describe("NavbarComponent", () => {
  it("menampilkan nama pengguna yang sedang login", async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent);
    useAuthStore(pinia).user = { id: 1, name: "Budi", email: "b@e.c" };
    await flushPromises();
    expect(wrapper.find('[data-testid="user-name"]').text()).toBe("Budi");
  });

  it("menautkan ke halaman profil dan menampilkan inisial jika belum ada foto", async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent);
    useAuthStore(pinia).user = { id: 1, name: "budi", email: "b@e.c", avatar: null };
    await flushPromises();
    const link = wrapper.find('a[href="/profile"]');
    expect(link.text()).toContain("Profil saya");
    expect(wrapper.find('[data-testid="user-initial"]').text()).toBe("B");
    expect(wrapper.find('[data-testid="user-avatar"]').exists()).toBe(false);
  });

  it("menampilkan foto profil jika tersedia", async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent);
    useAuthStore(pinia).user = {
      id: 1,
      name: "Budi",
      email: "b@e.c",
      avatar: "data:image/jpeg;base64,AAAA",
    };
    await flushPromises();
    expect(wrapper.find('[data-testid="user-avatar"]').attributes("src")).toBe(
      "data:image/jpeg;base64,AAAA"
    );
    expect(wrapper.find('[data-testid="user-initial"]').exists()).toBe(false);
  });

  it("menampilkan tanda tanya sebagai inisial jika pengguna belum tersedia", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.find('[data-testid="user-initial"]').text()).toBe("?");
  });

  it("tidak error jika data pengguna belum tersedia", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.find('[data-testid="user-name"]').text()).toBe("");
  });

  it("tombol keluar menghapus sesi dan menuju halaman login", async () => {
    putAccessToken("tok");
    const { wrapper, router, pinia } = await renderWithProviders(NavbarComponent);
    const auth = useAuthStore(pinia);
    auth.user = { id: 1, name: "Budi", email: "b@e.c" };
    await wrapper.find("button").trigger("click");
    await flushPromises();
    expect(getAccessToken()).toBeNull();
    expect(auth.user).toBeNull();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});
