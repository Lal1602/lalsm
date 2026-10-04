/**
 * Where an element's centre is in the hero, from layout alone. getBoundingClientRect includes every
 * transform on the way (the entrance holds parts off their place, the pointer system lifts them, the
 * scroll-out moves them), and the things that are placed from another element's position (the rings,
 * the wave of light) need where it rests. So the offsets are summed up the offsetParent chain, which
 * ignores transforms.
 */
export function layoutCentre(el: HTMLElement, root: HTMLElement): { x: number; y: number } {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}
