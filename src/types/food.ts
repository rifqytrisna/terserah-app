export type MenstrualPhase = 'menstruasi' | 'folikular' | 'ovulasi' | 'luteal';
export type ItemType = 'makanan' | 'minuman';

export interface FoodItem {
  id: string;
  name: string;
  type: ItemType;
  phases: MenstrualPhase[];
  wellnessNote: string;
  gmapsQuery: string;
}

export const PHASES: readonly MenstrualPhase[] = [
  'menstruasi',
  'folikular',
  'ovulasi',
  'luteal',
] as const;

export const PHASE_LABELS: Record<MenstrualPhase, string> = {
  menstruasi: 'Menstruasi',
  folikular: 'Folikular',
  ovulasi: 'Ovulasi',
  luteal: 'Luteal',
};

export const MIN_PER_PHASE = 8;
