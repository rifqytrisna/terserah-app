import { useEffect, useRef, useState } from 'react';
import type { FoodItem, MenstrualPhase } from '../types/food';
import { sampleWheel } from '../lib/sampleWheel';

const SPIN_MS = 3500;

// Fixed rainbow palette assigned by slice position (not by food item), so the
// wheel always reads as colorful regardless of which items are sampled.
const WHEEL_COLORS = [
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
];

function buildWedgeGradient(count: number): string {
  if (count === 0) return 'none';
  const sliceDeg = 360 / count;
  const gapDeg = count > 1 ? Math.min(2, sliceDeg * 0.08) : 0;
  const stops = Array.from({ length: count }, (_, i) => {
    const start = i * sliceDeg + gapDeg / 2;
    const end = (i + 1) * sliceDeg - gapDeg / 2;
    return `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export interface SpinnerWheelProps {
  items: FoodItem[];
  phase: MenstrualPhase;
  lastResultId?: string;
  onResult: (item: FoodItem) => void;
}

export default function SpinnerWheel({ items, phase, lastResultId, onResult }: SpinnerWheelProps) {
  // Seed with a preview sample so the wheel shows real colored wedges on
  // first paint instead of a blank disc before the user's first spin.
  const [segments, setSegments] = useState<FoodItem[]>(() => sampleWheel(items, phase));
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  // Refresh the preview wheel when the selected phase changes, computed
  // during render rather than in an effect (avoids the extra cascading
  // render effects cause): https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [sampledPhase, setSampledPhase] = useState(phase);
  if (phase !== sampledPhase) {
    setSampledPhase(phase);
    if (!isSpinning) {
      setSegments(sampleWheel(items, phase));
    }
  }

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    },
    []
  );

  function handleSpin() {
    if (isSpinning) return;
    const wheel = sampleWheel(items, phase, { excludeId: lastResultId });
    if (wheel.length === 0) return;

    const winnerIndex = Math.floor(Math.random() * wheel.length);
    const sliceDeg = 360 / wheel.length;
    // Land the winner slice under the top pointer, after several full turns
    // forward from the current rotation (never backward).
    const alignment = -(winnerIndex * sliceDeg + sliceDeg / 2);
    const currentTurns = Math.floor(rotation / 360);
    const target = (currentTurns + 5) * 360 + alignment;

    setSegments(wheel);
    setRotation(target);
    setIsSpinning(true);

    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      onResult(wheel[winnerIndex]);
      timeoutRef.current = null;
    }, SPIN_MS);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div aria-hidden={segments.length === 0} className="relative aspect-square w-full max-w-xs">
        {/* Pointer: fixed, does not rotate with the wheel */}
        <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="h-3 w-8 rounded-full bg-white shadow" />
          <span className="-mt-0.5 h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-slate-900" />
        </div>

        {/* Static white outer ring */}
        <div className="absolute inset-0 rounded-full bg-white shadow-[0_12px_28px_-8px_rgba(15,23,42,0.35)]" />

        {/* Rotating colored disc */}
        <div
          className="absolute inset-2 overflow-hidden rounded-full"
          style={{
            backgroundImage: buildWedgeGradient(segments.length),
            backgroundColor: 'white',
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? `transform ${SPIN_MS}ms cubic-bezier(0.1,0.7,0.1,1)` : 'none',
          }}
        >
          {segments.map((item, i) => {
            const sliceDeg = 360 / segments.length;
            const bisector = i * sliceDeg + sliceDeg / 2;
            return (
              <span
                key={item.id}
                data-testid="wheel-segment"
                className="absolute left-1/2 top-1/2 max-w-[70px] truncate text-[10px] font-bold text-white"
                style={{
                  transform: `translate(-50%, -50%) rotate(${bisector}deg) translateY(-105px)`,
                }}
              >
                {item.name}
              </span>
            );
          })}
        </div>

        {/* Static center hub, on top of the rotating disc */}
        <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-2xl shadow">
          ⭐
        </div>
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
