import HeroSection from "@/components/ui/HeroSection";
import AboutSection from "@/components/ui/AboutSection";
import ProcessDashboard from "@/components/ui/ProcessDashboard";
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
            <span className="marquee-text">NEXT.JS • THREE.JS • GSAP • 35+ PROJECTS SHIPPED • PENS SURABAYA •</span>
            <span className="marquee-text">NEXT.JS • THREE.JS • GSAP • 35+ PROJECTS SHIPPED • PENS SURABAYA •</span>
            <span className="marquee-text">NEXT.JS • THREE.JS • GSAP • 35+ PROJECTS SHIPPED • PENS SURABAYA •</span>
            <span className="marquee-text">NEXT.JS • THREE.JS • GSAP • 35+ PROJECTS SHIPPED • PENS SURABAYA •</span>
          </div>
        </div>

        <AboutSection />
        <ProcessDashboard />
        <HorizonShowcase />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
