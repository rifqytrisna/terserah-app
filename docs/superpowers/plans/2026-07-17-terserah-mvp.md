# "Terserah!" Cycle-Synced Food Decider — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-screen, offline-first PWA that helps a user pick what to eat via a spinning wheel, tailored to a manually-selected menstrual-cycle phase, with a persisted "Riwayat" (history) feature.

**Architecture:** Static food catalog shipped as JSON, loaded through TanStack Query with `persistQueryClient` so it is cached and available offline. Pure logic (wheel sampling, dataset validation, Maps URL building, history storage) lives in framework-agnostic modules under `src/lib` and `src/data`, unit-tested with Vitest. React components are thin views wired to those modules and tested with React Testing Library. A single `App` composes phase tabs, the wheel, the result card, and history.

**Tech Stack:** Vite + React 19 + TypeScript (strict) + Tailwind CSS + TanStack Query (`@tanstack/react-query` + `@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister`) + `vite-plugin-pwa`. Tests: Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`.

## Global Constraints

- **Runtime/tooling:** Node 25.x. Package manager: **pnpm** (9.10.0 installed). Use pnpm for all commands; do not commit an `package-lock.json` (pnpm writes `pnpm-lock.yaml`).
- **TypeScript strict mode: ON** (`"strict": true` in tsconfig).
- **Layout:** mobile-first; app content constrained to `max-w-md mx-auto` and centered on larger screens.
- **Wheel invariant:** at most **8** segments per spin (`WHEEL_SIZE = 8`); segments are **real item names** sampled from the active phase; **re-sample every spin**; **exclude the previous result** when sampling the next spin; if a phase has fewer than 8 items, show all available.
- **Dataset invariant:** ≥ 40 items total; **every** phase (`menstruasi`, `folikular`, `ovulasi`, `luteal`) has **≥ 8** items; all `id`s unique; no empty fields. Enforced by an automated test.
- **Medical framing:** wellness notes are soft/traditional phrasing ("dipercaya…"), never clinical fact; a persistent disclaimer **"Info bersifat umum, bukan saran medis."** is always visible near the result.
- **History save trigger:** an entry is saved **only** when the user taps the Google Maps CTA (intent to eat), never on every spin.
- **Maps deep link:** free URL API only — `https://www.google.com/maps/search/?api=1&query=<encoded>`. No paid Places API.
- **Out of scope (do NOT build):** cycle date math / auto-detection, partner sharing / accounts, `region`/`spiciness`/`veg` filtering.
- **Commits:** conventional-commit style, one commit per task. Repo identity is already configured (`rifqytrisna`).

---

### Task 1: Project scaffold, tooling, and smoke test

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `postcss.config.js`, `tailwind.config.js`, `src/index.css`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/setupTests.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a running Vite + React + TS + Tailwind app; Vitest configured with jsdom + RTL; `App` component exported as default from `src/App.tsx`.

- [ ] **Step 1: Create `package.json` with pinned dependencies and scripts**

```json
{
  "name": "terserah-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.62.0",
    "@tanstack/react-query-persist-client": "^5.62.0",
    "@tanstack/query-sync-storage-persister": "^5.62.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vite-plugin-pwa": "^0.21.1",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: completes without error; `node_modules/` created (already gitignored).

- [ ] **Step 3: Create config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts` (PWA added later in Task 12; keep minimal here):
```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
```

`postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
```

`src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';
```

`index.html`:
```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Terserah! - Cycle Synced Food Decider</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Write the failing smoke test**

`src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app header', () => {
  render(<App />);
  expect(screen.getByText(/TERSERAH!/i)).toBeInTheDocument();
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `ppnpm test src/App.test.tsx`
Expected: FAIL — `App` has no such text yet (or module/render error).

- [ ] **Step 6: Write minimal `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-bold">🍔 TERSERAH!</h1>
    </div>
  );
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `ppnpm test src/App.test.tsx`
Expected: PASS.

- [ ] **Step 8: Verify the build works**

Run: `pnpm build`
Expected: `tsc -b` passes with no type errors; `vite build` emits `dist/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite react ts tailwind + vitest with smoke test"
```

---

### Task 2: Domain types, full dataset, and dataset validation

**Files:**
- Create: `src/types/food.ts`, `public/data/foods.json`, `src/data/validateDataset.ts`
- Test: `src/data/validateDataset.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type MenstrualPhase = 'menstruasi' | 'folikular' | 'ovulasi' | 'luteal'`
  - `type ItemType = 'makanan' | 'minuman'`
  - `interface FoodItem { id: string; name: string; type: ItemType; phases: MenstrualPhase[]; wellnessNote: string; gmapsQuery: string; }`
  - `const PHASES: readonly MenstrualPhase[]`
  - `const PHASE_LABELS: Record<MenstrualPhase, string>`
  - `const MIN_PER_PHASE = 8`
  - `function validateDataset(items: FoodItem[]): { ok: boolean; errors: string[] }`
  - `public/data/foods.json` — the 40-item catalog served at runtime URL `/data/foods.json`.

- [ ] **Step 1: Create `src/types/food.ts`**

```typescript
export type MenstrualPhase = 'menstruasi' | 'folikular' | 'ovulasi' | 'luteal';
export type ItemType = 'makanan' | 'minuman';

export interface FoodItem {
  id: string;
  name: string;
  type: ItemType;
  phases: MenstrualPhase[];
  wellnessNote: string;
  gmapsQuery: string;
}

export const PHASES: readonly MenstrualPhase[] = [
  'menstruasi',
  'folikular',
  'ovulasi',
  'luteal',
] as const;

export const PHASE_LABELS: Record<MenstrualPhase, string> = {
  menstruasi: 'Menstruasi',
  folikular: 'Folikular',
  ovulasi: 'Ovulasi',
  luteal: 'Luteal',
};

export const MIN_PER_PHASE = 8;
```

- [ ] **Step 2: Create `public/data/foods.json` (the full catalog)**

```json
[
  { "id": "wedang-jahe", "name": "Wedang Jahe", "type": "minuman", "phases": ["menstruasi", "luteal"], "wellnessNote": "Jahe hangat dipercaya membantu meredakan kram.", "gmapsQuery": "wedang jahe terdekat" },
  { "id": "soto-ayam", "name": "Soto Ayam", "type": "makanan", "phases": ["menstruasi", "folikular"], "wellnessNote": "Kaldu hangat dan protein untuk pulihkan tenaga.", "gmapsQuery": "soto ayam terdekat" },
  { "id": "rendang", "name": "Rendang Daging", "type": "makanan", "phases": ["menstruasi"], "wellnessNote": "Daging merah, sumber zat besi untuk ganti darah haid.", "gmapsQuery": "rumah makan padang terdekat" },
  { "id": "bubur-kacang-hijau", "name": "Bubur Kacang Hijau", "type": "makanan", "phases": ["menstruasi", "folikular"], "wellnessNote": "Kacang hijau kaya zat besi, disajikan hangat.", "gmapsQuery": "bubur kacang hijau terdekat" },
  { "id": "kunyit-asam", "name": "Kunyit Asam", "type": "minuman", "phases": ["menstruasi"], "wellnessNote": "Kunyit dipercaya membantu redakan nyeri haid.", "gmapsQuery": "kunyit asam jamu terdekat" },
  { "id": "sup-buntut", "name": "Sup Buntut", "type": "makanan", "phases": ["menstruasi"], "wellnessNote": "Sup hangat berkuah yang menenangkan saat haid.", "gmapsQuery": "sup buntut terdekat" },
  { "id": "coklat-panas", "name": "Coklat Panas", "type": "minuman", "phases": ["menstruasi", "luteal"], "wellnessNote": "Coklat hangat untuk bantu angkat mood.", "gmapsQuery": "coklat panas cafe terdekat" },
  { "id": "gulai-kambing", "name": "Gulai Kambing", "type": "makanan", "phases": ["menstruasi"], "wellnessNote": "Daging kambing sebagai sumber zat besi.", "gmapsQuery": "gulai kambing terdekat" },
  { "id": "bandrek", "name": "Bandrek", "type": "minuman", "phases": ["menstruasi"], "wellnessNote": "Rempah hangat khas Sunda penghangat badan.", "gmapsQuery": "bandrek terdekat" },
  { "id": "kolak-pisang", "name": "Kolak Pisang", "type": "makanan", "phases": ["menstruasi", "luteal"], "wellnessNote": "Hangat dan manis, pisang bersantan pengganjal.", "gmapsQuery": "kolak pisang terdekat" },
  { "id": "bakso", "name": "Bakso", "type": "makanan", "phases": ["menstruasi", "folikular"], "wellnessNote": "Kuah hangat dengan protein yang mengenyangkan.", "gmapsQuery": "bakso terdekat" },
  { "id": "telur-balado", "name": "Telur Balado", "type": "makanan", "phases": ["menstruasi", "folikular"], "wellnessNote": "Protein telur yang praktis dan mengenyangkan.", "gmapsQuery": "warung nasi telur balado terdekat" },
  { "id": "wedang-uwuh", "name": "Wedang Uwuh", "type": "minuman", "phases": ["menstruasi", "luteal"], "wellnessNote": "Rempah hangat yang kaya antioksidan.", "gmapsQuery": "wedang uwuh terdekat" },
  { "id": "sop-ayam", "name": "Sop Ayam", "type": "makanan", "phases": ["menstruasi", "luteal"], "wellnessNote": "Kuah bening hangat yang menenangkan.", "gmapsQuery": "sop ayam terdekat" },
  { "id": "gado-gado", "name": "Gado-gado", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Sayur segar dengan tahu-tempe untuk energi ringan.", "gmapsQuery": "gado gado terdekat" },
  { "id": "tempe-mendoan", "name": "Tempe Mendoan", "type": "makanan", "phases": ["folikular"], "wellnessNote": "Tempe fermentasi sebagai protein nabati.", "gmapsQuery": "tempe mendoan terdekat" },
  { "id": "salad-buah", "name": "Salad Buah", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Buah segar yang penuh vitamin.", "gmapsQuery": "salad buah terdekat" },
  { "id": "nasi-pecel", "name": "Nasi Pecel", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Sayur rebus dan bumbu kacang, ringan bergizi.", "gmapsQuery": "nasi pecel terdekat" },
  { "id": "yogurt-buah", "name": "Yogurt Buah", "type": "minuman", "phases": ["folikular"], "wellnessNote": "Probiotik yang bersahabat untuk pencernaan.", "gmapsQuery": "yogurt terdekat" },
  { "id": "ikan-bakar", "name": "Ikan Bakar", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Protein dan omega-3 dari ikan segar.", "gmapsQuery": "ikan bakar terdekat" },
  { "id": "karedok", "name": "Karedok", "type": "makanan", "phases": ["folikular"], "wellnessNote": "Sayur mentah segar khas Sunda.", "gmapsQuery": "karedok terdekat" },
  { "id": "sushi", "name": "Sushi", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Ikan dan nasi yang ringan serta mudah dicerna.", "gmapsQuery": "sushi terdekat" },
  { "id": "tahu-gejrot", "name": "Tahu Gejrot", "type": "makanan", "phases": ["folikular"], "wellnessNote": "Tahu ringan dengan kuah segar.", "gmapsQuery": "tahu gejrot terdekat" },
  { "id": "nasi-goreng", "name": "Nasi Goreng", "type": "makanan", "phases": ["folikular"], "wellnessNote": "Klasik, cepat, dan mengenyangkan.", "gmapsQuery": "nasi goreng terdekat" },
  { "id": "mie-ayam", "name": "Mie Ayam", "type": "makanan", "phases": ["folikular", "luteal"], "wellnessNote": "Hangat dan mengenyangkan untuk mengganjal.", "gmapsQuery": "mie ayam terdekat" },
  { "id": "sayur-asem", "name": "Sayur Asem", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Sayur berkuah asam yang segar.", "gmapsQuery": "sayur asem terdekat" },
  { "id": "pepes-ikan", "name": "Pepes Ikan", "type": "makanan", "phases": ["folikular", "ovulasi"], "wellnessNote": "Ikan kukus yang rendah minyak.", "gmapsQuery": "pepes ikan terdekat" },
  { "id": "rujak-buah", "name": "Rujak Buah", "type": "makanan", "phases": ["ovulasi"], "wellnessNote": "Buah segar kaya serat dan vitamin C.", "gmapsQuery": "rujak buah terdekat" },
  { "id": "smoothie-bowl", "name": "Smoothie Bowl", "type": "minuman", "phases": ["ovulasi", "folikular"], "wellnessNote": "Buah dan biji-bijian yang penuh antioksidan.", "gmapsQuery": "smoothie bowl terdekat" },
  { "id": "ayam-bakar-lalapan", "name": "Ayam Bakar Lalapan", "type": "makanan", "phases": ["ovulasi"], "wellnessNote": "Protein dengan sayuran segar sebagai lalap.", "gmapsQuery": "ayam bakar lalapan terdekat" },
  { "id": "es-buah", "name": "Es Buah", "type": "minuman", "phases": ["ovulasi"], "wellnessNote": "Segar dan menghidrasi dengan potongan buah.", "gmapsQuery": "es buah terdekat" },
  { "id": "capcay", "name": "Capcay", "type": "makanan", "phases": ["ovulasi", "luteal"], "wellnessNote": "Aneka sayur yang tinggi serat.", "gmapsQuery": "capcay terdekat" },
  { "id": "es-teh-lemon", "name": "Es Teh Lemon", "type": "minuman", "phases": ["ovulasi"], "wellnessNote": "Segar dengan sentuhan vitamin C.", "gmapsQuery": "es teh lemon terdekat" },
  { "id": "pisang-goreng", "name": "Pisang Goreng", "type": "makanan", "phases": ["luteal"], "wellnessNote": "Pisang sebagai sumber magnesium dan kalium.", "gmapsQuery": "pisang goreng terdekat" },
  { "id": "nasi-uduk", "name": "Nasi Uduk", "type": "makanan", "phases": ["luteal"], "wellnessNote": "Karbohidrat kompleks yang mengenyangkan.", "gmapsQuery": "nasi uduk terdekat" },
  { "id": "ubi-cilembu", "name": "Ubi Cilembu", "type": "makanan", "phases": ["luteal"], "wellnessNote": "Karbohidrat kompleks dengan manis alami.", "gmapsQuery": "ubi cilembu bakar terdekat" },
  { "id": "dark-chocolate", "name": "Dark Chocolate", "type": "makanan", "phases": ["luteal"], "wellnessNote": "Dipercaya membantu mengangkat suasana hati.", "gmapsQuery": "toko coklat terdekat" },
  { "id": "kacang-rebus", "name": "Kacang Rebus", "type": "makanan", "phases": ["luteal"], "wellnessNote": "Camilan sumber magnesium yang ringan.", "gmapsQuery": "kacang rebus terdekat" },
  { "id": "oatmeal", "name": "Oatmeal", "type": "makanan", "phases": ["luteal", "folikular"], "wellnessNote": "Karbohidrat kompleks yang mengenyangkan lebih lama.", "gmapsQuery": "oatmeal cafe terdekat" },
  { "id": "jus-alpukat", "name": "Jus Alpukat", "type": "minuman", "phases": ["luteal"], "wellnessNote": "Lemak sehat dan kalium dari alpukat.", "gmapsQuery": "jus alpukat terdekat" }
]
```

> Reviewer note: 40 items. Per-phase counts — menstruasi 14, folikular 18, ovulasi 13, luteal 14 — all ≥ 8. The test in this task enforces these invariants, so if you edit the list, the test guards you.

- [ ] **Step 3: Write the failing validation test**

`src/data/validateDataset.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import foods from '../../public/data/foods.json';
import { validateDataset } from './validateDataset';
import { PHASES, MIN_PER_PHASE, type FoodItem } from '../types/food';

const items = foods as FoodItem[];

describe('validateDataset', () => {
  it('accepts the shipped catalog', () => {
    const result = validateDataset(items);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('flags a phase with fewer than the minimum items', () => {
    const sparse = items.filter((i) => !i.phases.includes('luteal'));
    const result = validateDataset(sparse);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/luteal/);
  });

  it('flags duplicate ids', () => {
    const dup = [...items, items[0]];
    const result = validateDataset(dup);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/duplicate/i);
  });

  it('confirms every phase meets the minimum', () => {
    for (const phase of PHASES) {
      const count = items.filter((i) => i.phases.includes(phase)).length;
      expect(count).toBeGreaterThanOrEqual(MIN_PER_PHASE);
    }
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `ppnpm test src/data/validateDataset.test.ts`
Expected: FAIL — `validateDataset` not implemented.

- [ ] **Step 5: Implement `src/data/validateDataset.ts`**

```typescript
import { PHASES, MIN_PER_PHASE, type FoodItem } from '../types/food';

export function validateDataset(items: FoodItem[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`duplicate id: ${item.id}`);
    }
    seen.add(item.id);

    if (!item.name.trim()) errors.push(`empty name for id: ${item.id}`);
    if (!item.wellnessNote.trim()) errors.push(`empty wellnessNote for id: ${item.id}`);
    if (!item.gmapsQuery.trim()) errors.push(`empty gmapsQuery for id: ${item.id}`);
    if (item.phases.length === 0) errors.push(`no phases for id: ${item.id}`);
  }

  for (const phase of PHASES) {
    const count = items.filter((i) => i.phases.includes(phase)).length;
    if (count < MIN_PER_PHASE) {
      errors.push(`phase ${phase} has ${count} items, needs at least ${MIN_PER_PHASE}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `ppnpm test src/data/validateDataset.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add food types, 40-item catalog, and dataset validation"
```

---

### Task 3: Wheel sampling logic

**Files:**
- Create: `src/lib/sampleWheel.ts`
- Test: `src/lib/sampleWheel.test.ts`

**Interfaces:**
- Consumes: `FoodItem`, `MenstrualPhase` from `src/types/food.ts`.
- Produces:
  - `const WHEEL_SIZE = 8`
  - `function itemsForPhase(items: FoodItem[], phase: MenstrualPhase): FoodItem[]`
  - `function sampleWheel(items: FoodItem[], phase: MenstrualPhase, opts?: { excludeId?: string; rng?: () => number }): FoodItem[]` — returns up to `WHEEL_SIZE` items from the phase, shuffled by `rng` (default `Math.random`), excluding `excludeId` when doing so still leaves at least one item.

- [ ] **Step 1: Write the failing tests**

`src/lib/sampleWheel.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { itemsForPhase, sampleWheel, WHEEL_SIZE } from './sampleWheel';
import type { FoodItem } from '../types/food';

function makeItems(n: number, phase: FoodItem['phases'][number]): FoodItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    name: `Item ${i}`,
    type: 'makanan' as const,
    phases: [phase],
    wellnessNote: 'note',
    gmapsQuery: 'q',
  }));
}

// Deterministic rng: returns a fixed sequence, cycling.
function seededRng(seq: number[]): () => number {
  let i = 0;
  return () => seq[i++ % seq.length];
}

describe('itemsForPhase', () => {
  it('returns only items tagged with the phase', () => {
    const items: FoodItem[] = [
      ...makeItems(3, 'menstruasi'),
      ...makeItems(2, 'luteal'),
    ];
    expect(itemsForPhase(items, 'menstruasi')).toHaveLength(3);
    expect(itemsForPhase(items, 'luteal')).toHaveLength(2);
  });
});

describe('sampleWheel', () => {
  it('caps the result at WHEEL_SIZE', () => {
    const items = makeItems(20, 'ovulasi');
    const wheel = sampleWheel(items, 'ovulasi', { rng: () => 0 });
    expect(wheel).toHaveLength(WHEEL_SIZE);
  });

  it('returns all items when the phase has fewer than WHEEL_SIZE', () => {
    const items = makeItems(5, 'folikular');
    const wheel = sampleWheel(items, 'folikular', { rng: () => 0 });
    expect(wheel).toHaveLength(5);
  });

  it('excludes the previous result when others remain', () => {
    const items = makeItems(10, 'menstruasi');
    const wheel = sampleWheel(items, 'menstruasi', {
      excludeId: 'id-0',
      rng: seededRng([0.1, 0.5, 0.9, 0.3]),
    });
    expect(wheel.some((w) => w.id === 'id-0')).toBe(false);
  });

  it('still returns the only item even if it equals excludeId', () => {
    const items = makeItems(1, 'luteal');
    const wheel = sampleWheel(items, 'luteal', { excludeId: 'id-0', rng: () => 0 });
    expect(wheel).toHaveLength(1);
    expect(wheel[0].id).toBe('id-0');
  });

  it('only returns items from the requested phase', () => {
    const items = [...makeItems(10, 'ovulasi'), ...makeItems(10, 'luteal')];
    const wheel = sampleWheel(items, 'ovulasi', { rng: () => 0 });
    expect(wheel.every((w) => w.phases.includes('ovulasi'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `ppnpm test src/lib/sampleWheel.test.ts`
Expected: FAIL — module not found / functions undefined.

- [ ] **Step 3: Implement `src/lib/sampleWheel.ts`**

```typescript
import type { FoodItem, MenstrualPhase } from '../types/food';

export const WHEEL_SIZE = 8;

export function itemsForPhase(items: FoodItem[], phase: MenstrualPhase): FoodItem[] {
  return items.filter((item) => item.phases.includes(phase));
}

// Fisher-Yates shuffle driven by an injectable rng for deterministic tests.
function shuffle<T>(input: T[], rng: () => number): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sampleWheel(
  items: FoodItem[],
  phase: MenstrualPhase,
  opts: { excludeId?: string; rng?: () => number } = {}
): FoodItem[] {
  const { excludeId, rng = Math.random } = opts;
  const pool = itemsForPhase(items, phase);

  // Exclude the previous result only if doing so leaves at least one item.
  const filtered =
    excludeId && pool.some((i) => i.id !== excludeId)
      ? pool.filter((i) => i.id !== excludeId)
      : pool;

  return shuffle(filtered, rng).slice(0, WHEEL_SIZE);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `ppnpm test src/lib/sampleWheel.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add phase filtering and wheel sampling with exclude-last"
```

---

### Task 4: Google Maps navigation utility

**Files:**
- Create: `src/lib/navigation.ts`
- Test: `src/lib/navigation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `function buildMapsUrl(query: string): string`
  - `function openGoogleMapsSearch(query: string): void`

- [ ] **Step 1: Write the failing tests**

`src/lib/navigation.test.ts`:
```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildMapsUrl, openGoogleMapsSearch } from './navigation';

describe('buildMapsUrl', () => {
  it('builds a Maps search URL with encoded query', () => {
    expect(buildMapsUrl('soto ayam terdekat')).toBe(
      'https://www.google.com/maps/search/?api=1&query=soto%20ayam%20terdekat'
    );
  });

  it('encodes special characters', () => {
    expect(buildMapsUrl('nasi & mie')).toContain('nasi%20%26%20mie');
  });
});

describe('openGoogleMapsSearch', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens the built URL in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    openGoogleMapsSearch('bakso terdekat');
    expect(openSpy).toHaveBeenCalledWith(
      buildMapsUrl('bakso terdekat'),
      '_blank',
      'noopener,noreferrer'
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `ppnpm test src/lib/navigation.test.ts`
Expected: FAIL — module/functions undefined.

- [ ] **Step 3: Implement `src/lib/navigation.ts`**

```typescript
export function buildMapsUrl(query: string): string {
  const encoded = encodeURIComponent(query.trim());
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export function openGoogleMapsSearch(query: string): void {
  window.open(buildMapsUrl(query), '_blank', 'noopener,noreferrer');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `ppnpm test src/lib/navigation.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add google maps deep-link navigation util"
```

---

### Task 5: History storage (localStorage)

**Files:**
- Create: `src/lib/historyStore.ts`
- Test: `src/lib/historyStore.test.ts`

**Interfaces:**
- Consumes: `MenstrualPhase` from `src/types/food.ts`.
- Produces:
  - `interface HistoryEntry { id: string; name: string; phase: MenstrualPhase; timestamp: number; }`
  - `const HISTORY_KEY = 'terserah:history'`
  - `const HISTORY_LIMIT = 20`
  - `function readHistory(): HistoryEntry[]`
  - `function appendHistory(entry: HistoryEntry): HistoryEntry[]` — prepends newest-first, caps at `HISTORY_LIMIT`, persists, returns the new list.

- [ ] **Step 1: Write the failing tests**

`src/lib/historyStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { readHistory, appendHistory, HISTORY_KEY, HISTORY_LIMIT } from './historyStore';

beforeEach(() => localStorage.clear());

describe('historyStore', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(readHistory()).toEqual([]);
  });

  it('appends newest-first and persists', () => {
    appendHistory({ id: 'a', name: 'A', phase: 'menstruasi', timestamp: 1 });
    const list = appendHistory({ id: 'b', name: 'B', phase: 'luteal', timestamp: 2 });
    expect(list.map((e) => e.id)).toEqual(['b', 'a']);
    expect(readHistory().map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('caps the stored history at HISTORY_LIMIT', () => {
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      appendHistory({ id: `id-${i}`, name: `N${i}`, phase: 'ovulasi', timestamp: i });
    }
    expect(readHistory()).toHaveLength(HISTORY_LIMIT);
    expect(readHistory()[0].id).toBe(`id-${HISTORY_LIMIT + 4}`);
  });

  it('returns an empty array when stored data is corrupt', () => {
    localStorage.setItem(HISTORY_KEY, 'not json');
    expect(readHistory()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `ppnpm test src/lib/historyStore.test.ts`
Expected: FAIL — module/functions undefined.

- [ ] **Step 3: Implement `src/lib/historyStore.ts`**

```typescript
import type { MenstrualPhase } from '../types/food';

export interface HistoryEntry {
  id: string;
  name: string;
  phase: MenstrualPhase;
  timestamp: number;
}

export const HISTORY_KEY = 'terserah:history';
export const HISTORY_LIMIT = 20;

export function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...readHistory()].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `ppnpm test src/lib/historyStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add localStorage-backed spin history store"
```

---

### Task 6: Query client, persistence, and catalog query

**Files:**
- Create: `src/queryClient.ts`, `src/data/useFoods.ts`
- Modify: `src/main.tsx` (wrap app in `PersistQueryClientProvider`)
- Test: `src/data/useFoods.test.tsx`

**Interfaces:**
- Consumes: `FoodItem` from `src/types/food.ts`.
- Produces:
  - `const queryClient: QueryClient`
  - `const persister` (sync localStorage persister)
  - `const FOODS_QUERY_KEY = ['foods'] as const`
  - `async function fetchFoods(): Promise<FoodItem[]>` — fetches `/data/foods.json`.
  - `function useFoods(): UseQueryResult<FoodItem[], Error>`

- [ ] **Step 1: Create `src/queryClient.ts`**

```typescript
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // static catalog; never goes stale within a session
      gcTime: 1000 * 60 * 60 * 24 * 7, // keep in cache 7 days for persistence
      retry: 1,
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'terserah:query-cache',
});
```

- [ ] **Step 2: Write the failing test for `useFoods`**

`src/data/useFoods.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFoods } from './useFoods';
import type { ReactNode } from 'react';

const sample = [
  { id: 'x', name: 'X', type: 'makanan', phases: ['menstruasi'], wellnessNote: 'n', gmapsQuery: 'q' },
];

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => sample }) as Response)
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('useFoods', () => {
  it('fetches and returns the catalog', async () => {
    const { result } = renderHook(() => useFoods(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sample);
    expect(fetch).toHaveBeenCalledWith('/data/foods.json');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `ppnpm test src/data/useFoods.test.tsx`
Expected: FAIL — `useFoods` undefined.

- [ ] **Step 4: Implement `src/data/useFoods.ts`**

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { FoodItem } from '../types/food';

export const FOODS_QUERY_KEY = ['foods'] as const;

export async function fetchFoods(): Promise<FoodItem[]> {
  const res = await fetch('/data/foods.json');
  if (!res.ok) throw new Error(`Failed to load catalog: ${res.status}`);
  return (await res.json()) as FoodItem[];
}

export function useFoods(): UseQueryResult<FoodItem[], Error> {
  return useQuery({ queryKey: FOODS_QUERY_KEY, queryFn: fetchFoods });
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `ppnpm test src/data/useFoods.test.tsx`
Expected: PASS.

- [ ] **Step 6: Wire persistence into `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import App from './App';
import { queryClient, persister } from './queryClient';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <App />
    </PersistQueryClientProvider>
  </StrictMode>
);
```

- [ ] **Step 7: Verify build and full test run**

Run: `pnpm build && pnpm test`
Expected: build succeeds; all tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add react-query client with offline persistence and catalog query"
```

---

### Task 7: History hook (mutation + query)

**Files:**
- Create: `src/data/useHistory.ts`
- Test: `src/data/useHistory.test.tsx`

**Interfaces:**
- Consumes: `readHistory`, `appendHistory`, `HistoryEntry` from `src/lib/historyStore.ts`.
- Produces:
  - `const HISTORY_QUERY_KEY = ['history'] as const`
  - `function useHistory(): { entries: HistoryEntry[]; addToHistory: (entry: HistoryEntry) => void }`

- [ ] **Step 1: Write the failing test**

`src/data/useHistory.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHistory } from './useHistory';
import type { ReactNode } from 'react';

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => localStorage.clear());

describe('useHistory', () => {
  it('starts empty and records an added entry', async () => {
    const { result } = renderHook(() => useHistory(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.entries).toEqual([]));

    act(() => {
      result.current.addToHistory({ id: 'a', name: 'A', phase: 'menstruasi', timestamp: 1 });
    });

    await waitFor(() => expect(result.current.entries.map((e) => e.id)).toEqual(['a']));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `ppnpm test src/data/useHistory.test.tsx`
Expected: FAIL — `useHistory` undefined.

- [ ] **Step 3: Implement `src/data/useHistory.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readHistory, appendHistory, type HistoryEntry } from '../lib/historyStore';

export const HISTORY_QUERY_KEY = ['history'] as const;

export function useHistory(): {
  entries: HistoryEntry[];
  addToHistory: (entry: HistoryEntry) => void;
} {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: async () => readHistory(),
    initialData: readHistory,
  });

  const mutation = useMutation({
    mutationFn: async (entry: HistoryEntry) => appendHistory(entry),
    onSuccess: (next) => {
      queryClient.setQueryData(HISTORY_QUERY_KEY, next);
    },
  });

  return {
    entries: data ?? [],
    addToHistory: (entry) => mutation.mutate(entry),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `ppnpm test src/data/useHistory.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add history hook backed by mutation and query"
```

---

### Task 8: Phase tabs component

**Files:**
- Create: `src/components/PhaseTabs.tsx`
- Test: `src/components/PhaseTabs.test.tsx`

**Interfaces:**
- Consumes: `MenstrualPhase`, `PHASES`, `PHASE_LABELS` from `src/types/food.ts`.
- Produces:
  - `interface PhaseTabsProps { active: MenstrualPhase; onChange: (phase: MenstrualPhase) => void; }`
  - `function PhaseTabs(props: PhaseTabsProps): JSX.Element` (default export)

- [ ] **Step 1: Write the failing test**

`src/components/PhaseTabs.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhaseTabs from './PhaseTabs';

describe('PhaseTabs', () => {
  it('renders all four phases and marks the active one', () => {
    render(<PhaseTabs active="ovulasi" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: /Menstruasi/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ovulasi/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('calls onChange with the clicked phase', async () => {
    const onChange = vi.fn();
    render(<PhaseTabs active="menstruasi" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /Luteal/i }));
    expect(onChange).toHaveBeenCalledWith('luteal');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `ppnpm test src/components/PhaseTabs.test.tsx`
Expected: FAIL — component undefined.

- [ ] **Step 3: Implement `src/components/PhaseTabs.tsx`**

```tsx
import { PHASES, PHASE_LABELS, type MenstrualPhase } from '../types/food';

export interface PhaseTabsProps {
  active: MenstrualPhase;
  onChange: (phase: MenstrualPhase) => void;
}

export default function PhaseTabs({ active, onChange }: PhaseTabsProps) {
  return (
    <div role="tablist" aria-label="Fase siklus" className="grid grid-cols-4 gap-1">
      {PHASES.map((phase) => {
        const selected = phase === active;
        return (
          <button
            key={phase}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(phase)}
            className={
              'rounded-md px-2 py-2 text-xs transition ' +
              (selected ? 'bg-slate-800 font-bold text-white' : 'bg-slate-100 text-slate-600')
            }
          >
            {PHASE_LABELS[phase]}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `ppnpm test src/components/PhaseTabs.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add phase tabs component"
```

---

### Task 9: Spinner wheel component

**Files:**
- Create: `src/components/SpinnerWheel.tsx`
- Test: `src/components/SpinnerWheel.test.tsx`

**Interfaces:**
- Consumes: `FoodItem`, `MenstrualPhase` from `src/types/food.ts`; `sampleWheel`, `WHEEL_SIZE` from `src/lib/sampleWheel.ts`.
- Produces:
  - `interface SpinnerWheelProps { items: FoodItem[]; phase: MenstrualPhase; lastResultId?: string; onResult: (item: FoodItem) => void; }`
  - `function SpinnerWheel(props: SpinnerWheelProps): JSX.Element` (default export). Renders a "PUTAR" button; on click it samples up to `WHEEL_SIZE` items (excluding `lastResultId`), shows their names as segments, picks one as the result, and calls `onResult` with it after the spin animation.

**Implementation note on testing animation:** the result is chosen synchronously at click time and revealed after a fixed timeout. Tests use `vi.useFakeTimers()` to advance past the animation and a stubbed `Math.random` for determinism. The visual rotation is CSS transform only and is not asserted.

- [ ] **Step 1: Write the failing test**

`src/components/SpinnerWheel.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SpinnerWheel from './SpinnerWheel';
import type { FoodItem } from '../types/food';

function makeItems(n: number): FoodItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    name: `Food ${i}`,
    type: 'makanan' as const,
    phases: ['menstruasi' as const],
    wellnessNote: 'note',
    gmapsQuery: 'q',
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('SpinnerWheel', () => {
  it('renders at most WHEEL_SIZE segments after spinning', () => {
    const onResult = vi.fn();
    render(
      <SpinnerWheel items={makeItems(20)} phase="menstruasi" onResult={onResult} />
    );
    act(() => {
      screen.getByRole('button', { name: /putar/i }).click();
    });
    expect(screen.getAllByTestId('wheel-segment').length).toBeLessThanOrEqual(8);
  });

  it('calls onResult with a sampled item after the animation', () => {
    const onResult = vi.fn();
    render(
      <SpinnerWheel items={makeItems(10)} phase="menstruasi" onResult={onResult} />
    );
    act(() => {
      screen.getByRole('button', { name: /putar/i }).click();
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult.mock.calls[0][0].id).toMatch(/^id-\d+$/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `ppnpm test src/components/SpinnerWheel.test.tsx`
Expected: FAIL — component undefined.

- [ ] **Step 3: Implement `src/components/SpinnerWheel.tsx`**

```tsx
import { useState } from 'react';
import type { FoodItem, MenstrualPhase } from '../types/food';
import { sampleWheel } from '../lib/sampleWheel';

const SPIN_MS = 3500;

export interface SpinnerWheelProps {
  items: FoodItem[];
  phase: MenstrualPhase;
  lastResultId?: string;
  onResult: (item: FoodItem) => void;
}

export default function SpinnerWheel({ items, phase, lastResultId, onResult }: SpinnerWheelProps) {
  const [segments, setSegments] = useState<FoodItem[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  function handleSpin() {
    if (isSpinning) return;
    const wheel = sampleWheel(items, phase, { excludeId: lastResultId });
    if (wheel.length === 0) return;

    const winnerIndex = Math.floor(Math.random() * wheel.length);
    const sliceDeg = 360 / wheel.length;
    // Land the winner slice under the top pointer, after several full turns.
    const target = 360 * 5 - (winnerIndex * sliceDeg + sliceDeg / 2);

    setSegments(wheel);
    setRotation(target);
    setIsSpinning(true);

    window.setTimeout(() => {
      setIsSpinning(false);
      onResult(wheel[winnerIndex]);
    }, SPIN_MS);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        aria-hidden={segments.length === 0}
        className="relative aspect-square w-full max-w-xs rounded-full border-4 border-slate-800"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? `transform ${SPIN_MS}ms cubic-bezier(0.1,0.7,0.1,1)` : 'none',
        }}
      >
        {segments.map((item, i) => {
          const sliceDeg = 360 / segments.length;
          return (
            <span
              key={item.id}
              data-testid="wheel-segment"
              className="absolute left-1/2 top-1/2 origin-left text-[10px] font-semibold text-slate-700"
              style={{ transform: `rotate(${i * sliceDeg}deg) translateX(8px)` }}
            >
              {item.name}
            </span>
          );
        })}
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="min-h-[54px] w-full rounded-xl bg-slate-800 px-4 text-base font-bold text-white disabled:opacity-60"
      >
        🔄 {isSpinning ? 'Memutar…' : 'PUTAR RODA KEBERUNTUNGAN'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `ppnpm test src/components/SpinnerWheel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add spinner wheel component with sampled segments"
```

---

### Task 10: Result card + disclaimer

**Files:**
- Create: `src/components/ResultCard.tsx`
- Test: `src/components/ResultCard.test.tsx`

**Interfaces:**
- Consumes: `FoodItem` from `src/types/food.ts`; `openGoogleMapsSearch` from `src/lib/navigation.ts`.
- Produces:
  - `interface ResultCardProps { item: FoodItem; seenBefore: boolean; onCommit: (item: FoodItem) => void; }`
  - `function ResultCard(props: ResultCardProps): JSX.Element` (default export). Shows the item name, `wellnessNote`, the persistent disclaimer, a "sudah pernah" badge when `seenBefore`, and a Maps CTA that calls `onCommit(item)` then opens Maps.

- [ ] **Step 1: Write the failing test**

`src/components/ResultCard.test.tsx`:
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultCard from './ResultCard';
import * as nav from '../lib/navigation';
import type { FoodItem } from '../types/food';

const item: FoodItem = {
  id: 'soto-ayam',
  name: 'Soto Ayam',
  type: 'makanan',
  phases: ['menstruasi'],
  wellnessNote: 'Kaldu hangat dan protein.',
  gmapsQuery: 'soto ayam terdekat',
};

afterEach(() => vi.restoreAllMocks());

describe('ResultCard', () => {
  it('shows the item, note, and disclaimer', () => {
    render(<ResultCard item={item} seenBefore={false} onCommit={() => {}} />);
    expect(screen.getByText('Soto Ayam')).toBeInTheDocument();
    expect(screen.getByText(/Kaldu hangat/)).toBeInTheDocument();
    expect(screen.getByText(/bukan saran medis/i)).toBeInTheDocument();
  });

  it('shows the "sudah pernah" badge only when seenBefore', () => {
    const { rerender } = render(
      <ResultCard item={item} seenBefore={false} onCommit={() => {}} />
    );
    expect(screen.queryByText(/sudah pernah/i)).not.toBeInTheDocument();
    rerender(<ResultCard item={item} seenBefore={true} onCommit={() => {}} />);
    expect(screen.getByText(/sudah pernah/i)).toBeInTheDocument();
  });

  it('commits and opens maps on CTA tap', async () => {
    const onCommit = vi.fn();
    const openSpy = vi.spyOn(nav, 'openGoogleMapsSearch').mockImplementation(() => {});
    render(<ResultCard item={item} seenBefore={false} onCommit={onCommit} />);
    await userEvent.click(screen.getByRole('button', { name: /google maps/i }));
    expect(onCommit).toHaveBeenCalledWith(item);
    expect(openSpy).toHaveBeenCalledWith('soto ayam terdekat');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `ppnpm test src/components/ResultCard.test.tsx`
Expected: FAIL — component undefined.

- [ ] **Step 3: Implement `src/components/ResultCard.tsx`**

```tsx
import type { FoodItem } from '../types/food';
import { openGoogleMapsSearch } from '../lib/navigation';

export interface ResultCardProps {
  item: FoodItem;
  seenBefore: boolean;
  onCommit: (item: FoodItem) => void;
}

export default function ResultCard({ item, seenBefore, onCommit }: ResultCardProps) {
  function handleCommit() {
    onCommit(item);
    openGoogleMapsSearch(item.gmapsQuery);
  }

  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-slate-500">🎉 Hasil Putaran</p>
      <p className="mt-1 text-lg font-bold text-slate-900">⭐ {item.name}</p>
      {seenBefore && (
        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
          Sudah pernah
        </span>
      )}
      <p className="mt-2 text-sm text-slate-700">🩺 {item.wellnessNote}</p>
      <p className="mt-1 text-[11px] italic text-slate-400">Info bersifat umum, bukan saran medis.</p>
      <button
        onClick={handleCommit}
        className="mt-3 min-h-[54px] w-full rounded-xl bg-emerald-600 px-4 text-base font-bold text-white"
      >
        📍 Cari tempat terdekat di Google Maps
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `ppnpm test src/components/ResultCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add result card with wellness note, disclaimer, and maps cta"
```

---

### Task 11: History list component

**Files:**
- Create: `src/components/HistoryList.tsx`
- Test: `src/components/HistoryList.test.tsx`

**Interfaces:**
- Consumes: `HistoryEntry` from `src/lib/historyStore.ts`; `PHASE_LABELS` from `src/types/food.ts`.
- Produces:
  - `interface HistoryListProps { entries: HistoryEntry[]; }`
  - `function HistoryList(props: HistoryListProps): JSX.Element` (default export). Collapsible `<details>` showing entries newest-first; renders a friendly empty state when there are none.

- [ ] **Step 1: Write the failing test**

`src/components/HistoryList.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryList from './HistoryList';
import type { HistoryEntry } from '../lib/historyStore';

const entries: HistoryEntry[] = [
  { id: 'soto-ayam', name: 'Soto Ayam', phase: 'menstruasi', timestamp: 2 },
  { id: 'gado-gado', name: 'Gado-gado', phase: 'ovulasi', timestamp: 1 },
];

describe('HistoryList', () => {
  it('renders an empty state when there are no entries', () => {
    render(<HistoryList entries={[]} />);
    expect(screen.getByText(/belum ada/i)).toBeInTheDocument();
  });

  it('lists entries with their phase label', () => {
    render(<HistoryList entries={entries} />);
    expect(screen.getByText('Soto Ayam')).toBeInTheDocument();
    expect(screen.getByText('Gado-gado')).toBeInTheDocument();
    expect(screen.getByText(/Ovulasi/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `ppnpm test src/components/HistoryList.test.tsx`
Expected: FAIL — component undefined.

- [ ] **Step 3: Implement `src/components/HistoryList.tsx`**

```tsx
import { PHASE_LABELS } from '../types/food';
import type { HistoryEntry } from '../lib/historyStore';

export interface HistoryListProps {
  entries: HistoryEntry[];
}

export default function HistoryList({ entries }: HistoryListProps) {
  return (
    <details className="mt-6 rounded-xl bg-slate-50 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
        📜 Riwayat Pilihan ({entries.length})
      </summary>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">Belum ada pilihan yang tersimpan.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {entries.map((entry) => (
            <li
              key={`${entry.id}-${entry.timestamp}`}
              className="flex items-center justify-between text-sm text-slate-700"
            >
              <span>{entry.name}</span>
              <span className="text-xs text-slate-400">{PHASE_LABELS[entry.phase]}</span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `ppnpm test src/components/HistoryList.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add collapsible history list component"
```

---

### Task 12: Compose the App

**Files:**
- Modify: `src/App.tsx` (replace the Task 1 placeholder)
- Test: `src/App.test.tsx` (replace the Task 1 smoke test)

**Interfaces:**
- Consumes: `useFoods`, `useHistory`, `PhaseTabs`, `SpinnerWheel`, `ResultCard`, `HistoryList`, and types.
- Produces: the composed single-screen experience. No new exported interface.

State orchestration: `App` holds `phase` (default `'menstruasi'`) and `result: FoodItem | null`. `SpinnerWheel.onResult` sets `result`. `ResultCard.onCommit` calls `addToHistory({ id, name, phase, timestamp: Date.now() })`. `seenBefore` is `history.entries.some((e) => e.id === result.id)`. `lastResultId` passed to the wheel is `result?.id`. Changing the phase clears the current `result`.

- [ ] **Step 1: Replace the smoke test with an integration test**

`src/App.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import type { ReactNode } from 'react';

const sample = [
  { id: 'a', name: 'Alpha', type: 'makanan', phases: ['menstruasi'], wellnessNote: 'note a', gmapsQuery: 'alpha terdekat' },
  { id: 'b', name: 'Beta', type: 'makanan', phases: ['menstruasi'], wellnessNote: 'note b', gmapsQuery: 'beta terdekat' },
];

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => sample }) as Response)
  );
  vi.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders header and phase tabs after the catalog loads', async () => {
    render(<App />, { wrapper });
    expect(screen.getByText(/TERSERAH!/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Menstruasi/i })).toBeInTheDocument()
    );
  });

  it('spins, shows a result, and records history on maps commit', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />, { wrapper });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /putar/i })).toBeEnabled()
    );

    vi.useFakeTimers();
    act(() => {
      screen.getByRole('button', { name: /putar/i }).click();
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    vi.useRealTimers();

    const cta = await screen.findByRole('button', { name: /google maps/i });
    await userEvent.click(cta);

    await waitFor(() =>
      expect(screen.getByText(/Riwayat Pilihan \(1\)/i)).toBeInTheDocument()
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `ppnpm test src/App.test.tsx`
Expected: FAIL — `App` still the placeholder; no tabs/wheel.

- [ ] **Step 3: Implement `src/App.tsx`**

```tsx
import { useState } from 'react';
import { useFoods } from './data/useFoods';
import { useHistory } from './data/useHistory';
import PhaseTabs from './components/PhaseTabs';
import SpinnerWheel from './components/SpinnerWheel';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import type { FoodItem, MenstrualPhase } from './types/food';

export default function App() {
  const { data: foods, isLoading, isError } = useFoods();
  const { entries, addToHistory } = useHistory();
  const [phase, setPhase] = useState<MenstrualPhase>('menstruasi');
  const [result, setResult] = useState<FoodItem | null>(null);

  function handlePhaseChange(next: MenstrualPhase) {
    setPhase(next);
    setResult(null);
  }

  function handleCommit(item: FoodItem) {
    addToHistory({ id: item.id, name: item.name, phase, timestamp: Date.now() });
  }

  const seenBefore = result ? entries.some((e) => e.id === result.id) : false;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🍔 TERSERAH!</h1>
      </header>

      <section>
        <p className="mb-2 text-sm font-semibold text-slate-700">🩸 Pilih fase siklus hari ini:</p>
        <PhaseTabs active={phase} onChange={handlePhaseChange} />
      </section>

      {isLoading && <p className="text-center text-sm text-slate-500">Memuat menu…</p>}
      {isError && (
        <p className="text-center text-sm text-red-500">Gagal memuat menu. Coba lagi nanti.</p>
      )}

      {foods && (
        <SpinnerWheel
          items={foods}
          phase={phase}
          lastResultId={result?.id}
          onResult={setResult}
        />
      )}

      {result && <ResultCard item={result} seenBefore={seenBefore} onCommit={handleCommit} />}

      <HistoryList entries={entries} />
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `ppnpm test src/App.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full suite and build**

Run: `pnpm test && pnpm build`
Expected: all tests pass; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: compose app with tabs, wheel, result, and history"
```

---

### Task 13: PWA configuration

**Files:**
- Modify: `vite.config.ts` (add `VitePWA` plugin)
- Create: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/favicon.ico` (placeholder icons acceptable for MVP)

**Interfaces:**
- Consumes: nothing new.
- Produces: an installable, offline-capable PWA build.

**Note:** icons can be simple solid-color placeholders for the MVP. Any 192×192 and 512×512 PNG will satisfy the manifest; polish later.

- [ ] **Step 1: Add the PWA plugin to `vite.config.ts`**

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Terserah! - Cycle Synced Food Decider',
        short_name: 'TerserahApp',
        description: 'Solusi atasi dilema milih makanan yang disesuaikan dengan fase siklus.',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
```

- [ ] **Step 2: Add placeholder icons**

Run (creates simple solid PNGs via ImageMagick if available; otherwise drop any PNGs of the right size into `public/`):
```bash
command -v magick >/dev/null 2>&1 && {
  magick -size 192x192 xc:#1e293b public/pwa-192x192.png
  magick -size 512x512 xc:#1e293b public/pwa-512x512.png
  magick -size 32x32 xc:#1e293b public/favicon.ico
} || echo "Add public/pwa-192x192.png, public/pwa-512x512.png, public/favicon.ico manually"
```
Expected: three icon files exist in `public/`.

- [ ] **Step 3: Build and confirm the service worker is generated**

Run: `pnpm build`
Expected: build succeeds; `dist/sw.js` and `dist/manifest.webmanifest` are emitted.

- [ ] **Step 4: Verify tests still pass**

Run: `pnpm test`
Expected: all tests pass (PWA plugin does not affect Vitest).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure vite-plugin-pwa for offline-first install"
```

---

### Task 14: Manual verification and deploy config

**Files:**
- Create: `vercel.json` (SPA rewrite; use if deploying to Vercel)
- Create: `README.md` (run + deploy instructions)

**Interfaces:**
- Consumes: nothing.
- Produces: deploy configuration and docs. No code interface.

- [ ] **Step 1: Manually verify the app end-to-end**

Run: `pnpm build && pnpm preview`
Then in a browser at the shown localhost URL, confirm:
- Header and 4 phase tabs render; active tab is bold.
- Clicking "PUTAR" spins and reveals a result card with a wellness note and the "bukan saran medis" disclaimer.
- Switching phase clears the result; spinning again never immediately repeats the last result.
- Tapping the Maps CTA opens Google Maps in a new tab AND the history count increments; a repeat result shows the "Sudah pernah" badge.
- DevTools → Application shows a registered service worker and manifest; toggling "Offline" and reloading still loads the app and catalog.

- [ ] **Step 2: Create `vercel.json` (SPA fallback)**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 3: Create `README.md`**

```markdown
# Terserah! — Cycle-Synced Food Decider (PWA)

Mobile-first PWA to break the "terserah" deadlock: spin a wheel for a food
suggestion tailored to a manually-selected menstrual-cycle phase, with a
persisted history and Google Maps deep links.

## Development

```bash
pnpm install
pnpm dev      # start dev server
pnpm test         # run tests
pnpm build    # type-check + production build
pnpm preview  # preview the production build
```

## Data

The catalog lives at `public/data/foods.json`. Every phase must have at least
8 items; `src/data/validateDataset.test.ts` enforces this on every test run.

## Deploy

Static build (`dist/`). Deploy to Vercel or Netlify. `vercel.json` provides the
SPA fallback rewrite. This is not medical advice.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add deploy config and readme"
```

---

## Self-Review Notes

- **Spec coverage:** Positioning/manual phase (Task 8, 12) · soft wellness + disclaimer (Task 2 data, Task 10 UI) · wheel cap-8/re-sample/exclude-last/under-8 (Task 3 logic, Task 9 UI) · React Query async persisted catalog (Task 6) · history via mutation+query saved on Maps CTA (Task 5, 7, 10, 12) · dataset ≥40 with ≥8/phase + validation (Task 2) · Vite/React/TS/Tailwind/PWA/Maps deep link/`max-w-md` layout (Tasks 1, 9, 10, 12, 13) · reserved future fields documented, not built (Task 2 comment). All acceptance criteria map to tasks.
- **Type consistency:** `FoodItem.wellnessNote` used consistently (not `medicalBenefit`); `sampleWheel(items, phase, { excludeId, rng })` signature identical across Tasks 3, 9; `HistoryEntry` shape identical across Tasks 5, 7, 11, 12; `WHEEL_SIZE`/`MIN_PER_PHASE` single source of truth.
- **Out-of-scope guards:** no cycle math, no accounts/sharing, no region/spiciness/veg filtering anywhere in the tasks.
