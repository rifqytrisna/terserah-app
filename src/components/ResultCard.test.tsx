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
    expect(screen.getByText(/Soto Ayam/)).toBeInTheDocument();
    expect(screen.getByText(/Kaldu hangat/)).toBeInTheDocument();
    expect(screen.getByText(/bukan saran medis/i)).toBeInTheDocument();
  });

  it('shows the food icon for makanan and the drink icon for minuman', () => {
    const { rerender } = render(
      <ResultCard item={item} seenBefore={false} onCommit={() => {}} />
    );
    expect(screen.getByText(/🍔/)).toBeInTheDocument();

    rerender(
      <ResultCard item={{ ...item, type: 'minuman' }} seenBefore={false} onCommit={() => {}} />
    );
    expect(screen.getByText(/🍷/)).toBeInTheDocument();
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
