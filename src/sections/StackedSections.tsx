"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./Hero";
import Qualification from "./Qualification";
// import Skills from "./Skills";
// import Projects from "./Projects";
// import Contact from "./Contact";

gsap.registerPlugin(ScrollTrigger);

// ── Add every section here in display order ───────────────────────────────────
// Each entry becomes one card in the stack.
const SECTIONS = [
  { id: "hero",          Component: Hero },
  { id: "qualification", Component: Qualification },
  // { id: "skills",       Component: Skills },
  // { id: "projects",     Component: Projects },
  // { id: "contact",      Component: Contact },
];

export default function StackedSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".stack-card");

    cards.forEach((card, i) => {
      // The last card has nothing to scale into — skip it.
      if (i === cards.length - 1) return;

      ScrollTrigger.create({
        trigger: card,
        start: "top top",          // pin fires when card hits the top of viewport
        end: () => `+=${card.offsetHeight}`,
        pin: true,                 // keep this card in place while next scrolls in
        pinSpacing: false,         // don't add extra space — sections are pre-spaced
        onUpdate: ({ progress }) => {
          // Scale card down from 1 → 0.9 and fade slightly as next card arrives.
          // This creates the "card pushed back into a deck" feeling.
          gsap.set(card, {
            scale:   gsap.utils.mapRange(0, 1, 1, 1, progress),
            opacity: gsap.utils.mapRange(0, 1, 1, 0.5, progress),
            borderRadius: gsap.utils.mapRange(0, 1, 0, 16, progress),
          });
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <>
      <style>{`
        .stack-container {
          position: relative;
        }

        .stack-card {
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          transform-origin: top center;
          will-change: transform, opacity;
        }

        /* Each card sits on top of the previous — z-index stacks them in order */
        ${SECTIONS.map((_, i) => `.stack-card:nth-child(${i + 1}) { z-index: ${i + 1}; }`).join("\n")}
      `}</style>

      <div className="stack-container" ref={containerRef}>
        {SECTIONS.map(({ id, Component }) => (
          <div key={id} className="stack-card" id={`section-${id}`}>
            <Component />
          </div>
        ))}
      </div>
    </>
  );
}