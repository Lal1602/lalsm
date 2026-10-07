import type { Metadata } from "next";
import CvSheet from "@/components/site/CvSheet";
import { cvPath } from "@/data/cv";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Curriculum Vitae (Bahasa Indonesia)",
  description: `${profile.name} — ${profile.role}. Pendidikan, pengalaman, proyek, keahlian, dan sertifikasi.`,
  alternates: { canonical: cvPath("id"), languages: { en: cvPath("en"), id: cvPath("id") } },
};

export default function CvIdPage() {
  return <CvSheet lang="id" />;
}
