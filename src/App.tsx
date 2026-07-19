import { useState } from 'react';
import { useFoods } from './data/useFoods';
import { useHistory } from './data/useHistory';
import PhaseTabs from './components/PhaseTabs';
import SpinnerWheel from './components/SpinnerWheel';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import type { FoodItem, MenstrualPhase } from './types/food';

export default function App() {
  const { data: foods, isLoading, isError } = useFoods();
  const { entries, addToHistory } = useHistory();
  const [phase, setPhase] = useState<MenstrualPhase>('menstruasi');
  const [result, setResult] = useState<FoodItem | null>(null);

  function handlePhaseChange(next: MenstrualPhase) {
    setPhase(next);
    setResult(null);
  }

  function handleCommit(item: FoodItem) {
    addToHistory({ id: item.id, name: item.name, phase, timestamp: Date.now() });
  }

  const seenBefore = result ? entries.some((e) => e.id === result.id) : false;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🍔 TERSERAH!</h1>
      </header>

      <section>
        <p className="mb-2 text-sm font-semibold text-slate-700">🩸 Pilih fase siklus hari ini:</p>
        <PhaseTabs active={phase} onChange={handlePhaseChange} />
      </section>

      {isLoading && <p className="text-center text-sm text-slate-500">Memuat menu…</p>}
      {isError && (
        <p className="text-center text-sm text-red-500">Gagal memuat menu. Coba lagi nanti.</p>
      )}

      {foods && (
        <SpinnerWheel items={foods} phase={phase} lastResultId={result?.id} onResult={setResult} />
      )}

      {result && (
        <ResultCard item={result} phase={phase} seenBefore={seenBefore} onCommit={handleCommit} />
      )}

      <HistoryList entries={entries} />
    </div>
  );
}
