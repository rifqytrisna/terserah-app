import { useState } from 'react';
import type { FoodItem, MenstrualPhase } from '../types/food';
import { sampleWheel } from '../lib/sampleWheel';

const SPIN_MS = 3500;

export interface SpinnerWheelProps {
  items: FoodItem[];
  phase: MenstrualPhase;
  lastResultId?: string;
  onResult: (item: FoodItem) => void;
}

export default function SpinnerWheel({ items, phase, lastResultId, onResult }: SpinnerWheelProps) {
  const [segments, setSegments] = useState<FoodItem[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  function handleSpin() {
    if (isSpinning) return;
    const wheel = sampleWheel(items, phase, { excludeId: lastResultId });
    if (wheel.length === 0) return;

    const winnerIndex = Math.floor(Math.random() * wheel.length);
    const sliceDeg = 360 / wheel.length;
    // Land the winner slice under the top pointer, after several full turns.
    const target = 360 * 5 - (winnerIndex * sliceDeg + sliceDeg / 2);

    setSegments(wheel);
    setRotation(target);
    setIsSpinning(true);

    window.setTimeout(() => {
      setIsSpinning(false);
      onResult(wheel[winnerIndex]);
    }, SPIN_MS);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        aria-hidden={segments.length === 0}
        className="relative aspect-square w-full max-w-xs rounded-full border-4 border-slate-800"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? `transform ${SPIN_MS}ms cubic-bezier(0.1,0.7,0.1,1)` : 'none',
        }}
      >
        {segments.map((item, i) => {
          const sliceDeg = 360 / segments.length;
          return (
            <span
              key={item.id}
              data-testid="wheel-segment"
              className="absolute left-1/2 top-1/2 origin-left text-[10px] font-semibold text-slate-700"
              style={{ transform: `rotate(${i * sliceDeg}deg) translateX(8px)` }}
            >
              {item.name}
            </span>
          );
        })}
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="min-h-[54px] w-full rounded-xl bg-slate-800 px-4 text-base font-bold text-white disabled:opacity-60"
      >
        🔄 {isSpinning ? 'Memutar…' : 'PUTAR RODA KEBERUNTUNGAN'}
      </button>
    </div>
  );
}
