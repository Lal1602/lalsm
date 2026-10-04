/**
 * Personal facts that more than one place needs: the footer, the CV, the SEO
 * JSON-LD, the AI assistant's mailto hand-off. Edit here, not in the components.
 */

export const profile = {
  name: "Bilal Sanayu Majid",
  shortName: "Bilal",
  role: "Creative Developer & Full Stack Web Developer",
  location: "Surabaya, Indonesia",
  /** PENS Surabaya. The hero ledger and the Horizon manifest both show these. */
  coordinates: { lat: -7.2756, lon: 112.7937 },
  email: "bilal.lalsm@gmail.com",
  github: "https://github.com/Lal1602",
  instagram: "https://www.instagram.com/chocolal_s/",
  discord: "https://discordapp.com/users/535780117792817152",
  summary:
    "Informatics student and creative developer who builds immersive, performance-minded web experiences with Next.js, Three.js and GSAP, and ships full-stack products with Node.js and Laravel.",
} as const;

export interface TimelineItem {
  year: string;
  role: string;
  institution: string;
  desc: string;
  badge: string;
}

/** Ordered OLDEST → NEWEST. The career slide animates in this order. */
export const timeline: TimelineItem[] = [
  {
    year: "2023 – 2024",
    role: "Game & Android Graduate",
    institution: "Timedoor Academy",
    desc: "Completed advanced training in JavaScript game development (Phaser 3) and mobile app development (Android Studio).",
    badge: "Academy Graduate",
  },
  {
    year: "2024",
    role: "Certified Junior Programmer",
    institution: "BNSP Indonesia",
    desc: "National competency certificate validating expertise in programming, databases, and software design standards.",
    badge: "National Cert",
  },
  {
    year: "2024",
    role: "Juara Harapan 2 — Web Tech",
    institution: "LKS Competition Surabaya",
    desc: "Won 2nd Runner-up Merit Prize at city level in Web Technologies, building modular frontends under competitive time constraints.",
    badge: "Competition",
  },
  {
    year: "2024 – Present",
    role: "Informatics Engineering Student",
    institution: "EPIS / PENS Surabaya",
    desc: "Focusing on software architecture, algorithms, dynamic web applications, and immersive 3D/WebGL experiences.",
    badge: "Current",
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  { label: "Frontend", items: ["TypeScript", "React", "Next.js", "GSAP", "Three.js", "Tailwind CSS"] },
  { label: "Backend & DevOps", items: ["Node.js", "Laravel", "PHP", "MySQL", "PostgreSQL", "Docker"] },
  { label: "Mobile & Game", items: ["React Native", "Flutter", "Phaser.js", "Canvas API", "Figma"] },
];

export interface EducationItem {
  school: string;
  program: string;
  period: string;
}

export const education: EducationItem[] = [
  {
    school: "Politeknik Elektronika Negeri Surabaya (PENS)",
    program: "D3 Informatics Engineering",
    period: "Present",
  },
  {
    school: "SMKN 10 Surabaya",
    program: "Software Engineering (RPL)",
    period: "2022 – 2025",
  },
];

/** Projects shown on the CV, in order. Must match slugs in data/projects.ts. */
export const featuredProjectSlugs = [
  "noir-photography",
  "lumiera-visual-poetry",
  "digital-craftsman",
  "creative-programmer",
  "mindpoint",
  "aether-dreamscape",
  "ghost-buster",
  "herbal-mart",
] as const;

/**
 * Headline numbers shown in the hero badge and the kinetic marquee. Kept in one
 * place so they cannot disagree. Note: the 3D gallery currently lists
 * `projects.length` public projects, so "35+" counts work beyond that list.
 */
export const stats = {
  projectsShipped: "35+",
} as const;
