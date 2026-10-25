import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: () => import("./features/auth/layouts/AuthLayout.vue"),
    redirect: "/auth/login",
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("./features/auth/pages/LoginPage.vue"),
      },
      {
        path: "register",
        name: "register",
        component: () => import("./features/auth/pages/RegisterPage.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("./features/trips/layouts/TripLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("./features/trips/pages/HomePage.vue"),
      },
      {
        path: "trips/:tripId",
        name: "trip-detail",
        component: () => import("./features/trips/pages/DetailPage.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./features/common/pages/NotFoundPage.vue"),
  },
];
