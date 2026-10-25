import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import {
  createItinerary,
  deleteItinerary,
  getItineraries,
  updateItinerary,
} from "./itineraryApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

const payload = {
  day_number: 1,
  title: "Pantai",
  location: "Kuta",
  time: "09:00",
  notes: "",
};

describe("itineraryApi", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue("hasil");
  });

  it("getItineraries -> GET /itineraries/trip/:tripId", async () => {
    expect(await getItineraries(3)).toBe("hasil");
    expect(apiFetch).toHaveBeenCalledWith("/itineraries/trip/3");
  });

  it("createItinerary -> POST /itineraries dengan trip_id", async () => {
    await createItinerary(3, payload);
    expect(apiFetch).toHaveBeenCalledWith("/itineraries", {
      method: "POST",
      body: { trip_id: 3, ...payload },
    });
  });

  it("updateItinerary -> PUT /itineraries/:id", async () => {
    await updateItinerary(9, payload);
    expect(apiFetch).toHaveBeenCalledWith("/itineraries/9", {
      method: "PUT",
      body: payload,
    });
  });

  it("deleteItinerary -> DELETE /itineraries/:id", async () => {
    await deleteItinerary(9);
    expect(apiFetch).toHaveBeenCalledWith("/itineraries/9", { method: "DELETE" });
  });
});
