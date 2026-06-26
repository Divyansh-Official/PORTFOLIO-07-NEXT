"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import info from "../data/information.json";

gsap.registerPlugin(ScrollTrigger);

interface IntroductionProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function Introduction({ contentRef }: IntroductionProps) {
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // The <h2> word-fade is driven by useHeroAnimation; here we bring the
      // intro copy + meta up just after it, keyed to the block itself.
      gsap.from([".intro-context", ".intro-meta"], {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: {
          trigger: ".intro-block",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [contentRef]);

  return (
    <>
      <style>{`
        .hero-content {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 125svh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .intro-block {
          width: 100%;
          max-width: min(720px, 90vw);
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(1.1rem, 2.4vw, 1.8rem);
        }

        /* The big dissolve-revealed heading */
        .hero-content h2 {
          width: auto;
          margin: 0;
          color: #aa0303;
        }

        .intro-context {
          max-width: 56ch;
          margin: 0;
          color: rgba(244, 244, 244, 0.86);
          font-family: "Instrument Sans", sans-serif;
          font-size: clamp(1.05rem, 1.7vw, 1.4rem);
          font-weight: 400;
          line-height: 1.7;
          letter-spacing: 0.005em;
          text-wrap: balance;
        }

        .intro-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.85rem 1.6rem;
          margin-top: 0.4rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-dim, #8a8a8a);
        }
        .intro-meta span {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          white-space: nowrap;
        }
        .intro-meta span::before {
          content: "";
          width: 6px;
          height: 6px;
          background: var(--accent, #e60012);
          transform: rotate(45deg);
          box-shadow: 0 0 8px var(--accent, #e60012);
        }

        @media (max-width: 1000px) {
          .intro-block { max-width: calc(100% - 2.5rem); }
        }
      `}</style>

      <section className="qualification">
        <div
          className="hero-content"
          ref={contentRef as React.RefObject<HTMLDivElement>}
        >
          <div className="intro-block">
            <h2>Introduction</h2>
            <p className="intro-context">{info.intro}</p>
            <div className="intro-meta">
              <span>{info.role}</span>
              <span>{info.location}</span>
              <span>{info.availability}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
