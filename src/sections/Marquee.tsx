"use client";

import info from "../data/information.json";

// Continuous looped horizontal marquee that sits between bg2 (hero) and bg3.
export default function Marquee() {
  const items = (info.ticker ?? []) as string[];
  const loop = [...items, ...items]; // doubled → seamless -50% loop

  return (
    <section className="marquee-sec" aria-hidden="true">
      <style>{`
        .marquee-sec {
          position: relative;
          background: #000;            /* blends with bg2's bottom fade above */
          padding: clamp(3.5rem, 9vh, 7rem) 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: clamp(0.5rem, 1.5vh, 1.2rem);
          border-bottom: 1px solid var(--line-soft);
        }
        .mq-row {
          display: flex;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
        }
        .mq-track {
          display: flex;
          flex: none;
          align-items: center;
          width: max-content;
          gap: clamp(1.5rem, 4vw, 4rem);
          padding-left: clamp(1.5rem, 4vw, 4rem);
          animation: mq-scroll 26s linear infinite;
          will-change: transform;
        }
        .mq-row.rev .mq-track { animation-direction: reverse; animation-duration: 32s; }
        .marquee-sec:hover .mq-track { animation-play-state: paused; }

        .mq-item {
          display: inline-flex;
          align-items: center;
          gap: clamp(1.5rem, 4vw, 4rem);
          font-family: "Instrument Serif", serif;
          font-size: clamp(2.4rem, 7vw, 5.5rem);
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: var(--ink);
          white-space: nowrap;
        }
        /* every other item is outlined for rhythm */
        .mq-track .mq-item:nth-child(even) {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.35);
        }
        .mq-item::after {
          content: "";
          width: clamp(8px, 1vw, 14px);
          height: clamp(8px, 1vw, 14px);
          background: var(--accent);
          transform: rotate(45deg);
          box-shadow: 0 0 14px var(--accent);
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

      <div className="mq-row rev">
        <div className="mq-track">
          {loop.map((it, i) => (
            <span className="mq-item" key={`b-${i}`}>{it}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
