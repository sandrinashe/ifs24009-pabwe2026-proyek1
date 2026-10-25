import type { NuxtPage } from "nuxt/schema";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { pageRoutes, type PageRoute } from "./src/routes";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  telemetry: false,

  // Disable SSR for SPA mode (client-side routing and storage)
  ssr: false,

  // Let Nuxt look into src/ for application source files
  srcDir: "src/",

  // Routing ditangani Nuxt; halaman feature-based didaftarkan lewat hook di bawah.
  pages: true,

  hooks: {
    "pages:extend"(pages) {
      const toNuxtPage = (route: PageRoute): NuxtPage => ({
        ...route,
        file: fileURLToPath(new URL(`./src/${route.file}`, import.meta.url)),
        children: route.children?.map(toNuxtPage),
      });
      pages.splice(0, pages.length, ...pageRoutes.map(toNuxtPage));
    },
  },

  css: ["~/index.css"],

  modules: ["@pinia/nuxt"],

  vite: {
    plugins: [tailwindcss()],
    define: {
      API_BASEURL: JSON.stringify(
        process.env.VITE_API_BASEURL || "http://localhost:4000/api"
      ),
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },

  devServer: {
    port: customPort,
  },

  app: {
    head: {
      title: "TripBuddy",
      htmlAttrs: {
        lang: "id",
      },
      meta: [
        {
          name: "description",
          content:
            "TripBuddy: aplikasi perencana perjalanan untuk menyusun agenda harian dan memantau anggaran wisata.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
      ],
      bodyAttrs: {
        class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});
