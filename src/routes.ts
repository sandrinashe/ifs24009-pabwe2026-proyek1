/**
 * Definisi halaman aplikasi. Struktur feature-based dipertahankan, dan halaman
 * didaftarkan ke Nuxt lewat hook `pages:extend` di nuxt.config.ts, sehingga
 * routing tetap ditangani Nuxt (NuxtPage, middleware, typed route meta).
 */
export interface PageRoute {
  name?: string;
  path: string;
  /** Path komponen relatif terhadap `src/`. */
  file: string;
  redirect?: string;
  meta?: { requiresAuth?: boolean; guestOnly?: boolean };
  children?: PageRoute[];
}

export const pageRoutes: PageRoute[] = [
  {
    path: "/auth",
    file: "features/auth/layouts/AuthLayout.vue",
    redirect: "/auth/login",
    meta: { guestOnly: true },
    children: [
      {
        path: "login",
        name: "login",
        file: "features/auth/pages/LoginPage.vue",
      },
      {
        path: "register",
        name: "register",
        file: "features/auth/pages/RegisterPage.vue",
      },
    ],
  },
  {
    path: "/",
    file: "features/trips/layouts/TripLayout.vue",
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "home", file: "features/trips/pages/HomePage.vue" },
      {
        path: "profile",
        name: "profile",
        file: "features/auth/pages/ProfilePage.vue",
      },
      {
        path: "trips/:tripId(\\d+)",
        name: "trip-detail",
        file: "features/trips/pages/DetailPage.vue",
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    file: "features/common/pages/NotFoundPage.vue",
  },
];
