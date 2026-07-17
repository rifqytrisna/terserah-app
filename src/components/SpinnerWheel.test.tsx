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
