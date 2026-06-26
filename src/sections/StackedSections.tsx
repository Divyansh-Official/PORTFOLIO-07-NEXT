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
const About = dynamic(() => import("./About"));
const Skills = dynamic(() => import("./Skills"));
const Projects = dynamic(() => import("./Projects"));
const Qualifications = dynamic(() => import("./Qualifications"));
const Achievements = dynamic(() => import("./Achievements"));
const Contact = dynamic(() => import("./Contact"));

export default function StackedSections() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Qualifications />
      <Achievements />
      <Contact />
    </>
  );
}
