import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  updateTrip,
} from "./tripApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

const payload = {
  title: "Bali",
  destination: "Bali",
  start_date: "2026-12-01",
  end_date: "2026-12-05",
  total_budget: 1000,
};

describe("tripApi", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue("hasil");
  });

  it("getTrips -> GET /trips", async () => {
    expect(await getTrips()).toBe("hasil");
    expect(apiFetch).toHaveBeenCalledWith("/trips");
  });

  it("getTrip -> GET /trips/:id", async () => {
    await getTrip(7);
    expect(apiFetch).toHaveBeenCalledWith("/trips/7");
  });

  it("createTrip -> POST /trips", async () => {
    await createTrip(payload);
    expect(apiFetch).toHaveBeenCalledWith("/trips", { method: "POST", body: payload });
  });

  it("updateTrip -> PUT /trips/:id", async () => {
    await updateTrip(7, payload);
    expect(apiFetch).toHaveBeenCalledWith("/trips/7", { method: "PUT", body: payload });
  });

  it("deleteTrip -> DELETE /trips/:id", async () => {
    await deleteTrip(7);
    expect(apiFetch).toHaveBeenCalledWith("/trips/7", { method: "DELETE" });
  });
});
