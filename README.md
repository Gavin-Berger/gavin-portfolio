# Gavin Berger · Portfolio

A 3D trail through my journey, from the University of North Georgia to Recall Studio and
FRS Sound. Scroll and a low-poly hiker walks the path; each stop opens a card about that
chapter. There's also a free-roam explore mode (WASD), a plain-text version at `/story`,
and case studies at `/work/recall` and `/work/frs`.

Built with Next.js, React Three Fiber, three.js, Tailwind CSS and Zustand. All the 3D
(terrain, scenery, the hiker, every diorama) is modeled in code. There are no model files.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Edit it

| What                            | Where                                   |
| ------------------------------- | --------------------------------------- |
| The story: stops, copy, links   | `content/journey.ts`                    |
| Case studies                    | `content/work.ts`                       |
| How the hiker looks             | `content/avatar.ts`                     |
| Photos                          | `public/photos/` (see the README there) |
| Terrain, trail path, sky colors | `lib/world.ts`                          |
| Dioramas                        | `components/three/Zones.tsx`            |

## Deploy to Cloudflare Pages

`npm run build` writes a fully static site to `out/`.

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repo.
2. Framework preset: **None**. Build command: `npm run build`. Build output directory: `out`.
3. Under environment variables, set `NODE_VERSION` to `22`.

Every push to `main` redeploys.
