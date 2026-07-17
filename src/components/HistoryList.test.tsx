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
