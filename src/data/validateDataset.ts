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
