import BasicNavigationBar from "../components/nav/navBar";
import info from "../data/information.json";
import icons from "../data/icons.json";
import Introduction from "./Introduction";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useHeroAnimation } from "../hooks/useHeroAnimation";
import { use3dElement } from "../hooks/use3dElement";
import { useFluidEffect } from "../hooks/useFluidEffect";

// ─── Liquid-glass button ──────────────────────────────────────────────────────
// SVG feDisplacementMap distortion + specular highlight that tracks the cursor.
// Renders an <a> when `href` is provided, otherwise a <button>.
const GlassButton = ({
  children,
  href,
  icon,
}: {
  children: React.ReactNode;
  href?: string;
  icon?: string;
}) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const specular = e.currentTarget.querySelector(".glass-specular") as HTMLElement;
    if (specular) {
      specular.style.background = `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(255,255,255,0.18) 0%,
        rgba(230,0,18,0.10) 30%,
        rgba(255,255,255,0) 60%
      )`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const filter = document.querySelector("#glass-distortion feDisplacementMap");
    if (filter) filter.setAttribute("scale", "77");

    const specular = e.currentTarget.querySelector(".glass-specular") as HTMLElement;
    if (specular) specular.style.background = "none";
  };

  const inner = (
    <>
      <div className="glass-filter" />
      <div className="glass-overlay" />
      <div className="glass-specular" />
      <div className="glass-content">
        {icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="glass-icon" src={icon} alt="" aria-hidden="true" />
        )}
        <span>{children}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        className="glass-button"
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      className="glass-button"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {inner}
    </button>
  );
};

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const rightNameRef = useRef<HTMLHeadingElement>(null);
  const darkSloganRef = useRef<HTMLParagraphElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const canvasRefInteractiveBG = useFluidEffect();

  const [clipPath, setClipPath] = useState<string | undefined>(undefined);
  const [heroHeadlineText, setHeroHeadlineText] = useState(info.slogan);

  // Scroll-driven 3D katana — tuned initial transform + scroll animation.
  use3dElement(
    "container3D",
    {
      position: { x: 1.6, y: 0.75, z: 0 },
      rotation: { x: 10, y: -60, z: -79 },
      scale: 0.75,
    },
    {
      speed: 0.71,
      rotation: { x: 20, y: 360.5, z: 390 },
      position: { x: -2.25, y: -2, z: 0 },
    }
  );

  // ── SVG clip-path notch cut around the nav (desktop only) ────────────────────
  useEffect(() => {
    const updateClipPath = () => {
      const heroEl = heroRef.current;
      const navEl = document.querySelector(".nav-links") as HTMLElement;
      const logoEl = document.querySelector(".nav-logo") as HTMLElement;

      if (!heroEl || !navEl || !logoEl) return;

      const W = heroEl.offsetWidth;
      const H = heroEl.offsetHeight;
      const R = 16;

      // Uniform gap: the nav cut-out sits GAP px from the pills on the inner
      // sides AND the bottom, so the spacing reads equal all the way around.
      // (Matches the navbar's own 0.75rem ≈ 12px padding on the outer sides/top.)
      const GAP = 12;

      const heroRect = heroEl.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();

      // Shared bottom edge for both notches — GAP below the lower of the pills.
      const cutoutY =
        Math.max(navRect.bottom, logoRect.bottom) - heroRect.top + GAP;

      const cutoutRightX = navRect.left - heroRect.left - GAP;
      const cutoutRightY = cutoutY;

      const cutoutLeftX = logoRect.right - heroRect.left + GAP;
      const cutoutLeftY = cutoutY;

      if (window.innerWidth < 1000) {
        setClipPath(undefined);
        return;
      }

      const path = `path("M ${cutoutLeftX + R} 0 L ${cutoutRightX - R} 0 A ${R} ${R} 0 0 1 ${cutoutRightX} ${R} L ${cutoutRightX} ${cutoutRightY - R} A ${R} ${R} 0 0 0 ${cutoutRightX + R} ${cutoutRightY} L ${W - R} ${cutoutRightY} A ${R} ${R} 0 0 1 ${W} ${cutoutRightY + R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L ${R} ${H} A ${R} ${R} 0 0 1 0 ${H - R} L 0 ${cutoutLeftY + R} A ${R} ${R} 0 0 1 ${R} ${cutoutLeftY} L ${cutoutLeftX - R} ${cutoutLeftY} A ${R} ${R} 0 0 0 ${cutoutLeftX} ${cutoutLeftY - R} L ${cutoutLeftX} ${R} A ${R} ${R} 0 0 1 ${cutoutLeftX + R} 0 Z")`;
      setClipPath(path);
    };

    updateClipPath();

    let observer: ResizeObserver | null = null;
    const navElObserver = document.querySelector(".nav-links");
    const logoElObserver = document.querySelector(".nav-logo");

    if (window.ResizeObserver) {
      observer = new ResizeObserver(updateClipPath);
      if (navElObserver) observer.observe(navElObserver);
      if (logoElObserver) observer.observe(logoElObserver);
    }
    window.addEventListener("resize", updateClipPath);

    return () => {
      window.removeEventListener("resize", updateClipPath);
      if (observer) observer.disconnect();
    };
  }, []);

  // ── Scramble-in slogan (decodes once the hero scrolls into view) ─────────────
  useEffect(() => {
    const section = heroRef.current;
    const headline = headlineRef.current;
    const finalText = info.slogan;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    let revealInterval: number | null = null;
    let iteration = 0;

    if (!section || !headline) return;

    const startReveal = () => {
      revealInterval = window.setInterval(() => {
        setHeroHeadlineText(
          finalText
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration) return finalText[index];
              return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("")
        );

        if (iteration >= finalText.length) {
          if (revealInterval) window.clearInterval(revealInterval);
          setHeroHeadlineText(finalText);
        }

        iteration += 0.5;
      }, 32);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startReveal();
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (revealInterval) window.clearInterval(revealInterval);
    };
  }, []);

  // ── Right-side katakana name reveals char-by-char with scroll (over bg2) ─────
  // Glyphs are real .rn-char spans hidden by CSS (opacity:0) from the start, so
  // they can never flash in. This just resolves them as you scroll, driven
  // straight off scroll position (the same signal as the bg2 reveal).
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    type Group = { o: ((v: number) => void)[]; y: ((v: number) => void)[]; n: number; rise: number };
    const makeGroup = (root: HTMLElement | null, sel: string, rise: number): Group | null => {
      const chars = root ? Array.from(root.querySelectorAll<HTMLElement>(sel)) : [];
      if (!chars.length) return null;
      return {
        o: chars.map((c) => gsap.quickSetter(c, "opacity") as (v: number) => void),
        y: chars.map((c) => gsap.quickSetter(c, "y", "px") as (v: number) => void),
        n: chars.length,
        rise,
      };
    };
    const groups = [
      makeGroup(rightNameRef.current, ".rn-char", 26),
      makeGroup(darkSloganRef.current, ".ds-char", 14),
    ].filter(Boolean) as Group[];
    if (!groups.length) return;

    const update = () => {
      const maxScroll = Math.max(1, heroEl.offsetHeight - window.innerHeight);
      const raw = window.scrollY / maxScroll; // 0..1 over the hero scroll
      // DELAY: stays hidden until START of the scroll, then resolves over SPAN
      // (first → last glyph mapped across that window).
      const START = 0.6;  // ← nothing appears until 60% scrolled (tune the delay)
      const SPAN = 0.2;   // ← then resolves over the next 20%
      const progress = Math.min(Math.max((raw - START) / SPAN, 0), 1);
      for (const g of groups) {
        for (let i = 0; i < g.n; i++) {
          const cp = i / g.n;
          const ncp = (i + 1) / g.n;
          const v = progress >= ncp ? 1 : progress >= cp ? (progress - cp) / (ncp - cp) : 0;
          g.o[i](v);
          g.y[i]((1 - v) * g.rise);
        }
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // ── Entrance: statement words rise + buttons fade in once the splash clears ──
  useEffect(() => {
    const statement = statementRef.current;
    const ctaWrap = ctaWrapRef.current;
    if (!statement || !ctaWrap) return;

    const lines = Array.from(statement.querySelectorAll<HTMLElement>(".hs-line"));
    const btns = Array.from(ctaWrap.querySelectorAll<HTMLElement>(".glass-button"));

    // Hide them up-front (behind the splash) so they never flash before entering.
    gsap.set(lines, { yPercent: 120, opacity: 0 });
    gsap.set(btns, { y: 26, opacity: 0 });

    let played = false;
    const playEntrance = () => {
      if (played) return;
      played = true;
      // REVEAL: each word rises out of its mask + fades in, staggered.
      gsap.timeline()
        .to(lines, { yPercent: 0, opacity: 1, duration: 1.15, ease: "power4.out", stagger: 0.14 })
        .to(btns, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.12 }, "-=0.7");
    };

    // Fire when the splash signals it's gone (or immediately if it already did).
    const w = window as Window & { __heroSplashDone?: boolean };
    if (w.__heroSplashDone) playEntrance();
    else window.addEventListener("splash:complete", playEntrance, { once: true });
    // Safety nets so the reveal can never be missed: first scroll, or a timeout.
    window.addEventListener("scroll", playEntrance, { once: true, passive: true });
    const fallback = window.setTimeout(playEntrance, 10000);

    return () => {
      window.removeEventListener("splash:complete", playEntrance);
      window.removeEventListener("scroll", playEntrance);
      window.clearTimeout(fallback);
    };
  }, []);

  // ── Scroll: the statement drifts up + fades as you scroll through the hero ────
  useEffect(() => {
    const heroEl = heroRef.current;
    const statement = statementRef.current;
    if (!heroEl || !statement) return;

    const setY = gsap.quickSetter(statement, "y", "px") as (v: number) => void;
    const setO = gsap.quickSetter(statement, "opacity") as (v: number) => void;
    const onScroll = () => {
      const max = Math.max(1, heroEl.offsetHeight - window.innerHeight);
      const p = Math.min(window.scrollY / max, 1);
      setY(-p * 150);                       // parallax drift upward as you scroll
      setO(Math.max(0, 1 - p * 1.8));       // fade out before the right name appears
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useHeroAnimation(heroRef, canvasRef, contentRef);

  return (
    <section className="hero" ref={heroRef}>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/ica-rubrik-black');

        @property --cut {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        .hero {
          --base-100: #ebf5df;
          --base-200: #fff;
          --base-300: #000;
        }
        .hero img { width: 100%; height: 100%; object-fit: cover; }
        .hero h1, .hero h2 {
          text-transform: uppercase;
          font-family: "Instrument Serif", sans-serif;
          font-weight: 500;
          line-height: 0.9;
        }
        .hero h1 { font-size: clamp(4rem, 7.5vw, 10rem); }
        .hero h2 { font-size: clamp(2.5rem, 4.5vw, 5rem); }
        .hero p { font-family: "Instrument Sans", sans-serif; font-size: 1.125rem; font-weight: 400; }
        .hero {
          position: relative;
          width: 100%;
          height: 175svh;
          color: var(--base-200);
          overflow: hidden;
        }
        .hero-img { width: 100%; height: 100%; position: absolute; inset: 0; top: -150px; }
        .hero-header {
          position: absolute;
          width: 100%;
          height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .header-name {
          position: absolute;
          left: 5%;
          top: 45px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
        }

        .header-name h1 {
          font-family: var(--font-jp), 'ICA Rubrik', 'Meiryo', sans-serif;
          font-weight: 800;
          font-size: clamp(4rem, 12vh, 12rem);
          color: transparent;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.85);
          writing-mode: vertical-rl;
          text-orientation: upright;
          line-height: 0.85;
          letter-spacing: -0.05em;
          margin: 0;
          white-space: nowrap;

          --glow-size: 16px;
          --glow-color: rgba(230, 0, 18, 0.55);
          filter: drop-shadow(0 0 var(--glow-size) var(--glow-color))
                  drop-shadow(0 0 calc(var(--glow-size) * 2) var(--glow-color));
          transition: filter 0.3s ease;
        }
        .header-name h1:hover {
          --glow-size: 22px;
          --glow-color: rgba(230, 0, 18, 0.9);
        }

        /* Same name mirrored to the right — anchored in the LOWER hero, over bg2,
           rises + resolves with scroll (not in the parallaxing header) */
        .header-name-right {
          left: auto;
          right: 5%;
          top: auto;
          bottom: 0;
          height: 125svh;
          justify-content: flex-end;
        }
        /* Right name glows PURPLE (the left one stays crimson) */
        .header-name-right h1 {
          --glow-color: rgba(150, 80, 255, 0.6);
        }
        .header-name-right h1:hover {
          --glow-color: rgba(150, 80, 255, 0.95);
        }
        .header-name-right h1 .rn-char {
          display: inline-block;
          opacity: 0;                 /* hidden until the scroll reveal — never flashes in */
          will-change: opacity, transform;
        }

        @media (max-width: 1000px) {
          .header-name { left: 50%; transform: translateX(-50%); top: 24px; }
          .header-name h1 { -webkit-text-stroke-width: 1.5px; }
          .header-name-right { display: none; }
        }

        /* Contact stacked directly below Hire Me, both the same width.
           ▼ POSITION KNOBS — move the whole pair:
             --cta-x  horizontal  (negative = left,  positive = right)
             --cta-y  vertical    (positive = down,  negative = up) */
        .engagment-button {
          --cta-x: -17vw;
          --cta-y: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.7rem;
          z-index: 10;
          transform: translate(var(--cta-x), var(--cta-y));
        }
        .engagment-button .glass-button {
          width: clamp(150px, 11vw, 178px);   /* narrower breadth */
          padding: 10px 18px;
          justify-content: center;
        }

        .glass-button {
          --bg-color: rgba(255, 255, 255, 0.22);
          --highlight: rgba(255, 255, 255, 0.7);
          --text: #ffffff;
          position: relative;
          padding: 12px 26px;
          border: 1px solid rgba(230, 0, 18, 0.35);
          border-radius: 999px;
          cursor: pointer;
          overflow: hidden;
          background: transparent;
          transition: transform 0.2s ease, border-color 0.2s ease;
          outline: none;
          text-decoration: none;
          display: inline-flex;
        }
        .glass-button:hover { transform: scale(1.05); border-color: var(--accent); }
        .glass-button:active { transform: scale(0.95); }

        .glass-filter, .glass-overlay, .glass-specular {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
        }
        .glass-filter {
          z-index: 1;
          backdrop-filter: blur(4px);
          filter: url(#glass-distortion) saturate(120%) brightness(1.15);
        }
        .glass-overlay { z-index: 2; background: var(--bg-color); }
        .glass-specular { z-index: 3; box-shadow: inset 1px 1px 1px var(--highlight); transition: background 0.1s ease; }
        .glass-content {
          position: relative;
          z-index: 4;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text);
          font-family: "Instrument Sans", sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.02em;
        }
        /* Scoped selector (.glass-content .glass-icon) so it out-specifies the
           global ".hero img { width:100% }" rule that was stretching the icon.
           --cta-icon is the size knob for the button icons. */
        .glass-content .glass-icon {
          --cta-icon: 1.05em;
          width: var(--cta-icon);
          height: var(--cta-icon);
          object-fit: contain;
          display: block;
          flex: none;
        }

        .hero-canvas { position: absolute; bottom: 0; width: 100%; height: 100%; pointer-events: none; }
        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: clip-path 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .container3D {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 100;
          pointer-events: none;
        }

        .heroSlogan {
          font-family: var(--font-anurati), "Geist Mono", monospace;
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          letter-spacing: 0.2em;
          font-size: clamp(0.85rem, 1.5vw, 1.5rem);
          color: #fff;
          text-shadow: 0 0 18px rgba(230, 0, 18, 0.5);
          white-space: nowrap;
        }

        /* DARK ZONE slogan — same look as .heroSlogan but PURPLE, anchored higher
           so it sits over the bg2 shader; resolves char-by-char with scroll. */
        .heroSloganDark {
          font-family: var(--font-anurati), "Geist Mono", monospace;
          position: absolute;
          left: 50%;
          bottom: 32svh;
          transform: translateX(-50%);
          text-align: center;
          letter-spacing: 0.2em;
          font-size: clamp(0.85rem, 1.5vw, 1.5rem);
          color: #fff;
          text-shadow: 0 0 18px rgba(150, 80, 255, 0.65);
          white-space: nowrap;
          z-index: 5;
          pointer-events: none;
        }
        .heroSloganDark .ds-char {
          display: inline-block;
          opacity: 0;                 /* hidden until the scroll reveal — never flashes in */
          will-change: opacity, transform;
        }
        @media (max-width: 1000px) {
          .heroSloganDark { display: none; }
        }

        /* "KEEP PROTECT REIMAGINE" statement — sits ON the main background (under
           the bg2 dissolve, no positive z-index), right-aligned lower-right.
           Letters are stroke-only outlines whose INSIDE reveals the bg1 image.
           --statement-size = resize knob, --statement-font = swap the typeface. */
        .hero-statement {
          --statement-size: clamp(2.6rem, 7vw, 8rem);
          --statement-font: 'ICA Rubrik', 'Anton', 'Barlow Condensed', sans-serif;
          position: absolute;
          right: 4%;
          bottom: 50%;
          text-align: right;
          pointer-events: none;
          font-family: var(--statement-font);
          font-weight: 800;
          text-transform: uppercase;
          font-size: var(--statement-size);
          line-height: 0.92;
          letter-spacing: -0.01em;

          /* Glyph fill is fully transparent, so the ACTUAL hero background (the live
             fluid canvas directly behind) shows through the letters — no image is
             used. Only the stroke outline is drawn. */
          color: transparent;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1.7px rgba(255, 255, 255, 0.92);

          will-change: transform, opacity;
        }
        .hero-statement .hs-mask { display: block; overflow: hidden; }
        .hero-statement .hs-line { display: block; will-change: transform; }
        @media (max-width: 700px) {
          .hero-statement { --statement-size: clamp(2rem, 12vw, 3.4rem); right: 6%; bottom: 24%; -webkit-text-stroke-width: 1.1px; }
        }
      `}</style>

      <BasicNavigationBar />

      <svg style={{ display: "none" }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      <div className="hero-bg" style={clipPath ? { clipPath } : {}}>
        <canvas
          ref={canvasRefInteractiveBG}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          data-sizes="100vw"
          data-priority="true"
          data-quality={75}
        />

        <div className="hero-header">
          <div className="header-name">
            <h1>{info.creativeFirstName}</h1>
          </div>

          <div className="engagment-button" ref={ctaWrapRef}>
            <GlassButton href={info.ctaPrimary.href} icon={icons.hire}>{info.ctaPrimary.label}</GlassButton>
            <GlassButton href={info.ctaSecondary.href} icon={icons.contact}>{info.ctaSecondary.label}</GlassButton>
          </div>

          <p className="heroSlogan" ref={headlineRef} aria-label={info.slogan}>
            {heroHeadlineText}
          </p>

          {/* KEEP PROTECT REIMAGINE — on the MAIN background (this header layer,
              under the bg2 dissolve). Stroke-outline letters reveal the bg1 image;
              rises in after the splash and drifts/fades with scroll. */}
          <div className="hero-statement" ref={statementRef} aria-label={info.heroStatement.join(" ")}>
            {info.heroStatement.map((word, i) => (
              <span className="hs-mask" key={i}>
                <span className="hs-line">{word}</span>
              </span>
            ))}
          </div>
        </div>

        <canvas className="hero-canvas" ref={canvasRef}></canvas>

        {/* Same name, right side — anchored OVER the bg2 canvas (rendered after it),
            rises + dissolves in with scroll, like the old Introduction text */}
        <div className="header-name header-name-right">
          <h1 ref={rightNameRef} aria-label={info.creativeLastName}>
            {Array.from(info.creativeLastName).map((ch, i) => (
              <span className="rn-char" key={i}>{ch}</span>
            ))}
          </h1>
        </div>

        {/* DARK ZONE slogan — over bg2, resolves char-by-char with scroll like the right name */}
        <p className="heroSloganDark" ref={darkSloganRef} aria-label={info.slogan2}>
          {Array.from(info.slogan2).map((ch, i) => (
            <span className="ds-char" key={i}>{ch === " " ? " " : ch}</span>
          ))}
        </p>

        {/* Scroll-driven 3D katana — host element the use3dElement hook mounts into */}
        {/* <div id="container3D" className="container3D" /> */}

        {/* Dissolve-shader reveal of the "Introduction" headline */}
        <Introduction contentRef={contentRef} />
      </div>
    </section>
  );
}
