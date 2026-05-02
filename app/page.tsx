'use client';

import PositionTracker from "@/src/components/trackers/PositionTracker";
import Hero from "@/src/sections/Hero";
import SplashScreen from "@/src/sections/SplashScreen";

export default function Home() {
  return (
  <div>
    <Hero />
    {/* <SplashScreen /> */}
    <PositionTracker />
  </div>
  );
}