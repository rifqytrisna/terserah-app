import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHistory } from './useHistory';
import type { ReactNode } from 'react';

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => localStorage.clear());

describe('useHistory', () => {
  it('starts empty and records an added entry', async () => {
    const { result } = renderHook(() => useHistory(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.entries).toEqual([]));

    act(() => {
      result.current.addToHistory({ id: 'a', name: 'A', phase: 'menstruasi', timestamp: 1 });
    });

    await waitFor(() => expect(result.current.entries.map((e) => e.id)).toEqual(['a']));
  });
});
