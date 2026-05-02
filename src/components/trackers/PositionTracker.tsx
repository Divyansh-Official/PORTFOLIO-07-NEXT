"use client";

import { useEffect, useRef } from "react";

export default function PositionTracker() {
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // StringTune is ESM — dynamic import avoids SSR crash
    let stringTune: any = null;

    const init = async () => {
      const { default: StringTuneCore, StringPositionTracker } =
        await import("@fiddle-digital/string-tune");

      stringTune = StringTuneCore.getInstance();
      stringTune.use(StringPositionTracker);
      stringTune.start(60);
    };

    init();

    // ── Watch for splash exit ────────────────────────────────────────────────
    // SplashScreen sets .preloader { display: none } in onComplete.
    // MutationObserver catches that attribute change and reveals the HUD.
    const preloader = document.querySelector(".preloader") as HTMLElement | null;

    const show = () => {
      if (hudRef.current) hudRef.current.style.opacity = "1";
    };

    if (!preloader) {
      // No splash screen in the tree — reveal immediately
      show();
      return;
    }

    const observer = new MutationObserver(() => {
      if (preloader.style.display === "none") {
        show();
        observer.disconnect();
      }
    });

    observer.observe(preloader, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
      stringTune?.stop?.();
    };
  }, []);

  return (
    <>
      <style>{`
        .pos-hud {
          position: fixed;
          bottom: 1.5rem;
          left: 1.5rem;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }

        .pos-hud-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .pos-hud-row span {
          color: #7a7a7a;
          min-width: 3.5rem;
        }

        .pos-hud-row strong {
          color: #fff;
        }

        [data-dir]::before     { content: attr(data-dir); }
        [data-val]::before     { content: attr(data-val) "px"; }
        [data-val-pct]::before { content: attr(data-val-pct) "%"; }
      `}</style>

      <div className="pos-hud" ref={hudRef}>
        <div className="pos-hud-row">
          <span>DIR</span>
          <strong data-dir />
        </div>
        <div className="pos-hud-row">
          <span>PX</span>
          <strong data-val />
        </div>
        <div className="pos-hud-row">
          <span>PCT</span>
          <strong data-val-pct />
        </div>
      </div>
    </>
  );
}