"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../data/about.json";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero image collapses into a 3D notched clip-card ─────────────────
      // The pinned stage holds the full-bleed hero background image; as you
      // scroll it scales down, the corner-cut clip-path morphs in, and it
      // tilts in 3D — landing as a card that's part of the About section.
      const collapse = gsap.timeline({
        scrollTrigger: {
          trigger: ".ab-collapse",
          start: "top top",
          end: "+=160%",
          scrub: 1,
          pin: ".ab-collapse",
          pinSpacing: true,
          anticipatePin: 1,
        },
      });
      collapse.to(
        ".hc-card",
        {
          scale: 0.46,
          yPercent: -4,
          rotateX: 6,
          "--cut": "38px",
          ease: "none",
        },
        0
      );

      // ── About content ────────────────────────────────────────────────────
      gsap.from(".ab-reveal", {
        y: 44,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".ab-grid", start: "top 78%" },
      });

      gsap.from(".ab-stat", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".ab-stats", start: "top 88%" },
      });

      gsap.fromTo(
        ".ab-rail-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".ab-grid",
            start: "top 75%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <style>{`
        @property --cut {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        .about {
          position: relative;
          background: var(--bg);
          color: var(--ink);
          overflow: hidden;
        }

        /* ── Collapse stage (pinned) ──────────────────────────────────── */
        .ab-collapse {
          position: relative;
          height: 100vh;
          width: 100%;
          background: #000;
          perspective: 1600px;
          overflow: hidden;
        }
        .hc-card {
          position: absolute;
          inset: 0;
          transform-origin: center center;
          transform-style: preserve-3d;
          filter: drop-shadow(0 40px 60px rgba(0, 0, 0, 0.65));
          will-change: transform, clip-path;
          --cut: 0px;
          /* chamfered ("clip design") card — at --cut:0 it's a full rectangle,
             GSAP animates --cut up so the corners cut in as it collapses */
          clip-path: polygon(
            var(--cut) 0%,
            calc(100% - var(--cut)) 0%,
            100% var(--cut),
            100% calc(100% - var(--cut)),
            calc(100% - var(--cut)) 100%,
            var(--cut) 100%,
            0% calc(100% - var(--cut)),
            0% var(--cut)
          );
        }
        .hc-card::after {
          content: "";
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.10);
          clip-path: inherit;
          pointer-events: none;
        }
        .hc-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── About body ───────────────────────────────────────────────── */
        .ab-grid {
          max-width: 1500px;
          margin: 0 auto;
          padding: clamp(5rem, 13vh, 12rem) clamp(1.25rem, 5vw, 6rem);
          display: grid;
          grid-template-columns: auto 1fr;
          gap: clamp(2rem, 6vw, 6rem);
          align-items: start;
        }

        .ab-rail {
          display: flex;
          gap: 1.2rem;
          align-items: flex-start;
          position: sticky;
          top: 14vh;
        }
        .ab-rail-line {
          width: 1px;
          height: clamp(8rem, 20vh, 16rem);
          background: linear-gradient(var(--accent), transparent);
          transform-origin: top;
        }
        .ab-rail-jp {
          font-family: var(--font-jp), serif;
          writing-mode: vertical-rl;
          font-size: clamp(2rem, 4vw, 3.4rem);
          letter-spacing: 0.15em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(230,0,18,0.55);
        }

        .ab-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .ab-kicker::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent); }

        .ab-lead {
          font-family: "Instrument Serif", serif;
          font-size: clamp(1.7rem, 3.6vw, 3.2rem);
          line-height: 1.18;
          letter-spacing: -0.01em;
          margin: 1.2rem 0 1.8rem;
          max-width: 20ch;
        }
        .ab-lead em { font-style: italic; color: var(--accent-2); }
        .ab-p {
          max-width: 56ch;
          color: var(--ink);
          opacity: 0.78;
          line-height: 1.7;
          font-size: clamp(1rem, 1.4vw, 1.18rem);
          margin-bottom: 1.1rem;
        }

        .ab-stats {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(1.5rem, 5vw, 4rem);
          margin: 2.6rem 0 2.2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--line);
        }
        .ab-stat-value {
          font-family: "Barlow Condensed", sans-serif;
          font-weight: 800;
          font-size: clamp(2.6rem, 6vw, 4.5rem);
          line-height: 1;
          color: var(--ink);
        }
        .ab-stat-value span { color: var(--accent); }
        .ab-stat-label {
          font-family: "Geist Mono", monospace;
          font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ink-dim); margin-top: 0.4rem;
        }

        .ab-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .ab-tags span {
          font-family: "Geist Mono", monospace;
          font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--ink-dim);
          padding: 0.45rem 0.85rem;
          border: 1px solid var(--line);
          border-radius: 999px;
          transition: border-color 0.3s ease, color 0.3s ease;
        }
        .ab-tags span:hover { border-color: rgba(230,0,18,0.45); color: var(--ink); }

        @media (max-width: 760px) {
          .ab-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .ab-rail { position: relative; top: 0; flex-direction: row; }
          .ab-rail-line { width: clamp(4rem, 30vw, 10rem); height: 1px; background: linear-gradient(90deg, var(--accent), transparent); transform-origin: left; }
          .ab-rail-jp { writing-mode: horizontal-tb; }
        }
      `}</style>

      {/* Hero image → 3D clip-card collapse (pinned) */}
      <div className="ab-collapse">
        <div className="hc-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/bg1.png" alt="" />
        </div>
      </div>

      <div className="ab-grid">
        <div className="ab-rail" aria-hidden="true">
          <div className="ab-rail-line" />
          <div className="ab-rail-jp">{data.label}</div>
        </div>

        <div className="ab-body">
          <span className="ab-kicker ab-reveal">{data.kicker}</span>
          <p className="ab-lead ab-reveal">{data.lead}</p>

          {data.paragraphs.map((p, i) => (
            <p className="ab-p ab-reveal" key={i}>
              {p}
            </p>
          ))}

          <div className="ab-stats">
            {data.stats.map((s) => (
              <div className="ab-stat" key={s.label}>
                <div className="ab-stat-value">
                  <span>{s.value}</span>
                </div>
                <div className="ab-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="ab-tags ab-reveal">
            {data.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
