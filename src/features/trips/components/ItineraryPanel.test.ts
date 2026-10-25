import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { makeItinerary } from "../../../test-utils";
import ItineraryPanel from "./ItineraryPanel.vue";

describe("ItineraryPanel", () => {
  it("menampilkan pesan kosong jika belum ada agenda", () => {
    const wrapper = mount(ItineraryPanel, { props: { items: [] } });
    expect(wrapper.text()).toContain("Belum ada agenda");
    expect(wrapper.findAll('[data-testid="day-group"]')).toHaveLength(0);
  });

  it("mengelompokkan agenda per hari", () => {
    const wrapper = mount(ItineraryPanel, {
      props: {
        items: [
          makeItinerary({ id: 1, day_number: 1, title: "A" }),
          makeItinerary({ id: 2, day_number: 1, title: "B" }),
          makeItinerary({ id: 3, day_number: 2, title: "C" }),
        ],
      },
    });
    const groups = wrapper.findAll('[data-testid="day-group"]');
    expect(groups).toHaveLength(2);
    expect(groups[0].text()).toContain("Hari 1");
    expect(groups[0].findAll('[data-testid="itinerary-item"]')).toHaveLength(2);
    expect(groups[1].text()).toContain("Hari 2");
  });

  it("menampilkan jam, lokasi, dan catatan jika tersedia", () => {
    const wrapper = mount(ItineraryPanel, { props: { items: [makeItinerary()] } });
    const text = wrapper.text();
    expect(text).toContain("10:00");
    expect(text).toContain("Kuta");
    expect(text).toContain("Bawa KTP");
  });

  it("menyembunyikan jam, lokasi, dan catatan yang kosong", () => {
    const wrapper = mount(ItineraryPanel, {
      props: { items: [makeItinerary({ time: null, location: "", notes: "" })] },
    });
    const text = wrapper.text();
    expect(text).not.toContain("10:00");
    expect(text).not.toContain("Kuta");
    expect(text).not.toContain("Bawa KTP");
  });

  it("memancarkan event add, edit, dan delete", async () => {
    const item = makeItinerary();
    const wrapper = mount(ItineraryPanel, { props: { items: [item] } });
    await wrapper.find("button.btn-primary").trigger("click");
    await wrapper.find('[aria-label="Ubah agenda"]').trigger("click");
    await wrapper.find('[aria-label="Hapus agenda"]').trigger("click");
    expect(wrapper.emitted("add")).toHaveLength(1);
    expect(wrapper.emitted("edit")![0]).toEqual([item]);
    expect(wrapper.emitted("delete")![0]).toEqual([item]);
  });
});
