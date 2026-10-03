/**
 * Parsing for the [ACTION:...] tags the assistant embeds in its replies.
 * Pure string work — the DOM side effects live in runActions.ts so this file
 * stays easy to test.
 */

export const SECTION_IDS = ["home", "about", "projects", "achievements", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type ChatAction =
  | { type: "scroll"; sectionId: SectionId }
  | { type: "project"; title: string }
  | { type: "achievement"; title: string };

const TAG = /\[ACTION:([A-Z_]+):([^\]]*)\]/gi;
/** A tag that has started but whose closing bracket has not streamed in yet. */
const DANGLING_TAG = /\[ACTION:[^\]]*$/i;
/** Even just "[ACT" at the very end could be the start of a tag. */
const TAG_PREFIX = /\[(?:A(?:C(?:T(?:I(?:O(?:N)?)?)?)?)?)?$/i;

function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export interface ExtractedActions {
  /** Reply text with every action tag removed. */
  text: string;
  actions: ChatAction[];
}

export function extractActions(reply: string): ExtractedActions {
  const actions: ChatAction[] = [];

  const text = reply
    .replace(TAG, (_match, kind: string, rawArg: string) => {
      const arg = rawArg.trim();
      switch (kind.toUpperCase()) {
        case "SCROLL_AND_HIGHLIGHT": {
          const id = arg.toLowerCase();
          if (isSectionId(id)) actions.push({ type: "scroll", sectionId: id });
          break;
        }
        case "OPEN_PROJECT":
          if (arg) actions.push({ type: "project", title: arg });
          break;
        case "OPEN_ACHIEVEMENT":
          if (arg) actions.push({ type: "achievement", title: arg });
          break;
      }
      return "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return { text, actions };
}

/**
 * For text that is still streaming in: hides complete tags and also any tag
 * that is only half-received, so the visitor never sees "[ACTION:SCRO" flash by.
 */
export function stripActionTagsForDisplay(partial: string): string {
  return partial
    .replace(TAG, "")
    .replace(DANGLING_TAG, "")
    .replace(TAG_PREFIX, "")
    .replace(/[ \t]+$/, "");
}
