# TripBuddy - Front-end

Antarmuka web (SPA) aplikasi perencana perjalanan dan pengelolaan anggaran wisata.
Repository back-end: `<username>-pabwe2026-proyek1-backend`.

| Komponen | Teknologi |
| --- | --- |
| Framework | Nuxt 4 (mode SPA, TypeScript) |
| State | Pinia |
| Styling | Tailwind CSS v4, lucide-vue-next, SweetAlert2 |
| Pengujian | Vitest + @vue/test-utils (coverage 100%) |
| Package manager | bun |

## Menjalankan lokal

Back-end harus berjalan lebih dulu (lihat README repo back-end).

```bash
git clone <URL-REPO-FRONTEND>
cd <nama-repo-frontend>
bun install
cp .env.example .env
bun run dev            # http://localhost:3000
```

## Variabel lingkungan

| Variabel | Fungsi |
| --- | --- |
| `VITE_API_BASEURL` | URL dasar REST API, dibaca saat build. Lokal: `http://localhost:4000/api` |
| `APP_PORT` | Port Nuxt dev (default 3000) |

## Pengujian dan build

```bash
bun install
bun run test:coverage  # gagal bila coverage < 100%
bun run build
```

## Deployment (Vercel)

- Root Directory: `/`, Framework Preset: Nuxt.js
- Environment Variable: `VITE_API_BASEURL=https://<domain-backend>/api`
- Nilai ini dibaca saat build; bila diubah, lakukan Redeploy.
