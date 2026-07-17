export function buildMapsUrl(query: string): string {
  const encoded = encodeURIComponent(query.trim());
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export function openGoogleMapsSearch(query: string): void {
  window.open(buildMapsUrl(query), '_blank', 'noopener,noreferrer');
}
