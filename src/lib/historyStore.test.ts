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
