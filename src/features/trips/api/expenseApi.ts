import { apiFetch } from "../../../helpers/apiHelper";

export interface Expense {
  id: number;
  trip_id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
}

export interface ExpensePayload {
  name: string;
  amount: number;
  date: string;
  category: string;
}

export const getExpenses = (tripId: number) =>
  apiFetch<Expense[]>(`/expenses/trip/${tripId}`);

export const createExpense = (tripId: number, payload: ExpensePayload) =>
  apiFetch<Expense>("/expenses", {
    method: "POST",
    body: { trip_id: tripId, ...payload },
  });

export const deleteExpense = (id: number) =>
  apiFetch<null>(`/expenses/${id}`, { method: "DELETE" });
