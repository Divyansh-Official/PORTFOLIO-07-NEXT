"use client";

// Technical "grid lines" frame on the screen border (inset rounded border + a left
// vertical line + a crosshair + tick marks), like the KPR reference. It's a fixed
// overlay below the navbar (so the nav reads as "inside" the frame). Visibility is
// driven by the `grid-on` class on <html>, toggled by the About collapse once the
// card has shrunk to its docked size (see About.tsx). It fades in/out via CSS.
export default function GridFrame() {
  return (
    <div className="grid-frame" aria-hidden="true">
      <style>{`
        .grid-frame {
          position: fixed;
          inset: 0;
          z-index: 900;            /* above content, below the navbar (1000) */
          pointer-events: none;
          opacity: 0;
          /* difference blend → the lines auto-invert against whatever is behind,
             so they stay visible on white OR black (or any) background. */
          mix-blend-mode: difference;
          transition: opacity 1s cubic-bezier(0.25, 1, 0.5, 1);
        }
        :root.grid-on .grid-frame { opacity: 1; }

        .grid-frame {
          --gf-inset: clamp(14px, 1.5vw, 26px);
          --gf-col:   clamp(78px, 7vw, 116px);   /* left vertical line offset */
          --gf-color: rgba(255, 255, 255, 0.55);
          --gf-mark:  rgba(255, 255, 255, 0.9);
        }

        .gf-border {
          position: absolute;
          inset: var(--gf-inset);
          border: 1px solid var(--gf-color);
          border-radius: 16px;
        }
        .gf-vline {
          position: absolute;
          top: var(--gf-inset);
          bottom: var(--gf-inset);
          left: var(--gf-col);
          width: 1px;
          background: var(--gf-color);
        }
      `}</style>

      <div className="gf-border" />
      <div className="gf-vline" />
    </div>
  );
}
