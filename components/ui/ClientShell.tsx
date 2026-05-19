"use client";
import dynamic from "next/dynamic";

const Preloader = dynamic(() => import("./Preloader"), { ssr: false });
const ThreeBackground = dynamic(() => import("./ThreeBackground"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const GSAPEffects = dynamic(() => import("./GSAPEffects"), { ssr: false });
const CardStackInteractions = dynamic(() => import("./CardStackInteractions"), { ssr: false });
const SwiperInit = dynamic(() => import("./SwiperInit"), { ssr: false });
const WorkflowKinetic = dynamic(() => import("./WorkflowKinetic"), { ssr: false });
const GlobalInteractions = dynamic(() => import("./GlobalInteractions"), { ssr: false });
const LenisSetup = dynamic(() => import("./LenisSetup"), { ssr: false });
const AiChatOverlay = dynamic(() => import("./AiChatOverlay"), { ssr: false });

export default function ClientShell() {
  return (
    <>
      <LenisSetup />
      <Preloader />
      <ThreeBackground />
      <CustomCursor />
      <Navbar />
      <GSAPEffects />
      <CardStackInteractions />
      <SwiperInit />
      <WorkflowKinetic />
      <GlobalInteractions />
      <AiChatOverlay />
    </>
  );
}
