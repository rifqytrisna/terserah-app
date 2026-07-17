import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SpinnerWheel from './SpinnerWheel';
import type { FoodItem, MenstrualPhase } from '../types/food';

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

function makeItem(id: string, phase: MenstrualPhase): FoodItem {
  return {
    id,
    name: id,
    type: 'makanan',
    phases: [phase],
    wellnessNote: 'note',
    gmapsQuery: 'q',
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => {
  act(() => {
    vi.runOnlyPendingTimers();
  });
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('SpinnerWheel', () => {
  it('renders a preview wheel immediately on mount, before any spin', () => {
    render(<SpinnerWheel items={makeItems(20)} phase="menstruasi" onResult={vi.fn()} />);
    const segments = screen.getAllByTestId('wheel-segment');
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.length).toBeLessThanOrEqual(8);
  });

  it('resamples the preview wheel when the phase prop changes', () => {
    const items = [
      ...Array.from({ length: 3 }, (_, i) => makeItem(`m-${i}`, 'menstruasi')),
      ...Array.from({ length: 3 }, (_, i) => makeItem(`f-${i}`, 'folikular')),
    ];
    const { rerender } = render(
      <SpinnerWheel items={items} phase="menstruasi" onResult={vi.fn()} />
    );
    let names = screen.getAllByTestId('wheel-segment').map((el) => el.textContent);
    expect(names.every((n) => n?.startsWith('m-'))).toBe(true);

    rerender(<SpinnerWheel items={items} phase="folikular" onResult={vi.fn()} />);
    names = screen.getAllByTestId('wheel-segment').map((el) => el.textContent);
    expect(names.every((n) => n?.startsWith('f-'))).toBe(true);
  });

  it('does not resample the wheel mid-spin if the phase prop changes', () => {
    const items = [
      ...Array.from({ length: 3 }, (_, i) => makeItem(`m-${i}`, 'menstruasi')),
      ...Array.from({ length: 3 }, (_, i) => makeItem(`f-${i}`, 'folikular')),
    ];
    const onResult = vi.fn();
    const { rerender } = render(
      <SpinnerWheel items={items} phase="menstruasi" onResult={onResult} />
    );

    act(() => {
      screen.getByRole('button', { name: /putar/i }).click();
    });
    const spinningNames = screen.getAllByTestId('wheel-segment').map((el) => el.textContent);
    expect(spinningNames.every((n) => n?.startsWith('m-'))).toBe(true);

    rerender(<SpinnerWheel items={items} phase="folikular" onResult={onResult} />);
    const namesDuringSpin = screen.getAllByTestId('wheel-segment').map((el) => el.textContent);
    expect(namesDuringSpin).toEqual(spinningNames);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
  });

  it('renders at most WHEEL_SIZE segments after spinning', () => {
    const onResult = vi.fn();
    render(<SpinnerWheel items={makeItems(20)} phase="menstruasi" onResult={onResult} />);
    act(() => {
      screen.getByRole('button', { name: /putar/i }).click();
    });
    expect(screen.getAllByTestId('wheel-segment').length).toBeLessThanOrEqual(8);
  });

  it('calls onResult with a sampled item after the animation', () => {
    const onResult = vi.fn();
    render(<SpinnerWheel items={makeItems(10)} phase="menstruasi" onResult={onResult} />);
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
