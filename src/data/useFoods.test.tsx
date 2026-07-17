import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFoods } from './useFoods';
import type { ReactNode } from 'react';

const sample = [
  {
    id: 'x',
    name: 'X',
    type: 'makanan',
    phases: ['menstruasi'],
    wellnessNote: 'n',
    gmapsQuery: 'q',
  },
];

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => sample }) as Response)
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('useFoods', () => {
  it('fetches and returns the catalog', async () => {
    const { result } = renderHook(() => useFoods(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sample);
    expect(fetch).toHaveBeenCalledWith('/data/foods.json');
  });
});
