import { apiFetch } from "../../../helpers/apiHelper";

export interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  total_expenses?: number;
  remaining_budget?: number;
}

export interface TripPayload {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_budget: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface TripSummary {
  total_budget: number;
  total_expenses: number;
  remaining_budget: number;
  usage_percentage: number;
  by_category: CategoryTotal[];
}

export interface TripDetail extends Trip {
  summary: TripSummary;
}

export const getTrips = () => apiFetch<Trip[]>("/trips");

export const getTrip = (id: number) => apiFetch<TripDetail>(`/trips/${id}`);

export const createTrip = (payload: TripPayload) =>
  apiFetch<Trip>("/trips", { method: "POST", body: payload });

export const updateTrip = (id: number, payload: TripPayload) =>
  apiFetch<Trip>(`/trips/${id}`, { method: "PUT", body: payload });

export const deleteTrip = (id: number) =>
  apiFetch<null>(`/trips/${id}`, { method: "DELETE" });
