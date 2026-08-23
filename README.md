# Mise website

Marketing site for [Mise](https://usemise.dev), a macOS menu-bar app that restores saved window arrangements.

Static Astro output. No client framework, no webfonts. The shell loads Vercel Analytics and Speed Insights (disclosed on the privacy page).

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Files land in `dist/`.

## Screenshots / visuals

Homepage hero, demo strip, and feature rows use stylized CSS stages (window tiles + icons from `public/hero-apps/`) — not screenshot PNG drops for those slots.

| File | Slot |
|---|---|
| `demo.mp4` | 30-second demo (wire into a dialog when you have it) |
| `Mise.dmg` | Download target (`src/site.ts`) |

`icon.png`, `favicon.png`, `apple-touch-icon.png`, and `og.png` are generated from the app icon set. Rebuild them with a Pillow environment:

```sh
python3 -m venv .venv
.venv/bin/pip install Pillow
.venv/bin/python scripts/generate-assets.py
```

Canonical URL, download path, and contact email live in `src/site.ts`.

---

_Pin-watch test: 2026-08-23T22:58:30Z_
