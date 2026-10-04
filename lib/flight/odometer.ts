/**
 * Where a wheel of an odometer sits (in digit units, 0..10) for a value `n`.
 *
 * The last place rolls continuously. Every higher place holds its digit and only
 * moves while the wheel directly below it is carrying (that wheel's own position
 * passing 9 on its way to 10), so 39 -> 40 turns the tens and ones together, 99 -> 100
 * turns all three, and 41 -> 42 turns only the last, exactly like the mechanical
 * thing. At a whole number every wheel rests precisely on a digit.
 */
export function rollPosition(n: number, place: number): number {
  const v = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (place <= 1) return v % 10;
  const digit = Math.floor(v / place) % 10;
  // The wheel underneath, including whatever carry it is itself passing up.
  const below = rollPosition(v, place / 10);
  return digit + Math.max(0, below - 9);
}
