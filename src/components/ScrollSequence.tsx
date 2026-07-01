"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// ScrollSequence — the IVRESS / Apple-style "scroll-scrubbed cinematic".
//
// The camera fly-through is PRE-RENDERED (Blender / C4D / a video); scroll position
// maps to the playback frame/time. Scrolling scrubs a timeline — it is NOT a live
// 3D camera.
//
// idleSpeed makes it a HYBRID (like IVRESS): while the section is on screen the
// footage drifts forward slowly on its own, and scrolling adds to that at your
// scroll speed → still when idle = slow drift, scrolling = moves at scroll speed.
// idleSpeed = 0 → pure scrub (position-locked to scroll).
//
// Two source modes:
//   • "frames" — numbered image sequence drawn to <canvas>. Buttery + reliable;
//     the drift is perfectly smooth. Needs frames exported first (ffmpeg).
//   • "video"  — a <video>. Zero prep, but seeking lands on keyframes, so smooth
//     scrubbing needs a dense-keyframe encode (see notes). In idle mode the drift
//     uses NATIVE playback (smooth) and scroll bumps the time on top.
//
// ScrollTrigger pins the section and drives it; your hero already wires
// `lenis.on("scroll", ScrollTrigger.update)`, so it stays synced to Lenis.
// ─────────────────────────────────────────────────────────────────────────────

type FramesSource = {
  kind: "frames";
  count: number;                    // total number of frames
  src: (frame: number) => string;   // 1-based frame number → url
};
type VideoSource = {
  kind: "video";
  src: string;                      // mp4 / webm url
};

type Props = {
  source: FramesSource | VideoSource;
  /** Scroll distance of the scrub, as a % of the viewport. Higher = slower. */
  scroll?: string;
  /**
   * Ambient auto-advance while the section is in view, as a fraction of the whole
   * sequence PER SECOND (e.g. 0.04 ≈ plays through in 25s if you never scroll).
   * 0 = pure scroll-scrub, no drift.
   */
  idleSpeed?: number;
  className?: string;
  /** Overlay content (headings, captions) — sits fixed over the cinematic. */
  children?: React.ReactNode;
};

export default function ScrollSequence({
  source,
  scroll = "250%",
  idleSpeed = 0,
  className = "",
  children,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Pin the config so inline props don't rebuild the trigger — mount-once setup.
  const cfg = useRef({ source, scroll, idleSpeed });
  cfg.current = { source, scroll, idleSpeed };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { source, scroll, idleSpeed } = cfg.current;
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const ctx = gsap.context(() => {
      // ── FRAMES MODE ──────────────────────────────────────────────────────
      if (source.kind === "frames") {
        const canvas = canvasRef.current!;
        const c = canvas.getContext("2d")!;
        const count = source.count;

        // Preload every frame; repaint the current target as each arrives.
        const imgs: HTMLImageElement[] = new Array(count);
        for (let i = 0; i < count; i++) {
          const img = new Image();
          img.decoding = "async";
          img.src = source.src(i + 1);                 // frames are 1-based (frame_0001…)
          img.onload = () => { if (Math.abs(i - lastIdx) < 3) render(true); };
          imgs[i] = img;
        }

        const ready = (i: number): HTMLImageElement | null => {
          const ok = (im?: HTMLImageElement) => im && im.complete && im.naturalWidth > 0;
          if (ok(imgs[i])) return imgs[i];
          for (let d = 1; d < count; d++) {
            if (ok(imgs[i - d])) return imgs[i - d]!;
            if (ok(imgs[i + d])) return imgs[i + d]!;
          }
          return null;
        };

        const paint = (i: number) => {
          const img = ready(i);
          if (!img) return;
          const cw = canvas.clientWidth, ch = canvas.clientHeight;
          const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
          const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
          c.clearRect(0, 0, cw, ch);
          c.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        };

        let playhead = 0, lastP = 0, active = false, lastIdx = -1;
        const render = (force = false) => {
          const idx = Math.round(clamp01(playhead) * (count - 1));
          if (idx !== lastIdx || force) { lastIdx = idx; paint(idx); }
        };

        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = canvas.clientWidth * dpr;
          canvas.height = canvas.clientHeight * dpr;
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
          render(true);
        };
        resize();
        window.addEventListener("resize", resize);

        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: `+=${scroll}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => { active = self.isActive; },
          onUpdate: (self) => {
            playhead = clamp01(playhead + (self.progress - lastP));   // scroll delta = speed
            lastP = self.progress;
            render();
          },
        });

        // Idle drift + steady repaint via the shared ticker.
        const tick = (_t: number, dt: number) => {
          if (active && idleSpeed) { playhead = clamp01(playhead + idleSpeed * (dt / 1000)); render(); }
        };
        gsap.ticker.add(tick);

        return () => { window.removeEventListener("resize", resize); gsap.ticker.remove(tick); };
      }

      // ── VIDEO MODE ───────────────────────────────────────────────────────
      const video = videoRef.current!;
      let dur = 0, lastP = 0, active = false;
      const setRate = () => { if (idleSpeed && dur) video.playbackRate = Math.max(0.05, idleSpeed * dur); };
      const onMeta = () => { dur = video.duration || 0; if (active) setRate(); };
      video.addEventListener("loadedmetadata", onMeta);

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: `+=${scroll}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          active = self.isActive;
          if (!idleSpeed) return;
          if (active) { setRate(); video.play().catch(() => {}); } else video.pause();
        },
        onUpdate: (self) => {
          if (!dur) return;
          if (idleSpeed) {
            // Native playback provides the smooth drift; scroll BUMPS the time on top.
            const t = video.currentTime + (self.progress - lastP) * dur;
            video.currentTime = Math.min(dur, Math.max(0, t));
          } else {
            video.currentTime = self.progress * dur;                 // pure scrub
          }
          lastP = self.progress;
        },
      });

      return () => video.removeEventListener("loadedmetadata", onMeta);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className={`scroll-seq ${className}`}>
      <style>{`
        .scroll-seq { position: relative; width: 100%; height: 100vh; overflow: hidden; background: #000; }
        .scroll-seq-media { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .scroll-seq video.scroll-seq-media { object-fit: cover; }
        .scroll-seq-overlay { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
      `}</style>

      {source.kind === "frames" ? (
        <canvas ref={canvasRef} className="scroll-seq-media" />
      ) : (
        <video
          ref={videoRef}
          className="scroll-seq-media"
          src={source.src}
          muted
          playsInline
          preload="auto"
        />
      )}

      <div className="scroll-seq-overlay">{children}</div>
    </section>
  );
}
