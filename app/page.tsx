'use client';

import PositionTracker from "@/src/components/trackers/PositionTracker";
import SplashScreen from "@/src/sections/Splash/SplashScreen01";

export default function Home() {
  return (
    <main>
      {/* Splash plays the loading → ENGAGE → clip-wipe intro, then reveals
          the stacked sections (Hero · Projects · Skills) inside .hero-stage. */}
      <SplashScreen />
      <PositionTracker />
    </main>
  );
}
