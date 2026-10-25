import { defineComponent, h, type Component } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import {
  createMemoryHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";
import type { Trip, TripDetail } from "./features/trips/api/tripApi";
import type { Itinerary } from "./features/trips/api/itineraryApi";
import type { Expense } from "./features/trips/api/expenseApi";

const Stub = defineComponent({
  render: () => h("div", { "data-testid": "stub" }),
});

export const testRoutes: RouteRecordRaw[] = [
  { path: "/", component: Stub },
  { path: "/auth/login", component: Stub },
  { path: "/auth/register", component: Stub },
  { path: "/trips/:tripId", component: Stub },
  { path: "/profile", component: Stub },
];

export const createMockPinia = (): Pinia => {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
};

interface RenderOptions {
  props?: Record<string, unknown>;
  route?: string;
  pinia?: Pinia;
}

export async function renderWithProviders(
  component: Component,
  { props = {}, route = "/", pinia = createMockPinia() }: RenderOptions = {}
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: testRoutes,
  });
  router.push(route);
  await router.isReady();
  const wrapper = mount(component, {
    props,
    global: { plugins: [pinia, router] },
  });
  return { wrapper, router, pinia };
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export const makeTrip = (override: Partial<Trip> = {}): Trip => ({
  id: 1,
  title: "Liburan Bali",
  destination: "Bali",
  start_date: "2026-12-01",
  end_date: "2026-12-05",
  total_budget: 5000000,
  total_expenses: 1000000,
  remaining_budget: 4000000,
  ...override,
});

export const makeDetail = (override: Partial<TripDetail> = {}): TripDetail => ({
  ...makeTrip(),
  summary: {
    total_budget: 5000000,
    total_expenses: 1000000,
    remaining_budget: 4000000,
    usage_percentage: 20,
    by_category: [{ category: "Akomodasi", total: 1000000 }],
  },
  ...override,
});

export const makeItinerary = (override: Partial<Itinerary> = {}): Itinerary => ({
  id: 1,
  trip_id: 1,
  day_number: 1,
  title: "Check-in hotel",
  location: "Kuta",
  time: "10:00",
  notes: "Bawa KTP",
  ...override,
});

export const makeExpense = (override: Partial<Expense> = {}): Expense => ({
  id: 1,
  trip_id: 1,
  name: "Hotel",
  amount: 1000000,
  date: "2026-12-01",
  category: "Akomodasi",
  ...override,
});
