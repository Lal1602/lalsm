/**
 * Small pure formatters for the hero ledger, kept out of the component so they can be tested.
 */

/** 7.2756 south of the equator -> "7.2756°S". Four decimals is about 11 metres, which is plenty for a city. */
export function formatCoord(degrees: number, positive: string, negative: string, decimals = 4): string {
  if (!Number.isFinite(degrees)) return "";
  const hemisphere = degrees < 0 ? negative : positive;
  return `${Math.abs(degrees).toFixed(decimals)}°${hemisphere}`;
}

export const formatLat = (lat: number) => formatCoord(lat, "N", "S");
export const formatLon = (lon: number) => formatCoord(lon, "E", "W");
