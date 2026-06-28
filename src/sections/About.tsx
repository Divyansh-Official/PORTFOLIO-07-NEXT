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
      let lastShape = -1;
      let docked = false;

      // Rounded + notched card via clip-path: path() (quadratic-curve corners
      // round the outer corners AND the top-left folder-tab notch).
      const buildPath = (sp: number) => {
        const R = sp * 40, nr = sp * 16, nw = sp * 150, nh = sp * 72;
        const pts: [number, number][] = [
          [nw, 0], [W, 0], [W, H], [0, H], [0, nh], [nw, nh],
        ];
        const radii = [nr, R, R, R, nr, nr];
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

      // ── Collapse: bg3 scales into the docked notched card ──────────────────
      // Pinned on a LIGHT dom stage (no WebGL here → no pin glitch). The shape
      // forms over the first 40% then freezes, so the rest is a pure GPU scale.
      ScrollTrigger.create({
        trigger: ".ab-collapse",
        start: "top top",
        end: "+=140%",
        pin: ".ab-collapse",
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => { W = card.offsetWidth; H = card.offsetHeight; lastShape = -1; },
        onUpdate: (self) => {
          const p = self.progress;
          prog = p;
          const e = gsap.parseEase("power2.inOut")(p);

          const shapeP = gsap.utils.clamp(0, 1, p / 0.4);
          if (shapeP !== lastShape) {
            card.style.clipPath = `path("${buildPath(shapeP)}")`;
            lastShape = shapeP;
          }
          gsap.set(card, { scale: 1 - e * 0.46 }); // 1 → 0.54

          if (p >= 0.92) docked = true;
          else if (docked) {
            gsap.to(card, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.35, ease: "power3.out" });
            docked = false;
          }
        },
      });

      // ── Magnetic cursor response (only once docked) ────────────────────────
      const onMove = (ev: MouseEvent) => {
        if (prog < 0.92) return;
        const rect = card.getBoundingClientRect();
        const dx = (ev.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (ev.clientY - (rect.top + rect.height / 2)) / rect.height;
        gsap.to(card, { x: dx * 46, y: dy * 46, rotateY: dx * 11, rotateX: -dy * 11, duration: 0.6, ease: "power3.out" });
      };
      const onLeave = () => gsap.to(card, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.7, ease: "power3.out" });
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);

      // ── About content reveals ──────────────────────────────────────────────
      gsap.from(".ab-reveal", {
        y: 44, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: ".ab-grid", start: "top 78%" },
      });
      gsap.from(".ab-stat", {
        y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: ".ab-stats", start: "top 88%" },
      });
      gsap.fromTo(".ab-rail-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".ab-grid", start: "top 75%", end: "bottom 60%", scrub: true },
      });

      return () => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <style>{`
        .about { position: relative; background: var(--bg); color: var(--ink); overflow: hidden; }

        /* Light dom pin stage — the card lands here and stays docked */
        .ab-collapse {
          position: relative;
          height: 100vh;
          width: 100%;
          background: #000;
          perspective: 1200px;
          overflow: hidden;
        }
        .hc-card {
          position: absolute;
          inset: 0;
          transform-origin: center center;
          will-change: transform;
          backface-visibility: hidden;
          filter: drop-shadow(0 38px 60px rgba(0,0,0,0.55));
        }
        .hc-card img {
          position: absolute;
          left: 0;
          bottom: 0;          /* 175svh / bottom-aligned → matches the hero canvas
                                 so the hand-off from the shader's bg3 lines up */
          width: 100%;
          height: 175svh;
          object-fit: cover;
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
        .ab-p { max-width: 56ch; color: var(--ink); opacity: 0.78; line-height: 1.7; font-size: clamp(1rem, 1.4vw, 1.18rem); margin-bottom: 1.1rem; }
        .ab-stats { display: flex; flex-wrap: wrap; gap: clamp(1.5rem, 5vw, 4rem); margin: 2.6rem 0 2.2rem; padding-top: 2rem; border-top: 1px solid var(--line); }
        .ab-stat-value { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: clamp(2.6rem, 6vw, 4.5rem); line-height: 1; color: var(--ink); }
        .ab-stat-value span { color: var(--accent); }
        .ab-stat-label { font-family: "Geist Mono", monospace; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-dim); margin-top: 0.4rem; }
        .ab-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .ab-tags span { font-family: "Geist Mono", monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-dim); padding: 0.45rem 0.85rem; border: 1px solid var(--line); border-radius: 999px; transition: border-color 0.3s ease, color 0.3s ease; }
        .ab-tags span:hover { border-color: rgba(230,0,18,0.45); color: var(--ink); }

        @media (max-width: 760px) {
          .ab-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .ab-rail { position: relative; top: 0; flex-direction: row; }
          .ab-rail-line { width: clamp(4rem, 30vw, 10rem); height: 1px; background: linear-gradient(90deg, var(--accent), transparent); transform-origin: left; }
          .ab-rail-jp { writing-mode: horizontal-tb; }
        }
      `}</style>

      <div className="ab-collapse">
        <div className="hc-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/bg3.png" alt="" />
          <div className="hc-card-content" />
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
