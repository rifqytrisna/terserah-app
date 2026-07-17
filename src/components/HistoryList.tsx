import { PHASE_LABELS } from '../types/food';
import type { HistoryEntry } from '../lib/historyStore';

export interface HistoryListProps {
  entries: HistoryEntry[];
}

export default function HistoryList({ entries }: HistoryListProps) {
  return (
    <details className="mt-6 rounded-xl bg-slate-50 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
        📜 Riwayat Pilihan ({entries.length})
      </summary>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">Belum ada pilihan yang tersimpan.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {entries.map((entry) => (
            <li
              key={`${entry.id}-${entry.timestamp}`}
              className="flex items-center justify-between text-sm text-slate-700"
            >
              <span>{entry.name}</span>
              <span className="text-xs text-slate-400">{PHASE_LABELS[entry.phase]}</span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
