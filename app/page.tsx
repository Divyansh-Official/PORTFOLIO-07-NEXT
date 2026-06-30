'use client';

import PositionTracker from "@/src/components/trackers/PositionTracker";
import SplashScreen from "@/src/sections/Splash/SplashScreen01";
import FireAssistant from "@/src/components/FireAssistant";
import MobileGate from "@/src/components/MobileGate";
import SectionTransition from "@/src/components/SectionTransition";
import GridFrame from "@/src/components/GridFrame";

export default function Home() {
  return (
    // Phones get a hero-styled "open on a bigger screen" page; the site below
    // mounts only on tablet/desktop.
    <MobileGate>
      <main>
        {/* Splash plays the loading → ENGAGE → clip-wipe intro, then reveals
            the stacked sections (Hero · Projects · Skills) inside .hero-stage. */}
        <SplashScreen />
        <PositionTracker />
        {/* Fixed bottom-right Lottie assistant button + chat bubble (post-splash). */}
        <FireAssistant />
        {/* Full-screen WebGL dissolve transition fired by nav clicks. */}
        <SectionTransition />
        {/* Technical grid-line frame (fades in once the card docks). */}
        <GridFrame />
      </main>
    </MobileGate>
  );
}
