"use client";

import dynamic from "next/dynamic";
import Hero from "./Hero";

/**
 * The scrollable body revealed after the splash wipes away.
 *
 * Hero is eager (it's the first paint behind the splash). Everything below the
 * fold is code-split with next/dynamic + ssr:false so its JS (GSAP timelines,
 * section markup) is loaded lazily on the client instead of bloating the
 * initial bundle / SSR payload — the splash plays while these chunks arrive.
 */
const Marquee = dynamic(() => import("./Marquee"));
const About = dynamic(() => import("./About"));
const Skills = dynamic(() => import("./Skills"));
const Projects = dynamic(() => import("./Projects"));
const Qualifications = dynamic(() => import("./Qualifications"));
const Achievements = dynamic(() => import("./Achievements"));
const Contact = dynamic(() => import("./Contact"));

export default function StackedSections() {
  return (
    <>
      <style>{`
        /* Footer reveal: the footer is FIXED at the bottom, BEHIND the page content.
           The page content is opaque (z-index 1) with a 100vh bottom margin, so as
           you scroll past it, it slides UP and OVER the fixed footer — uncovering it
           from underneath (the StringTune "footer shifting" reveal). */
        .site-content {
          position: relative;
          z-index: 1;
          background: var(--bg);
          margin-bottom: 100vh;
        }
        .footer-reveal {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          height: 100vh;
          z-index: 0;
        }
      `}</style>

      <div className="site-content">
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Projects />
        <Qualifications />
        <Achievements />
      </div>

      <div className="footer-reveal">
        <Contact />
      </div>
    </>
  );
}
