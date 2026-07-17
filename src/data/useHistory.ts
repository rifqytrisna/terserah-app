import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readHistory, appendHistory, type HistoryEntry } from '../lib/historyStore';

export const HISTORY_QUERY_KEY = ['history'] as const;

export function useHistory(): {
  entries: HistoryEntry[];
  addToHistory: (entry: HistoryEntry) => void;
} {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: async () => readHistory(),
    initialData: readHistory,
  });

  const mutation = useMutation({
    mutationFn: async (entry: HistoryEntry) => appendHistory(entry),
    onSuccess: (next) => {
      queryClient.setQueryData(HISTORY_QUERY_KEY, next);
    },
  });

  return {
    entries: data ?? [],
    addToHistory: (entry) => mutation.mutate(entry),
  };
}
