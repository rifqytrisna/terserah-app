import type { FoodItem } from '../types/food';
import { openGoogleMapsSearch } from '../lib/navigation';

export interface ResultCardProps {
  item: FoodItem;
  seenBefore: boolean;
  onCommit: (item: FoodItem) => void;
}

const TYPE_ICON: Record<FoodItem['type'], string> = {
  makanan: '🍔',
  minuman: '🍷',
};

export default function ResultCard({ item, seenBefore, onCommit }: ResultCardProps) {
  function handleCommit() {
    onCommit(item);
    openGoogleMapsSearch(item.gmapsQuery);
  }

  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-slate-500">🎉 Hasil Putaran</p>
      <p className="mt-1 text-lg font-bold text-slate-900">
        {TYPE_ICON[item.type]} {item.name}
      </p>
      {seenBefore && (
        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
          Sudah pernah
        </span>
      )}
      <p className="mt-2 text-sm text-slate-700">{`🩺 ${item.wellnessNote}`}</p>
      <p className="mt-1 text-[11px] italic text-slate-400">
        Info bersifat umum, bukan saran medis.
      </p>
      <button
        onClick={handleCommit}
        className="mt-3 min-h-[54px] w-full rounded-xl bg-emerald-600 px-4 text-base font-bold text-white"
      >
        {`📍 Cari tempat terdekat di Google Maps`}
      </button>
    </div>
  );
}
