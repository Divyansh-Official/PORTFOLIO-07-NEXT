"use client";

import info from "../data/information.json";

// Single continuous looped marquee that sits between bg2 (hero) and bg3.
// Type matches the hero: Anurati, uppercase, wide tracking, crimson glow.
export default function Marquee() {
  const items = (info.ticker ?? []) as string[];
  const loop = [...items, ...items]; // doubled → seamless -50% loop

  return (
    <section className="marquee-sec" aria-hidden="true">
      <style>{`
        .marquee-sec {
          position: relative;
          background: #000;            /* blends with bg2's bottom fade above */
          padding: clamp(2.2rem, 6vh, 4.5rem) 0;
          overflow: hidden;
          border-top: 1px solid var(--line-soft);
          border-bottom: 1px solid var(--line-soft);
        }
        .mq-row {
          display: flex;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
        }
        .mq-track {
          display: flex;
          flex: none;
          align-items: center;
          width: max-content;
          gap: clamp(2rem, 5vw, 5rem);
          padding-left: clamp(2rem, 5vw, 5rem);
          animation: mq-scroll 34s linear infinite;
          will-change: transform;
        }
        .marquee-sec:hover .mq-track { animation-play-state: paused; }

        .mq-item {
          display: inline-flex;
          align-items: center;
          gap: clamp(2rem, 5vw, 5rem);
          font-family: var(--font-anurati), "Geist Mono", monospace;
          font-size: clamp(1.35rem, 3.2vw, 2.9rem);
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #fff;
          white-space: nowrap;
          text-shadow: 0 0 22px rgba(230, 0, 18, 0.4);
        }
        /* every other word is ghosted for rhythm (no glow) */
        .mq-track .mq-item:nth-child(even) {
          color: var(--ink-faint);
          text-shadow: none;
        }
        .mq-item::after {
          content: "";
          width: clamp(6px, 0.7vw, 11px);
          height: clamp(6px, 0.7vw, 11px);
          background: var(--accent);
          transform: rotate(45deg);
          box-shadow: 0 0 16px var(--accent);
          flex: none;
        }

        @keyframes mq-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .mq-track { animation: none; } }
      `}</style>

      <div className="mq-row">
        <div className="mq-track">
          {loop.map((it, i) => (
            <span className="mq-item" key={`a-${i}`}>{it}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
