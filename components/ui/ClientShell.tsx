"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useLite } from "@/lib/lite";
import { startQualityGovernor } from "@/lib/quality";

const Preloader = dynamic(() => import("./Preloader"), { ssr: false });
const ThreeBackground = dynamic(() => import("./ThreeBackground"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const GSAPEffects = dynamic(() => import("./GSAPEffects"), { ssr: false });
const GlobalInteractions = dynamic(() => import("./GlobalInteractions"), { ssr: false });
const LenisSetup = dynamic(() => import("./LenisSetup"), { ssr: false });
const AiChatOverlay = dynamic(() => import("./AiChatOverlay"), { ssr: false });
const LiteToggle = dynamic(() => import("./LiteToggle"), { ssr: false });
const PaperSun = dynamic(() => import("./PaperSun"), { ssr: false });

export default function ClientShell() {
  // Lite mode skips the two always-on costs: the WebGL starfield behind the
  // whole page, and smooth-scroll (native scrolling is the cheapest there is).
  const { lite } = useLite();

  // Watches frame times for the whole session and publishes a quality tier.
  useEffect(() => {
    startQualityGovernor();
  }, []);

  return (
    <>
      {!lite && <LenisSetup />}
      <Preloader />
      {!lite && <ThreeBackground />}
      <CustomCursor />
      <Navbar />
      <GSAPEffects />
      <GlobalInteractions />
      <AiChatOverlay />
      <LiteToggle />
      <PaperSun />
    </>
  );
}
