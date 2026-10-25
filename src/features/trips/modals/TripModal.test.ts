import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as tripApi from "../api/tripApi";
import { deferred, makeTrip, renderWithProviders } from "../../../test-utils";
import TripModal from "./TripModal.vue";

vi.mock("../api/tripApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const value = (wrapper: { find: (s: string) => { element: Element } }, selector: string) =>
  (wrapper.find(selector).element as HTMLInputElement).value;

describe("TripModal", () => {
  beforeEach(() => {
    vi.mocked(tripApi.createTrip).mockResolvedValue(makeTrip());
    vi.mocked(tripApi.updateTrip).mockResolvedValue(makeTrip());
  });

  it("tidak merender apa pun saat tertutup", async () => {
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: false, trip: null },
    });
    expect(wrapper.find('[data-testid="trip-modal"]').exists()).toBe(false);
  });

  it("membuat perjalanan baru dari form kosong", async () => {
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: true, trip: null },
    });
    expect(wrapper.text()).toContain("Perjalanan Baru");
    expect(value(wrapper, "#trip-title")).toBe("");

    await wrapper.find("#trip-title").setValue("Liburan Lombok");
    await wrapper.find("#trip-destination").setValue("Lombok");
    await wrapper.find("#trip-start").setValue("2026-12-10");
    await wrapper.find("#trip-end").setValue("2026-12-15");
    await wrapper.find("#trip-budget").setValue("2500000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(tripApi.createTrip).toHaveBeenCalledWith({
      title: "Liburan Lombok",
      destination: "Lombok",
      start_date: "2026-12-10",
      end_date: "2026-12-15",
      total_budget: 2500000,
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("mengisi form dengan data perjalanan saat mengubah", async () => {
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: true, trip: makeTrip({ id: 7 }) },
    });
    expect(wrapper.text()).toContain("Ubah Perjalanan");
    expect(value(wrapper, "#trip-title")).toBe("Liburan Bali");
    expect(value(wrapper, "#trip-budget")).toBe("5000000");

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(tripApi.updateTrip).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ title: "Liburan Bali", total_budget: 5000000 })
    );
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("mengisi ulang form setiap kali dibuka", async () => {
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: false, trip: null },
    });
    await wrapper.setProps({ trip: makeTrip({ title: "Trip A" }), open: true });
    expect(value(wrapper, "#trip-title")).toBe("Trip A");
    await wrapper.setProps({ open: false });
    await wrapper.setProps({ trip: null, open: true });
    expect(value(wrapper, "#trip-title")).toBe("");
  });

  it("tidak memancarkan saved jika penyimpanan gagal", async () => {
    vi.mocked(tripApi.createTrip).mockRejectedValue(new Error("Gagal"));
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: true, trip: null },
    });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menonaktifkan tombol simpan selama proses", async () => {
    const pending = deferred<tripApi.Trip>();
    vi.mocked(tripApi.createTrip).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: true, trip: null },
    });
    await wrapper.find("form").trigger("submit");
    const submit = wrapper.find('button[type="submit"]');
    expect(submit.text()).toBe("Menyimpan...");
    expect(submit.attributes("disabled")).toBeDefined();
    pending.resolve(makeTrip());
    await flushPromises();
    expect(submit.text()).toBe("Simpan");
  });

  it("memancarkan close dari tombol X, tombol Batal, dan klik latar", async () => {
    const { wrapper } = await renderWithProviders(TripModal, {
      props: { open: true, trip: null },
    });
    await wrapper.find('[aria-label="Tutup"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal")!.trigger("click");
    await wrapper.find('[data-testid="trip-modal"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});
