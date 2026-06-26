"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../data/achievements.json";

gsap.registerPlugin(ScrollTrigger);

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ac-head .reveal", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".ac-head", start: "top 85%" },
      });

      gsap.utils.toArray<HTMLElement>(".ac-row").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="achievements" id="achievements" ref={sectionRef}>
      <style>{`
        .achievements {
          position: relative;
          background: var(--bg);
          color: var(--ink);
          padding: clamp(5rem, 12vh, 11rem) clamp(1.25rem, 5vw, 6rem);
          overflow: hidden;
        }
        .ac-head { max-width: 1500px; margin: 0 auto clamp(2.5rem, 6vh, 5rem); }
        .ac-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .ac-kicker::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent); }
        .ac-title {
          font-family: "Instrument Serif", serif; font-weight: 500;
          font-size: clamp(3rem, 9vw, 8.5rem); line-height: 0.95; letter-spacing: -0.02em;
          margin: 0.6rem 0 0; text-transform: uppercase;
        }
        .ac-jp {
          font-family: var(--font-jp), serif; display: block;
          font-size: clamp(1.1rem, 2.2vw, 2rem); letter-spacing: 0.3em;
          color: var(--ink-dim); margin-top: 0.4rem;
        }
        .ac-sub { max-width: 46ch; margin-top: 1.2rem; color: var(--ink-dim); font-size: clamp(0.95rem, 1.4vw, 1.15rem); }

        .ac-list { max-width: 1300px; margin: 0 auto; }
        .ac-row {
          display: grid;
          grid-template-columns: 7rem 1fr auto;
          gap: clamp(1rem, 3vw, 3rem);
          align-items: baseline;
          padding: clamp(1.6rem, 3.5vh, 2.6rem) 0;
          border-top: 1px solid var(--line);
          transition: background 0.4s ease;
          will-change: clip-path;
        }
        .ac-row:last-child { border-bottom: 1px solid var(--line); }
        .ac-row:hover { background: linear-gradient(90deg, rgba(230,0,18,0.06), transparent 60%); }
        .ac-year {
          font-family: "Barlow Condensed", sans-serif; font-weight: 800;
          font-size: clamp(1.6rem, 3vw, 2.4rem); color: var(--accent);
          line-height: 1;
        }
        .ac-main h3 {
          font-family: "Instrument Serif", serif; font-weight: 500;
          font-size: clamp(1.4rem, 3vw, 2.4rem); line-height: 1.1; margin: 0 0 0.35rem;
        }
        .ac-detail { max-width: 60ch; color: var(--ink); opacity: 0.72; line-height: 1.6; font-size: clamp(0.92rem, 1.2vw, 1.05rem); }
        .ac-org {
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ink-dim); white-space: nowrap;
        }

        @media (max-width: 720px) {
          .ac-row { grid-template-columns: 1fr; gap: 0.5rem; }
          .ac-org { order: -1; }
        }
      `}</style>

      <header className="ac-head">
        <span className="ac-kicker reveal">{data.kicker}</span>
        <h2 className="ac-title reveal">
          {data.title}
          <span className="ac-jp">{data.label}</span>
        </h2>
        <p className="ac-sub reveal">{data.subtitle}</p>
      </header>

      <div className="ac-list">
        {data.items.map((a, i) => (
          <div className="ac-row" key={i}>
            <div className="ac-year">{a.year}</div>
            <div className="ac-main">
              <h3>{a.title}</h3>
              <p className="ac-detail">{a.detail}</p>
            </div>
            <div className="ac-org">{a.org}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
