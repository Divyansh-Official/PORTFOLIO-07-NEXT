'use client';

import StringProgressReveal from "@/src/components/StringProgressReveal";
import PositionTracker from "@/src/components/trackers/PositionTracker";
import Hero from "@/src/sections/Hero";
import SplashScreen from "@/src/sections/SplashScreen";

export default function Home() {
  return (
  <div>
    <Hero />
    {/* <SplashScreen /> */}
    {/* <StringProgressReveal /> */}
    <PositionTracker />
  </div>
  );
}