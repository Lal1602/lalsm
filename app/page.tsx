// Force Next.js recompilation after fixing syntax errors
import HeroSection from "@/components/ui/HeroSection";
import AboutSection from "@/components/ui/AboutSection";
import WorkflowSection from "@/components/ui/WorkflowSection";
import HorizonShowcase from "@/components/ui/HorizonShowcase";
import ProjectsSection from "@/components/ui/ProjectsSection";
import AchievementsSection from "@/components/ui/AchievementsSection";
import ContactSection from "@/components/ui/ContactSection";
import Footer from "@/components/ui/Footer";
import ClientShell from "@/components/ui/ClientShell";

export default function Home() {
  return (
    <>
      {/* All client-only dynamic components (cursor, Three.js, GSAP, Swiper, etc.) */}
      <ClientShell />

      {/* Scroll progress bar */}
      <div className="scroll-progress-bar"></div>

      {/* Navigation placeholder (rendered by ClientShell/Navbar) */}

      <main>
        <HeroSection />

        {/* Kinetic Marquee */}
        <div className="kinetic-marquee-container">
          <div className="marquee-wrapper">
            <span className="marquee-text">FULLSTACK DEVELOPER • CREATIVE CODER • UI/UX DESIGNER • SYSTEM ARCHITECT •</span>
            <span className="marquee-text">FULLSTACK DEVELOPER • CREATIVE CODER • UI/UX DESIGNER • SYSTEM ARCHITECT •</span>
            <span className="marquee-text">FULLSTACK DEVELOPER • CREATIVE CODER • UI/UX DESIGNER • SYSTEM ARCHITECT •</span>
            <span className="marquee-text">FULLSTACK DEVELOPER • CREATIVE CODER • UI/UX DESIGNER • SYSTEM ARCHITECT •</span>
          </div>
        </div>

        <AboutSection />
        <WorkflowSection />
        <HorizonShowcase />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </main>

      <Footer />

      {/* Floating holographic workflow tooltip */}
      <div className="floating-workflow-card" aria-hidden="true" role="tooltip">
        <div className="float-card-glow"></div>
        <div className="float-icon-wrap">
          {/* @ts-ignore */}
          <ion-icon suppressHydrationWarning className="float-icon" name="search-outline"></ion-icon>
        </div>
        <p className="float-eyebrow">// PROCESS</p>
        <h4 className="float-title">Discovery</h4>
        <p className="float-desc">Hover a step to reveal details.</p>
      </div>
    </>
  );
}
