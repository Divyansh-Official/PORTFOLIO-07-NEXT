'use client';

import BasicNavigationBar from "@/src/components/nav/navBar";
import StringProgressReveal from "@/src/components/StringProgressReveal";
import PositionTracker from "@/src/components/trackers/PositionTracker";
import Hero from "@/src/sections/Hero";
import SplashScreen from "@/src/sections/Splash/SplashScreen01";
import StackedSections from "@/src/sections/StackedSections";

export default function Home() {
  return (
  <div>
    <style>
      {`
      
        // .navbar-container {
        //   width: 100%;
        //   padding-top: 10px;
        //   position: relative;
        //   z-index: 100;
        // }

        .heroSection {
          width: 100%;
          padding-top: 10px;
          position: relative;
          // z-index: 100;
        }
      `}
    </style>
    <div className="navbar-container"> 
        <BasicNavigationBar />
      </div>
    <div className="heroSection">
      <Hero />
    </div>
    {/* <SplashScreen /> */}
    {/* <StringProgressReveal /> */}
    {/* <StackedSections /> */}
    <PositionTracker />
  </div>
  );
}