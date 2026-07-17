import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // static catalog; never goes stale within a session
      gcTime: 1000 * 60 * 60 * 24 * 7, // keep in cache 7 days for persistence
      retry: 1,
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'terserah:query-cache',
});
