# Mise website

Marketing site for [Mise](https://usemise.dev), a macOS menu-bar app that restores saved window arrangements.

Static Astro output. No client framework, no webfonts, no third-party scripts.

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

## Screenshots

Drop real renders over the placeholders in `public/`:

| File | Slot |
|---|---|
| `hero-popover.png` | Hero product shot, @2x (2400×1500) |
| `set-1.png` `set-2.png` `set-3.png` | Demo-strip arrangements, @2x |
| `feature-capture.png` | Feature row 1 |
| `feature-displays.png` | Feature row 2 |
| `feature-launch.png` | Feature row 3 |
| `demo.mp4` | 30-second demo (wire into the dialog when you have it) |
| `Mise.dmg` | Download target (`src/site.ts`) |

`icon.png`, `favicon.png`, `apple-touch-icon.png`, and `og.png` are generated from the app icon set. Rebuild them with a Pillow environment:

```sh
python3 -m venv .venv
.venv/bin/pip install Pillow
.venv/bin/python scripts/generate-assets.py
```

Canonical URL, download path, and contact email live in `src/site.ts`.
