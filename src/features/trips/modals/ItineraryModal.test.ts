import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as itineraryApi from "../api/itineraryApi";
import { useTripsStore } from "../states/tripsStore";
import {
  deferred,
  makeDetail,
  makeItinerary,
  renderWithProviders,
} from "../../../test-utils";
import ItineraryModal from "./ItineraryModal.vue";

vi.mock("../api/itineraryApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const value = (wrapper: { find: (s: string) => { element: Element } }, selector: string) =>
  (wrapper.find(selector).element as HTMLInputElement).value;

async function render(props: Record<string, unknown>) {
  const result = await renderWithProviders(ItineraryModal, { props });
  useTripsStore(result.pinia).current = makeDetail();
  return result;
}

describe("ItineraryModal", () => {
  beforeEach(() => {
    vi.mocked(itineraryApi.createItinerary).mockResolvedValue(makeItinerary());
    vi.mocked(itineraryApi.updateItinerary).mockResolvedValue(makeItinerary());
    vi.mocked(itineraryApi.getItineraries).mockResolvedValue([]);
  });

  it("tidak merender apa pun saat tertutup", async () => {
    const { wrapper } = await render({ open: false, itinerary: null });
    expect(wrapper.find('[data-testid="itinerary-modal"]').exists()).toBe(false);
  });

  it("menambahkan agenda baru", async () => {
    const { wrapper } = await render({ open: true, itinerary: null });
    expect(wrapper.text()).toContain("Tambah Agenda");
    expect(value(wrapper, "#it-day")).toBe("1");

    await wrapper.find("#it-day").setValue("2");
    await wrapper.find("#it-time").setValue("08:30");
    await wrapper.find("#it-title").setValue("Sunrise");
    await wrapper.find("#it-location").setValue("Sanur");
    await wrapper.find("#it-notes").setValue("Bawa jaket");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(itineraryApi.createItinerary).toHaveBeenCalledWith(1, {
      day_number: 2,
      time: "08:30",
      title: "Sunrise",
      location: "Sanur",
      notes: "Bawa jaket",
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("mengubah agenda yang sudah ada dan mengisi time null sebagai kosong", async () => {
    const { wrapper } = await render({
      open: true,
      itinerary: makeItinerary({ id: 5, time: null }),
    });
    expect(wrapper.text()).toContain("Ubah Agenda");
    expect(value(wrapper, "#it-title")).toBe("Check-in hotel");
    expect(value(wrapper, "#it-time")).toBe("");

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(itineraryApi.updateItinerary).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ title: "Check-in hotel", time: "" })
    );
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("mengisi ulang form setiap kali dibuka", async () => {
    const { wrapper } = await render({ open: false, itinerary: null });
    await wrapper.setProps({ itinerary: makeItinerary({ title: "Agenda A" }), open: true });
    expect(value(wrapper, "#it-title")).toBe("Agenda A");
    await wrapper.setProps({ open: false });
    await wrapper.setProps({ itinerary: null, open: true });
    expect(value(wrapper, "#it-title")).toBe("");
  });

  it("tidak memancarkan saved jika gagal", async () => {
    vi.mocked(itineraryApi.createItinerary).mockRejectedValue(new Error("Gagal"));
    const { wrapper } = await render({ open: true, itinerary: null });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menonaktifkan tombol simpan selama proses", async () => {
    const pending = deferred<itineraryApi.Itinerary>();
    vi.mocked(itineraryApi.createItinerary).mockReturnValue(pending.promise);
    const { wrapper } = await render({ open: true, itinerary: null });
    await wrapper.find("form").trigger("submit");
    expect(wrapper.find('button[type="submit"]').text()).toBe("Menyimpan...");
    pending.resolve(makeItinerary());
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').text()).toBe("Simpan");
  });

  it("memancarkan close dari tombol X, tombol Batal, dan klik latar", async () => {
    const { wrapper } = await render({ open: true, itinerary: null });
    await wrapper.find('[aria-label="Tutup"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal")!.trigger("click");
    await wrapper.find('[data-testid="itinerary-modal"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});
