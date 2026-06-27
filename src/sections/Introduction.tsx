"use client";

interface IntroductionProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function Introduction({ contentRef }: IntroductionProps) {
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
        .hero-content h2 { width: auto; margin: 0; color: #aa0303; }
        .intro-context {
          max-width: 56ch;
          margin: 0;
          color: rgba(244, 244, 244, 0.86);
          font-family: "Instrument Sans", sans-serif;
          font-size: clamp(1.05rem, 1.7vw, 1.4rem);
          line-height: 1.7;
          text-wrap: balance;
        }
        .intro-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.85rem 1.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-dim, #8a8a8a);
        }
        .intro-meta span { display: inline-flex; align-items: center; gap: 0.55rem; white-space: nowrap; }
        .intro-meta span::before {
          content: "";
          width: 6px; height: 6px;
          background: var(--accent, #e60012);
          transform: rotate(45deg);
        }
      `}</style>

      {/* The .hero-content node must stay (the dissolve hook reads it via
          contentRef), but its copy is the scroll-in target — keep it as the
          shell only. */}
      <section className="qualification">
        <div
          className="hero-content"
          ref={contentRef as React.RefObject<HTMLDivElement>}
        >
          {/* ── Introduction copy temporarily disabled ──────────────────────────
              The dissolve now reveals an IMAGE (not black), so the scroll-in
              "Introduction" heading + intro text are commented out.
              To restore: re-add `import info from "../data/information.json";`
              at the top, then uncomment the block below.

          <div className="intro-block">
            <h2>Introduction</h2>
            <p className="intro-context">{info.intro}</p>
            <div className="intro-meta">
              <span>{info.role}</span>
              <span>{info.location}</span>
              <span>{info.availability}</span>
            </div>
          </div>
          ──────────────────────────────────────────────────────────────────── */}
        </div>
      </section>
    </>
  );
}
