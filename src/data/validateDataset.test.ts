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
