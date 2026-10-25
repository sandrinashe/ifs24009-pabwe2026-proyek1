import { apiFetch } from "../../../helpers/apiHelper";

export interface Itinerary {
  id: number;
  trip_id: number;
  day_number: number;
  title: string;
  location: string;
  time: string | null;
  notes: string;
}

export interface ItineraryPayload {
  day_number: number;
  title: string;
  location: string;
  time: string;
  notes: string;
}

export const getItineraries = (tripId: number) =>
  apiFetch<Itinerary[]>(`/itineraries/trip/${tripId}`);

export const createItinerary = (tripId: number, payload: ItineraryPayload) =>
  apiFetch<Itinerary>("/itineraries", {
    method: "POST",
    body: { trip_id: tripId, ...payload },
  });

export const updateItinerary = (id: number, payload: ItineraryPayload) =>
  apiFetch<Itinerary>(`/itineraries/${id}`, { method: "PUT", body: payload });

export const deleteItinerary = (id: number) =>
  apiFetch<null>(`/itineraries/${id}`, { method: "DELETE" });
