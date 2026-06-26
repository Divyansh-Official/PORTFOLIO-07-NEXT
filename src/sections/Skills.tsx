"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../data/skills.json";

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sk-head .reveal", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".sk-head", start: "top 85%" },
      });

      gsap.utils.toArray<HTMLElement>(".sk-card").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)", y: 30, opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const marquee = [...data.marquee, ...data.marquee];

  return (
    <section className="skills" id="skills" ref={sectionRef}>
      <style>{`
        .skills {
          position: relative;
          background: var(--bg-soft);
          color: var(--ink);
          padding: clamp(5rem, 12vh, 11rem) 0 clamp(4rem, 9vh, 8rem);
          overflow: hidden;
          border-top: 1px solid var(--line-soft);
          border-bottom: 1px solid var(--line-soft);
        }

        /* Giant rotating katakana watermark */
        .sk-watermark {
          position: absolute;
          right: -2vw;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-jp), serif;
          font-weight: 800;
          font-size: 38vh;
          line-height: 0.8;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.04);
          writing-mode: vertical-rl;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        .sk-inner { position: relative; z-index: 1; padding: 0 clamp(1.25rem, 5vw, 6rem); }

        .sk-head { max-width: 1500px; margin: 0 auto clamp(2.5rem, 6vh, 5rem); }
        .sk-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .sk-kicker::before {
          content: ""; width: 10px; height: 10px; border-radius: 50%;
          background: var(--accent); box-shadow: 0 0 14px var(--accent);
        }
        .sk-title {
          font-family: "Instrument Serif", serif;
          font-weight: 500;
          font-size: clamp(3rem, 9vw, 8.5rem);
          line-height: 0.95; letter-spacing: -0.02em;
          margin: 0.6rem 0 0; text-transform: uppercase;
        }
        .sk-jp {
          font-family: var(--font-jp), serif; font-style: normal; display: block;
          font-size: clamp(1.1rem, 2.2vw, 2rem); letter-spacing: 0.3em;
          color: var(--ink-dim); margin-top: 0.4rem;
        }
        .sk-sub { max-width: 46ch; margin-top: 1.3rem; color: var(--ink-dim);
          font-size: clamp(0.95rem, 1.4vw, 1.15rem); line-height: 1.6; }

        /* ── Marquee ──────────────────────────────────────────── */
        .sk-marquee {
          position: relative;
          z-index: 1;
          margin: clamp(2rem, 5vh, 4rem) 0;
          border-top: 1px solid var(--line-soft);
          border-bottom: 1px solid var(--line-soft);
          padding: 1.1rem 0;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .sk-track {
          display: flex;
          width: max-content;
          gap: 2.5rem;
          align-items: center;
          animation: sk-scroll 28s linear infinite;
        }
        .sk-marquee.rev .sk-track { animation-direction: reverse; animation-duration: 34s; }
        .sk-marquee:hover .sk-track { animation-play-state: paused; }
        .sk-track span {
          font-family: "Instrument Serif", serif;
          font-size: clamp(1.6rem, 4vw, 3rem);
          text-transform: uppercase;
          color: var(--ink);
          white-space: nowrap;
        }
        .sk-track i {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--accent); flex: none;
          box-shadow: 0 0 10px var(--accent);
        }
        @keyframes sk-scroll { to { transform: translateX(-50%); } }

        /* ── Category grid ────────────────────────────────────── */
        .sk-grid {
          position: relative; z-index: 1;
          max-width: 1500px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(0.75rem, 1.5vw, 1.2rem);
        }
        .sk-card {
          position: relative;
          background: var(--bg-elev);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: clamp(1.4rem, 2.5vw, 2.2rem);
          overflow: hidden;
          transition: border-color 0.4s ease, transform 0.4s var(--ease-glide);
          will-change: clip-path, transform;
        }
        .sk-card::before {
          content: "";
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          background: var(--accent);
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.45s var(--ease-glide);
        }
        .sk-card:hover { border-color: rgba(230,0,18,0.35); transform: translateY(-4px); }
        .sk-card:hover::before { transform: scaleY(1); }
        .sk-card-jp {
          font-family: var(--font-jp), serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.18);
          margin-bottom: 0.4rem;
        }
        .sk-card:hover .sk-card-jp { -webkit-text-stroke-color: rgba(230,0,18,0.55); }
        .sk-card-name {
          font-family: "Geist Mono", monospace;
          font-size: 0.74rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--accent-2); margin-bottom: 1.1rem;
        }
        .sk-card-items { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
        .sk-card-items li {
          display: flex; align-items: center; gap: 0.7rem;
          font-size: clamp(0.95rem, 1.3vw, 1.1rem);
          color: var(--ink); opacity: 0.85;
        }
        .sk-card-items li::before {
          content: ""; width: 6px; height: 6px; transform: rotate(45deg);
          background: var(--ink-faint); flex: none; transition: background 0.3s ease;
        }
        .sk-card:hover .sk-card-items li::before { background: var(--accent); }

        @media (max-width: 950px) { .sk-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .sk-grid { grid-template-columns: 1fr; }
          .sk-watermark { font-size: 30vh; opacity: 0.6; }
        }
      `}</style>

      <div className="sk-watermark" aria-hidden="true">技</div>

      <div className="sk-inner">
        <header className="sk-head">
          <span className="sk-kicker reveal">{data.kicker}</span>
          <h2 className="sk-title reveal">
            {data.title}
            <span className="sk-jp">{data.label}</span>
          </h2>
          <p className="sk-sub reveal">{data.subtitle}</p>
        </header>
      </div>

      <div className="sk-marquee" aria-hidden="true">
        <div className="sk-track">
          {marquee.map((m, i) => (
            <span key={`a-${i}`}>
              {m}
              <i style={{ display: "inline-block", marginLeft: "2.5rem", verticalAlign: "middle" }} />
            </span>
          ))}
        </div>
      </div>

      <div className="sk-inner">
        <div className="sk-grid">
          {data.categories.map((c) => (
            <div className="sk-card" key={c.name}>
              <div className="sk-card-jp">{c.nameJp}</div>
              <div className="sk-card-name">{c.name}</div>
              <ul className="sk-card-items">
                {c.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="sk-marquee rev" aria-hidden="true" style={{ marginBottom: 0 }}>
        <div className="sk-track">
          {marquee.map((m, i) => (
            <span key={`b-${i}`}>
              {m}
              <i style={{ display: "inline-block", marginLeft: "2.5rem", verticalAlign: "middle" }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
