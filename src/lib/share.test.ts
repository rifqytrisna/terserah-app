import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildShareText, shareResult } from './share';
import type { FoodItem, MenstrualPhase } from '../types/food';

const item: FoodItem = {
  id: 'kunyit-asam',
  name: 'Kunyit Asam',
  type: 'minuman',
  phases: ['menstruasi'],
  wellnessNote: 'Kunyit dipercaya membantu redakan nyeri haid.',
  gmapsQuery: 'kunyit asam terdekat',
};

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=kunyit%20asam%20terdekat';

afterEach(() => {
  // Remove any stubbed navigator.share between tests.
  delete (navigator as { share?: unknown }).share;
  vi.restoreAllMocks();
});

function stubShare(impl: (data: ShareData) => Promise<void>) {
  const fn = vi.fn(impl);
  Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: fn });
  return fn;
}

describe('buildShareText', () => {
  const cases: Array<[MenstrualPhase, string]> = [
    ['menstruasi', 'Menstruasi'],
    ['folikular', 'Folikular'],
    ['ovulasi', 'Ovulasi'],
    ['luteal', 'Luteal'],
  ];

  it.each(cases)('for %s: bolds the food + phase and includes the maps url', (phase, label) => {
    const text = buildShareText(item, phase);
    expect(text).toContain('*Kunyit Asam*');
    expect(text).toContain(`*${label}*`);
    expect(text).toContain(MAPS_URL);
  });

  it('produces the exact menstruasi copy', () => {
    expect(buildShareText(item, 'menstruasi')).toBe(
      `Hasil Roda Takdir hari ini: kita wajib beli *Kunyit Asam* buat nemenin fase *Menstruasi* kamu! 🩸🤗\n\nYuk cus, ini lokasinya: ${MAPS_URL}`
    );
  });
});

describe('shareResult', () => {
  it('uses navigator.share when available and does not open a window', async () => {
    const shareFn = stubShare(() => Promise.resolve());
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await shareResult(item, 'menstruasi');

    expect(shareFn).toHaveBeenCalledTimes(1);
    expect(shareFn.mock.calls[0][0]).toMatchObject({ text: buildShareText(item, 'menstruasi') });
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('falls back to a WhatsApp window when navigator.share is absent', async () => {
    // navigator.share is undefined here (cleaned up in afterEach)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await shareResult(item, 'menstruasi');

    const expectedUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      buildShareText(item, 'menstruasi')
    )}`;
    expect(openSpy).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
  });

  it('resolves without throwing when the user cancels the native share', async () => {
    stubShare(() => Promise.reject(Object.assign(new Error('cancelled'), { name: 'AbortError' })));
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await expect(shareResult(item, 'menstruasi')).resolves.toBeUndefined();
    expect(openSpy).not.toHaveBeenCalled();
  });
});
