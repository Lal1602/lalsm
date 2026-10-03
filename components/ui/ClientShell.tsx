"use client";
import dynamic from "next/dynamic";
import { useLite } from "@/lib/lite";

const Preloader = dynamic(() => import("./Preloader"), { ssr: false });
const ThreeBackground = dynamic(() => import("./ThreeBackground"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const GSAPEffects = dynamic(() => import("./GSAPEffects"), { ssr: false });
const SwiperInit = dynamic(() => import("./SwiperInit"), { ssr: false });
const GlobalInteractions = dynamic(() => import("./GlobalInteractions"), { ssr: false });
const LenisSetup = dynamic(() => import("./LenisSetup"), { ssr: false });
const AiChatOverlay = dynamic(() => import("./AiChatOverlay"), { ssr: false });
const LiteToggle = dynamic(() => import("./LiteToggle"), { ssr: false });

export default function ClientShell() {
  // Lite mode skips the two always-on costs: the WebGL starfield behind the
  // whole page, and smooth-scroll (native scrolling is the cheapest there is).
  const { lite } = useLite();

  return (
    <>
      {!lite && <LenisSetup />}
      <Preloader />
      {!lite && <ThreeBackground />}
      <CustomCursor />
      <Navbar />
      <GSAPEffects />
      <SwiperInit />
      <GlobalInteractions />
      <AiChatOverlay />
      <LiteToggle />
    </>
  );
}
