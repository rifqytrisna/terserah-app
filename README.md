# Terserah! — Cycle-Synced Food Decider (PWA)

Mobile-first PWA to break the "terserah" deadlock: spin a wheel for a food
suggestion tailored to a manually-selected menstrual-cycle phase, with a
persisted history and Google Maps deep links.

## Development

```bash
pnpm install
pnpm dev      # start dev server
pnpm test     # run tests
pnpm build    # type-check + production build
pnpm preview  # preview the production build
```

## Data

The catalog lives at `public/data/foods.json`. Every phase must have at least
8 items; `src/data/validateDataset.test.ts` enforces this on every test run.

## Manual verification (run locally)

To verify the app works end-to-end:

1. Build and preview the production app:

   ```bash
   pnpm build
   pnpm preview
   ```

2. Open the localhost URL shown in your terminal and verify:
   - Header and 4 phase tabs render; active tab is bold.
   - Clicking "PUTAR" spins and reveals a result card with a wellness note and the "bukan saran medis" disclaimer.
   - Switching phase clears the result; spinning again never immediately repeats the last result.
   - Tapping the Maps CTA opens Google Maps in a new tab AND the history count increments; a repeat result shows the "Sudah pernah" badge.
   - DevTools → Application shows a registered service worker and manifest; toggling "Offline" and reloading still loads the app and catalog.

## Deploy

Static build (`dist/`). Deploy to Vercel or Netlify. `vercel.json` provides the
SPA fallback rewrite. This is not medical advice.
