"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../data/Qualifications.json";

gsap.registerPlugin(ScrollTrigger);

export default function Qualifications() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".q-head .reveal", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".q-head", start: "top 85%" },
      });

      // Timeline spine draws as you scroll the list
      gsap.fromTo(
        ".q-spine-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".q-timeline",
            start: "top 65%",
            end: "bottom 75%",
            scrub: true,
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".q-item").forEach((el) => {
        gsap.from(el, {
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="qualifications" id="qualifications" ref={sectionRef}>
      <style>{`
        .qualifications {
          position: relative;
          background: var(--bg-soft);
          color: var(--ink);
          padding: clamp(5rem, 12vh, 11rem) clamp(1.25rem, 5vw, 6rem);
          border-top: 1px solid var(--line-soft);
          overflow: hidden;
        }
        .q-head { max-width: 1500px; margin: 0 auto clamp(3rem, 7vh, 6rem); }
        .q-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .q-kicker::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent); }
        .q-title {
          font-family: "Instrument Serif", serif; font-weight: 500;
          font-size: clamp(3rem, 9vw, 8.5rem); line-height: 0.95; letter-spacing: -0.02em;
          margin: 0.6rem 0 0; text-transform: uppercase;
        }
        .q-jp {
          font-family: var(--font-jp), serif; display: block;
          font-size: clamp(1.1rem, 2.2vw, 2rem); letter-spacing: 0.3em;
          color: var(--ink-dim); margin-top: 0.4rem;
        }

        .q-timeline {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          padding-left: clamp(2rem, 5vw, 3.5rem);
        }
        .q-spine {
          position: absolute;
          left: 0; top: 0.5rem; bottom: 0.5rem;
          width: 2px;
          background: var(--line);
        }
        .q-spine-fill {
          position: absolute; inset: 0;
          background: linear-gradient(var(--accent), var(--accent-2));
          transform-origin: top;
        }
        .q-item {
          position: relative;
          padding: 0 0 clamp(2.5rem, 6vh, 4.5rem);
        }
        .q-item:last-child { padding-bottom: 0; }
        .q-node {
          position: absolute;
          left: calc(clamp(2rem, 5vw, 3.5rem) * -1 - 5px);
          top: 0.4rem;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--bg-soft);
          border: 2px solid var(--accent);
          box-shadow: 0 0 0 4px var(--bg-soft), 0 0 14px rgba(230,0,18,0.5);
        }
        .q-year {
          font-family: "Geist Mono", monospace;
          font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .q-item h3 {
          font-family: "Instrument Serif", serif; font-weight: 500;
          font-size: clamp(1.5rem, 3vw, 2.4rem); line-height: 1.1;
          margin: 0.5rem 0 0.3rem;
        }
        .q-org {
          font-family: "Geist Mono", monospace;
          font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-dim); margin-bottom: 0.8rem;
        }
        .q-org a { color: var(--ink-dim); text-decoration: none; border-bottom: 1px solid var(--accent); }
        .q-org a:hover { color: var(--ink); }
        .q-detail { max-width: 60ch; color: var(--ink); opacity: 0.78; line-height: 1.65; font-size: clamp(0.95rem, 1.3vw, 1.1rem); }
      `}</style>

      <header className="q-head">
        <span className="q-kicker reveal">{data.kicker}</span>
        <h2 className="q-title reveal">
          {data.title}
          <span className="q-jp">{data.label}</span>
        </h2>
      </header>

      <div className="q-timeline">
        <div className="q-spine">
          <div className="q-spine-fill" />
        </div>

        {data.timeline.map((t, i) => (
          <div className="q-item" key={i}>
            <span className="q-node" />
            <div className="q-year">{t.year}</div>
            <h3>{t.title}</h3>
            <div className="q-org">
              {"href" in t && t.href ? (
                <a href={t.href} target="_blank" rel="noreferrer">
                  {t.org} ↗
                </a>
              ) : (
                t.org
              )}
            </div>
            <p className="q-detail">{t.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
