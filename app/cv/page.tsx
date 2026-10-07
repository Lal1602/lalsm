import type { Metadata } from "next";
import CvSheet from "@/components/site/CvSheet";
import { cvPath } from "@/data/cv";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description: `${profile.name} — ${profile.role}. Education, experience, projects, skills and certifications.`,
  alternates: { canonical: cvPath("en"), languages: { en: cvPath("en"), id: cvPath("id") } },
};

export default function CvPage() {
  return <CvSheet lang="en" />;
}
