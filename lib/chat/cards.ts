import { achievements } from "@/data/achievements";
import { projects } from "@/data/projects";
import type { ChatAction, SectionId } from "./actions";

/**
 * Cards under a reply: what the assistant pointed at, as something to look at and click, built from the real
 * archive (a project's picture and tech, a certificate's title and kind), not from the model's words. A card is
 * made only for a thing that exists; a stale tag from the model makes none.
 */

export type ChatCard =
  | { kind: "project"; title: string; tech: string[]; image: string; link: string }
  | { kind: "achievement"; title: string; meta: string; image: string }
  | { kind: "cv" }
  | { kind: "section"; id: SectionId };

export const MAX_CARDS = 3;

export function findProject(title: string) {
  const needle = title.trim().toLowerCase();
  if (!needle) return undefined;
  return (
    projects.find((p) => p.title.toLowerCase() === needle) ??
    projects.find((p) => p.title.toLowerCase().includes(needle) || needle.includes(p.title.toLowerCase()))
  );
}

export function findAchievement(title: string) {
  const needle = title.trim().toLowerCase();
  if (!needle) return undefined;
  return (
    achievements.find((a) => a.title.toLowerCase() === needle) ??
    achievements.find((a) => a.title.toLowerCase().includes(needle) || needle.includes(a.title.toLowerCase()))
  );
}

export function projectCard(title: string): ChatCard | null {
  const p = findProject(title);
  return p
    ? {
        kind: "project",
        title: p.title,
        tech: p.tech
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 4),
        image: p.image,
        link: p.link,
      }
    : null;
}

export function achievementCard(title: string): ChatCard | null {
  const a = findAchievement(title);
  return a ? { kind: "achievement", title: a.title, meta: a.meta, image: a.image } : null;
}

export function cardsFromActions(actions: ChatAction[]): ChatCard[] {
  const cards: ChatCard[] = [];
  const seen = new Set<string>();
  const add = (card: ChatCard | null) => {
    if (!card) return;
    const key = card.kind === "project" || card.kind === "achievement" ? `${card.kind}:${card.title}` : card.kind === "section" ? `section:${card.id}` : "cv";
    if (seen.has(key)) return;
    seen.add(key);
    cards.push(card);
  };

  // What was named comes first; a section is the fallback, and not worth a card when a thing in it already has one.
  const named = actions.filter((a) => a.type !== "scroll");
  for (const action of named) {
    if (action.type === "project") add(projectCard(action.title));
    else if (action.type === "achievement") add(achievementCard(action.title));
    else if (action.type === "cv") add({ kind: "cv" });
  }
  if (cards.length === 0) {
    for (const action of actions) if (action.type === "scroll" && action.sectionId !== "home") add({ kind: "section", id: action.sectionId });
  }
  return cards.slice(0, MAX_CARDS);
}
