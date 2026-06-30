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
      const card = sectionRef.current?.querySelector(".hc-card") as HTMLElement | null;
      if (!card) return;

      let W = card.offsetWidth;
      let H = card.offsetHeight;
      let prog = 0;
      let docked = false;

      const section = sectionRef.current!;
      // Background fade: the site bg eases black → white as bg3 collapses into the
      // card. start = where in the collapse the fade begins (0 = the moment the
      // card starts forming). speed = how far up the scroll the target completes.
      // smooth = fade easing per frame — lower is silkier/slower (it glides toward
      // the target instead of snapping). This smoothing is what makes it a fade
      // animation rather than a raw per-scroll color flip.
      const BG_FADE = { start: 0.0, speed: 5.7, smooth: 0.06 };
      const bgEase = gsap.parseEase("power2.inOut");
      let bgTarget = 0;   // scroll-driven destination (0 = black, 1 = white)
      let bgCurrent = 0;  // smoothed value actually painted

      // Every frame, glide the painted background toward its scroll target so the
      // black → white change reads as a soft fade — not a hard per-scroll switch.
      const bgTick = () => {
        const diff = bgTarget - bgCurrent;
        if (Math.abs(diff) < 0.0006) return;
        bgCurrent += diff * BG_FADE.smooth;
        const v = Math.round(gsap.utils.clamp(0, 1, bgCurrent) * 255);
        section.style.setProperty("--ab-bg", `rgb(${v}, ${v}, ${v})`);
      };
      gsap.ticker.add(bgTick);

      // Rounded card via clip-path: path() — quadratic-curve rounding on the outer
      // corners, the folder-tab notch at the TOP-LEFT, and a diagonal BEVEL cut at
      // the BOTTOM-RIGHT only (top + bottom-left are left untouched).
      const buildPath = (sp: number) => {
        const R = sp * 40, nr = sp * 16;
        const nw = sp * 150, nh = sp * 72;   // top-left folder-tab notch (unchanged)
        const bv = sp * 130;                 // bottom-right bevel — diagonal corner cut
        const pts: [number, number][] = [
          [nw, 0], [W, 0],
          [W, H - bv], [W - bv, H],          // bottom-right BEVEL (diagonal)
          [0, H], [0, nh], [nw, nh],         // bottom-left → top-left notch
        ];
        const radii = [nr, R, nr, nr, R, nr, nr];
        const n = pts.length;
        let d = "";
        for (let i = 0; i < n; i++) {
          const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
          const lp = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) || 1;
          const ln = Math.hypot(next[0] - cur[0], next[1] - cur[1]) || 1;
          const r = Math.max(0, Math.min(radii[i], lp / 2, ln / 2));
          const ax = cur[0] + ((prev[0] - cur[0]) / lp) * r, ay = cur[1] + ((prev[1] - cur[1]) / lp) * r;
          const bx = cur[0] + ((next[0] - cur[0]) / ln) * r, by = cur[1] + ((next[1] - cur[1]) / ln) * r;
          d += i === 0 ? `M ${ax.toFixed(1)} ${ay.toFixed(1)} ` : `L ${ax.toFixed(1)} ${ay.toFixed(1)} `;
          d += `Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)} `;
        }
        return d + "Z";
      };

      // ── Collapse: the card SCALES DOWN; its clip shape never morphs ─────────
      // The notched-card clip is FIXED. The card starts scaled up large enough
      // that the rounded corners + folder notch sit OFF-SCREEN (so the card just
      // looks like a full-bleed rectangle), and shrinking it on scroll slides
      // those cutouts into view — they are never grown/animated, exactly like the
      // reference. START_SCALE = how zoomed/off-screen the cutouts begin (raise it
      // if any cutout peeks at the top); DOCKED_SCALE = the final docked size.
      const START_SCALE = 1.3;
      // ▼▼ DOCKED CARD SIZE — lower = smaller docked card, higher = bigger.
      const DOCKED_SCALE = 0.36;
      // Back face fills the screen at the very end (cutouts off-screen, like START).
      const END_SCALE = 1.35;
      // Dock 3D tilt (degrees): rotateX + a rotateY turn during the shrink.
      // POSITIVE y → the card tilts from the RIGHT side (right edge recedes) as it
      // shrinks — the pre-flip pose. The flip then continues from this tilt down to
      // -180 (set in the flip math), so it still turns LEFT → RIGHT.
      const TILT = { x: -7, y: 13 };

      // ── Sequence thresholds over the pinned scroll (progress 0 → 1) ──────────
      //   0 → P_SHRINK : card shrinks to the docked size (cutouts reveal) + tilts
      //   P_SHRINK → P_FLIP_A : docked hold (cursor-magnet window)
      //   P_FLIP_A → P_FLIP_B : card flips on Y, revealing the BACK face
      //   P_UP → 1 : the back face scales up to fill the screen
      // The flip range (P_FLIP_A → P_FLIP_B) is WIDE so the rotation is slow and
      // scroll-controlled rather than snappy.
      const P_SHRINK = 0.26;
      const P_FLIP_A = 0.40;
      const P_FLIP_B = 0.80;
      const P_UP     = 0.80;
      // Cursor magnet live from late-shrink through the whole docked hold.
      const MAGNET_FROM = 0.20;

      // Apply the fixed notched clip once, and re-measure/re-apply on refresh.
      const setClip = () => { card.style.setProperty("--card-clip", `path("${buildPath(1)}")`); };
      setClip();
      gsap.set(card, { scale: START_SCALE, force3D: true });

      ScrollTrigger.create({
        trigger: ".ab-collapse",
        start: "top top",
        end: "+=320%",   // longer pin: shrink + dock + flip + scale-up all happen here
        pin: ".ab-collapse",
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => { W = card.offsetWidth; H = card.offsetHeight; setClip(); },
        onUpdate: (self) => {
          const p = self.progress;
          prog = p;
          const ease = gsap.parseEase("power2.inOut");
          const flipEase = gsap.parseEase("sine.inOut");   // gentlest ease → smooth, controlled flip

          // ── SCALE: shrink → docked · hold · scale-up to fill the screen ──────
          let scale: number;
          if (p <= P_SHRINK) {
            scale = START_SCALE - ease(p / P_SHRINK) * (START_SCALE - DOCKED_SCALE);
          } else if (p < P_UP) {
            scale = DOCKED_SCALE;
          } else {
            scale = DOCKED_SCALE + ease((p - P_UP) / (1 - P_UP)) * (END_SCALE - DOCKED_SCALE);
          }

          // ── ROTATE Y: dock tilt (0 → TILT.y) flows into the flip, turning the
          //    card LEFT → RIGHT to -180° on a smooth, scroll-controlled ease ─────
          let rotY: number;
          if (p <= P_SHRINK) rotY = ease(p / P_SHRINK) * TILT.y;        // tilt eases in
          else if (p < P_FLIP_A) rotY = TILT.y;                          // docked tilt holds
          else if (p < P_FLIP_B) rotY = TILT.y + flipEase((p - P_FLIP_A) / (P_FLIP_B - P_FLIP_A)) * (-180 - TILT.y);
          else rotY = -180;                                              // back fully faces us

          // ── TILT (rotateX): in during shrink, hold, out as it fills the screen ─
          let tiltX: number;
          if (p <= P_SHRINK) tiltX = ease(p / P_SHRINK) * TILT.x;
          else if (p < P_UP) tiltX = TILT.x;
          else tiltX = TILT.x * (1 - ease((p - P_UP) / (1 - P_UP)));

          gsap.set(card, { scale, rotateX: tiltX, rotateY: rotY, force3D: true });

          // black → white fade TARGET (bgTick eases the painted bg toward it)
          const bgP = gsap.utils.clamp(0, 1, (p - BG_FADE.start) * BG_FADE.speed);
          bgTarget = bgEase(bgP);

          // cursor magnet only in the dock window (after shrink, before the flip)
          const magnetOn = p >= MAGNET_FROM && p < P_FLIP_A;
          if (magnetOn) docked = true;
          else if (docked) {
            gsap.to(card, { x: 0, y: 0, duration: 0.35, ease: "power3.out" });
            docked = false;
          }
        },
      });

      // ── Magnetic cursor response (only in the docked window, before the flip) ─
      const onMove = (ev: MouseEvent) => {
        if (prog < MAGNET_FROM || prog >= P_FLIP_A) return;
        const rect = card.getBoundingClientRect();
        const dx = (ev.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (ev.clientY - (rect.top + rect.height / 2)) / rect.height;
        gsap.to(card, { x: dx * 46, y: dy * 46, duration: 0.6, ease: "power3.out" });
      };
      const onLeave = () => gsap.to(card, { x: 0, y: 0, duration: 0.7, ease: "power3.out" });
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);

      // ── About content reveals ──────────────────────────────────────────────
      // start values are early ("top 90/95%") so the entrance fires as soon as the
      // grid scrolls in — the pinned collapse above must not leave them hidden.
      gsap.from(".ab-reveal", {
        y: 44, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: ".ab-grid", start: "top 90%" },
      });
      gsap.from(".ab-stat", {
        y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: ".ab-stats", start: "top 95%" },
      });
      gsap.fromTo(".ab-rail-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".ab-grid", start: "top 85%", end: "bottom 60%", scrub: true },
      });

      // The pinned collapse inserts a tall spacer that shifts everything below it,
      // so ScrollTrigger's first position read for these reveals is stale (they
      // stayed hidden on desktop). Recalc once layout settles so they fire.
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(() => requestAnimationFrame(refresh));
      window.addEventListener("load", refresh);

      return () => {
        gsap.ticker.remove(bgTick);
        window.removeEventListener("load", refresh);
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <style>{`
        /* --ab-bg is driven from black → white by the collapse scroll (set in JS).
           Light-theme inks below so the content stays readable once it's white. */
        .about {
          --ab-bg:   #000;
          --ab-ink:  #16161c;
          --ab-dim:  #6b6b73;
          --ab-line: rgba(0, 0, 0, 0.12);
          position: relative;
          background: var(--ab-bg);
          color: var(--ab-ink);
          overflow: hidden;
        }

        /* Light dom pin stage — the card lands here and stays docked */
        .ab-collapse {
          position: relative;
          height: 100vh;
          width: 100%;
          background: var(--ab-bg);
          perspective: 1200px;
          overflow: hidden;
        }
        .hc-card {
          /* --vid-scale: zoom the video from its center. 1 = whole frame (with
             letterbox bars); raise it (e.g. 1.25) to fill the card / crop the bars. */
          --vid-scale: 1.25;
          position: absolute;
          inset: 0;
          transform-origin: center center;
          transform-style: preserve-3d;   /* front + back faces live in 3D for the flip */
          will-change: transform;
        }
        /* Two faces of the card: front = the video card, back = the new bg3 section.
           backface-visibility hides whichever face is turned away during the flip. */
        .hc-front, .hc-back {
          position: absolute;
          inset: 0;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .hc-back { transform: rotateY(180deg); }
        .hc-back-clip {
          position: absolute;
          inset: 0;
          clip-path: var(--card-clip, none);   /* same notched/bevel shape as the front */
          overflow: hidden;
          background: #0b0b12;
        }
        .hc-back-clip img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Shadow on its OWN solid shape, NOT on the card — so the browser never
           re-rasterizes the playing video to recompute the drop-shadow each frame
           (that was the scale-up/down glitch). Both layers share --card-clip. */
        .hc-shadow {
          position: absolute;
          inset: 0;
          clip-path: var(--card-clip, none);
          background: #0b0b12;
          filter: drop-shadow(0 38px 60px rgba(0,0,0,0.55));
          will-change: transform;
          backface-visibility: hidden;
        }
        .hc-clip {
          position: absolute;
          inset: 0;
          z-index: 1;
          clip-path: var(--card-clip, none);
          overflow: hidden;
          backface-visibility: hidden;
        }
        .hc-card video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;   /* show the WHOLE video frame — never crop it */
          transform: scale(var(--vid-scale));
          transform-origin: center center;
          will-change: transform;
          backface-visibility: hidden;
          display: block;
        }
        .hc-card-content { position: absolute; inset: 0; z-index: 2; pointer-events: none; }

        .ab-grid { max-width: 1500px; margin: 0 auto; padding: clamp(5rem, 13vh, 12rem) clamp(1.25rem, 5vw, 6rem); display: grid; grid-template-columns: auto 1fr; gap: clamp(2rem, 6vw, 6rem); align-items: start; }
        .ab-rail { display: flex; gap: 1.2rem; align-items: flex-start; position: sticky; top: 14vh; }
        .ab-rail-line { width: 1px; height: clamp(8rem, 20vh, 16rem); background: linear-gradient(var(--accent), transparent); transform-origin: top; }
        .ab-rail-jp { font-family: var(--font-jp), serif; writing-mode: vertical-rl; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: 0.15em; color: transparent; -webkit-text-stroke: 1px rgba(230,0,18,0.55); }
        .ab-kicker { display: inline-flex; align-items: center; gap: 0.6rem; font-family: "Geist Mono", monospace; font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--accent-2); }
        .ab-kicker::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent); }
        .ab-lead { font-family: "Instrument Serif", serif; font-size: clamp(1.7rem, 3.6vw, 3.2rem); line-height: 1.18; letter-spacing: -0.01em; margin: 1.2rem 0 1.8rem; max-width: 20ch; }
        .ab-lead em { font-style: italic; color: var(--accent-2); }
        .ab-p { max-width: 56ch; color: var(--ab-ink); opacity: 0.72; line-height: 1.7; font-size: clamp(1rem, 1.4vw, 1.18rem); margin-bottom: 1.1rem; }
        .ab-stats { display: flex; flex-wrap: wrap; gap: clamp(1.5rem, 5vw, 4rem); margin: 2.6rem 0 2.2rem; padding-top: 2rem; border-top: 1px solid var(--ab-line); }
        .ab-stat-value { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: clamp(2.6rem, 6vw, 4.5rem); line-height: 1; color: var(--ab-ink); }
        .ab-stat-value span { color: var(--accent); }
        .ab-stat-label { font-family: "Geist Mono", monospace; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ab-dim); margin-top: 0.4rem; }
        .ab-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .ab-tags span { font-family: "Geist Mono", monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ab-dim); padding: 0.45rem 0.85rem; border: 1px solid var(--ab-line); border-radius: 999px; transition: border-color 0.3s ease, color 0.3s ease; }
        .ab-tags span:hover { border-color: rgba(230,0,18,0.45); color: var(--ab-ink); }

        @media (max-width: 760px) {
          .ab-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .ab-rail { position: relative; top: 0; flex-direction: row; }
          .ab-rail-line { width: clamp(4rem, 30vw, 10rem); height: 1px; background: linear-gradient(90deg, var(--accent), transparent); transform-origin: left; }
          .ab-rail-jp { writing-mode: horizontal-tb; }
        }
      `}</style>

      <div className="ab-collapse">
        <div className="hc-card">
          {/* FRONT — the video card that shrinks/docks */}
          <div className="hc-front">
            <div className="hc-shadow" />
            <div className="hc-clip">
              <video
                src="/videos/bg_hero.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
            <div className="hc-card-content" />
          </div>

          {/* BACK — the new section revealed by the flip (bg3 image for now) */}
          <div className="hc-back">
            <div className="hc-back-clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/bg3.png" alt="" />
            </div>
          </div>
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
