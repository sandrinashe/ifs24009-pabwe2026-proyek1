import type { RouterConfig } from "@nuxt/schema";
import { routes } from "./routes";

// Rute aplikasi didefinisikan manual di src/routes.ts (bukan dari folder pages/)
export default {
  routes: () => routes,
} satisfies RouterConfig;
