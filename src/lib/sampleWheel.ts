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
