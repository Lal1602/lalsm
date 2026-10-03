import type { ChatAction } from "./actions";

/**
 * Applies the assistant's navigation actions to the live page. Client only.
 * Targets are found by the same ids / data attributes the sections render, and
 * a missing target is ignored — a stale tag from the model must never throw.
 */

/** Fired on window; ProjectsSection answers by opening that project. */
export const OPEN_PROJECT_EVENT = "lalsm:open-project";

const HIGHLIGHT_CLASS = "ai-highlight-active";
const HIGHLIGHT_MS = 3000;

function highlight(el: Element) {
  el.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS);
}

function scrollToSection(id: string): HTMLElement | null {
  const el = document.getElementById(id);
  if (!el) return null;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  highlight(el);
  return el;
}

function findByTitle(selector: string, title: string): Element | undefined {
  const needle = title.toLowerCase();
  return Array.from(document.querySelectorAll(selector)).find((card) =>
    (card.getAttribute("data-title") ?? "").toLowerCase().includes(needle),
  );
}

function runAction(action: ChatAction) {
  switch (action.type) {
    case "scroll":
      scrollToSection(action.sectionId);
      return;

    case "project":
      scrollToSection("projects");
      // The film strip is a WebGL scene with no DOM cards to click, so the
      // projects section listens for this event and opens its own modal.
      window.dispatchEvent(new CustomEvent(OPEN_PROJECT_EVENT, { detail: { title: action.title } }));
      return;

    case "achievement": {
      scrollToSection("achievements");
      const target = findByTitle(".marquee-card", action.title);
      if (!target) return;

      highlight(target);
      const button = target.querySelector<HTMLElement>(".btn-quick-view");
      (button ?? (target as HTMLElement)).click();
      return;
    }
  }
}

export function runChatActions(actions: ChatAction[]) {
  if (typeof window === "undefined") return;
  // Let the reply bubble render before the page starts moving.
  window.setTimeout(() => actions.slice(0, 2).forEach(runAction), 300);
}
