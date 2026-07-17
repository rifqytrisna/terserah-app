import type { MenstrualPhase } from '../types/food';

export interface HistoryEntry {
  id: string;
  name: string;
  phase: MenstrualPhase;
  timestamp: number;
}

export const HISTORY_KEY = 'terserah:history';
export const HISTORY_LIMIT = 20;

export function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...readHistory()].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
