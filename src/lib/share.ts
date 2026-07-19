import type { FoodItem, MenstrualPhase } from '../types/food';
import { buildMapsUrl } from './navigation';

export const PHASE_SHARE_MESSAGE: Record<
  MenstrualPhase,
  (food: string, mapsUrl: string) => string
> = {
  menstruasi: (food, mapsUrl) =>
    `Hasil Roda Takdir hari ini: kita wajib beli *${food}* buat nemenin fase *Menstruasi* kamu! 🩸🤗\n\nYuk cus, ini lokasinya: ${mapsUrl}`,
  folikular: (food, mapsUrl) =>
    `Roda Takdir udah milih *${food}* buat ngedukung energi fase *Folikular* kamu! 🌱✨\n\nGas berangkat, ini lokasinya: ${mapsUrl}`,
  ovulasi: (food, mapsUrl) =>
    `Fase *Ovulasi* lagi peak nih! Roda Takdir milih *${food}* buat kita berdua. 🔥💃\n\nAyo jemput, ini lokasinya: ${mapsUrl}`,
  luteal: (food, mapsUrl) =>
    `Craving fase *Luteal* datang~ Roda Takdir bilang kita harus makan *${food}*! 🌙🍫\n\nCabut yuk, ini lokasinya: ${mapsUrl}`,
};

export function buildShareText(item: FoodItem, phase: MenstrualPhase): string {
  const mapsUrl = buildMapsUrl(item.gmapsQuery);
  return PHASE_SHARE_MESSAGE[phase](item.name, mapsUrl);
}

export async function shareResult(item: FoodItem, phase: MenstrualPhase): Promise<void> {
  const text = buildShareText(item, phase);

  // Always open the WhatsApp deep link directly rather than trying navigator.share
  // first: on desktop (macOS/Windows), the native share sheet never lists WhatsApp
  // Desktop as a target (it doesn't register as an OS share extension), so routing
  // through navigator.share there silently produces a share sheet without the one
  // app users actually want. Going straight to WhatsApp works consistently on both
  // desktop and mobile.
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
