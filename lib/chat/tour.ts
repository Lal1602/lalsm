import { cv } from "@/data/cv";
import { achievements } from "@/data/achievements";
import { projects } from "@/data/projects";
import type { SectionId } from "./actions";
import type { ChatLang } from "./copy";
import { sectionLabel } from "./context";

/**
 * The tour: the assistant walks the visitor down the page, one stop at a time. Each stop scrolls to a section and says
 * one true thing about it, taken from the same data the section is made of. It is scripted (no model, no waiting), and
 * the visitor sets the pace with the chip under each stop.
 */

export interface TourStop {
  section: SectionId;
  text: string;
  /** A stop may offer the CV (the last one does). */
  cv?: boolean;
}

export function tourStops(lang: ChatLang): TourStop[] {
  const en = lang === "en";
  const skills = cv[lang].skills.length;
  const certs = achievements.length;
  return [
    {
      section: "about",
      text: en
        ? "**What I Build.** Three plates, one per discipline: frontend, backend and devops, mobile and game. Point at a tool and it lights up in the legend, with how many projects of the archive use it."
        : "**What I Build.** Tiga pelat, satu per bidang: frontend, backend & devops, mobile & game. Arahkan ke sebuah tool dan legenda menyala, lengkap dengan berapa proyek di arsip yang memakainya.",
    },
    {
      section: "workflow",
      text: en
        ? "**How I Work.** Four stages on a route map. Scroll to fly the ship, drag the map to scrub, hold a bay's button to engage it."
        : "**How I Work.** Empat tahap di peta rute. Scroll untuk menerbangkan kapal, seret peta untuk menggeser, tahan tombol sebuah bay untuk mengaktifkannya.",
    },
    {
      section: "projects",
      text: en
        ? `**Projects.** ${projects.length} plates in one draw call. Drag the rail, use the arrow keys, or click a plate to open its record.`
        : `**Projects.** ${projects.length} pelat dalam satu draw call. Seret rail, pakai tombol panah, atau klik sebuah pelat untuk membuka catatannya.`,
    },
    {
      section: "achievements",
      text: en
        ? `**Achievements.** ${certs} certificates and awards, from the LKS web competition and the BNSP certification to TOEIC 610 and the Timedoor courses. Open any card for the certificate itself.`
        : `**Achievements.** ${certs} sertifikat dan penghargaan, dari lomba LKS web dan sertifikasi BNSP sampai TOEIC 610 dan kursus Timedoor. Buka kartu mana pun untuk melihat sertifikatnya.`,
    },
    {
      section: "contact",
      text: en
        ? `**Contact.** The Uplink form, the e-mail and the socials. And if you came for the paper: the CV is in English and Indonesian, ${skills} groups of skills on two pages.`
        : `**Contact.** Form Uplink, email, dan sosial media. Dan kalau kamu datang untuk berkasnya: CV tersedia dalam bahasa Indonesia dan Inggris, ${skills} kelompok keahlian dalam dua halaman.`,
      cv: true,
    },
  ];
}

export const TOUR_LENGTH = tourStops("en").length;

export interface TourStep {
  stop: TourStop;
  index: number;
  last: boolean;
  title: string;
  /** Chips under the stop: [label, command]. */
  chips: { label: string; command: string }[];
}

/** Stop `index` (0-based), with the chips that go with it. */
export function tourStep(index: number, lang: ChatLang): TourStep | null {
  const stops = tourStops(lang);
  const stop = stops[index];
  if (!stop) return null;
  const last = index === stops.length - 1;
  const en = lang === "en";
  const title = `${index + 1} / ${stops.length} · ${sectionLabel(stop.section, lang)}`;
  const chips = last
    ? [
        { label: en ? "Download the CV" : "Unduh CV", command: "/cv" },
        { label: en ? "End the tour" : "Selesai", command: "/tour stop" },
      ]
    : [
        { label: en ? "Next stop →" : "Pemberhentian berikut →", command: "/tour next" },
        { label: en ? "End the tour" : "Selesai", command: "/tour stop" },
      ];
  return { stop, index, last, title, chips };
}
