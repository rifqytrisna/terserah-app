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
