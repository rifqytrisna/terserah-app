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
    const items: FoodItem[] = [...makeItems(3, 'menstruasi'), ...makeItems(2, 'luteal')];
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
