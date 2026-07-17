import { PHASES, PHASE_LABELS, type MenstrualPhase } from '../types/food';

export interface PhaseTabsProps {
  active: MenstrualPhase;
  onChange: (phase: MenstrualPhase) => void;
}

export default function PhaseTabs({ active, onChange }: PhaseTabsProps) {
  return (
    <div role="tablist" aria-label="Fase siklus" className="grid grid-cols-4 gap-1">
      {PHASES.map((phase) => {
        const selected = phase === active;
        return (
          <button
            key={phase}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(phase)}
            className={
              'rounded-md px-2 py-2 text-xs transition ' +
              (selected ? 'bg-slate-800 font-bold text-white' : 'bg-slate-100 text-slate-600')
            }
          >
            {PHASE_LABELS[phase]}
          </button>
        );
      })}
    </div>
  );
}
