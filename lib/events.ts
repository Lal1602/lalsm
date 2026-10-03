/**
 * Window events used between sections that otherwise know nothing about each
 * other. Plain DOM events keep the sections decoupled and survive the dynamic
 * (ssr: false) imports in ClientShell.
 */

/** detail: { message: string } — fills the contact form's message field. */
export const PREFILL_CONTACT_EVENT = "lalsm:prefill-contact";

export interface PrefillContactDetail {
  message: string;
}
