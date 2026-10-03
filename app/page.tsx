import HeroSection from "@/components/ui/HeroSection";
import AboutSection from "@/components/ui/AboutSection";
import ProcessSteps from "@/components/ui/ProcessSteps";
import HorizonShowcase from "@/components/ui/HorizonShowcase";
import ProjectsSection from "@/components/ui/ProjectsSection";
import AchievementsSection from "@/components/ui/AchievementsSection";
import ContactSection from "@/components/ui/ContactSection";
import Footer from "@/components/ui/Footer";
import ClientShell from "@/components/ui/ClientShell";
import { stats } from "@/data/profile";

const MARQUEE_TEXT = `NEXT.JS • THREE.JS • GSAP • ${stats.projectsShipped} PROJECTS SHIPPED • PENS SURABAYA •`;

export default function Home() {
  return (
    <>
      {/* All client-only dynamic components (cursor, Three.js, GSAP, Swiper, etc.) */}
      <ClientShell />

      {/* Scroll progress bar */}
      <div className="scroll-progress-bar"></div>

      {/* Navigation placeholder (rendered by ClientShell/Navbar) */}

      <main id="content" tabIndex={-1}>
        <HeroSection />

        {/* Kinetic Marquee */}
        <div className="kinetic-marquee-container">
          <div className="marquee-wrapper">
            <span className="marquee-text">{MARQUEE_TEXT}</span>
            <span className="marquee-text">{MARQUEE_TEXT}</span>
            <span className="marquee-text">{MARQUEE_TEXT}</span>
            <span className="marquee-text">{MARQUEE_TEXT}</span>
          </div>
        </div>

        <AboutSection />
        <ProcessSteps />
        <HorizonShowcase />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
