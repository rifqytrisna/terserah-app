import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildMapsUrl, openGoogleMapsSearch } from './navigation';

describe('buildMapsUrl', () => {
  it('builds a Maps search URL with encoded query', () => {
    expect(buildMapsUrl('soto ayam terdekat')).toBe(
      'https://www.google.com/maps/search/?api=1&query=soto%20ayam%20terdekat'
    );
  });

  it('encodes special characters', () => {
    expect(buildMapsUrl('nasi & mie')).toContain('nasi%20%26%20mie');
  });
});

describe('openGoogleMapsSearch', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens the built URL in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    openGoogleMapsSearch('bakso terdekat');
    expect(openSpy).toHaveBeenCalledWith(
      buildMapsUrl('bakso terdekat'),
      '_blank',
      'noopener,noreferrer'
    );
  });
});
