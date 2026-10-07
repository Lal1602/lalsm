"use client";

import { useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";

/**
 * The CV chooser is one dialog (components/ui/CvChooser.tsx, mounted once) opened from many handles: the nav, the hero,
 * the edge tab, the contact section, the career slide. They are not descendants of one component, so the request to
 * open it travels through this tiny store instead of a provider.
 *
 * `seq` counts open requests (the dialog opens when it changes); `open` is what the dialog reports back, so the
 * handles and the tab can show that it is open; `source` says which handle asked.
 */

export interface ChooserState {
  seq: number;
  open: boolean;
  source: string;
}

const INITIAL: ChooserState = { seq: 0, open: false, source: "" };

let state = INITIAL;
let returnTo: HTMLElement | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Asks for the chooser. A request while it is already open is ignored. `from` gets the focus back when it closes. */
export function openCvChooser(source: string, from?: HTMLElement | null): void {
  if (state.open) return;
  returnTo = from ?? (typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null));
  state = { seq: state.seq + 1, open: true, source };
  track("cv_chooser_open", { source });
  emit();
}

/** The dialog tells the store when it is on screen and when it is gone. */
export function reportCvChooserOpen(open: boolean): void {
  if (state.open === open) return;
  state = { ...state, open };
  emit();
}

/** The element that opened the chooser, once: the dialog gives it the focus back. */
export function takeCvChooserReturn(): HTMLElement | null {
  const target = returnTo;
  returnTo = null;
  return target;
}

export function useCvChooser(): ChooserState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}

/** For tests: back to a closed chooser with no requests. */
export function resetCvChooser(): void {
  state = INITIAL;
  returnTo = null;
  emit();
}
