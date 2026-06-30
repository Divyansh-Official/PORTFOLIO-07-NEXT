"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import info from "../data/information.json";
import socials from "../data/socials.json";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // The footer is FIXED behind .site-content (which has a 100vh bottom margin).
      // Drive --p (0 → 1) as that margin scrolls past — i.e. as the page content
      // slides up and UNCOVERS the fixed footer from underneath. The CSS uses --p
      // to rise the content into place and lift the dark veil off it.
      ScrollTrigger.create({
        trigger: ".site-content",
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => el.style.setProperty("--p", self.progress.toFixed(4)),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <section className="contact" id="contact" ref={sectionRef}>
      <style>{`
        .contact {
          /* Fills the fixed-footer (100vh). --p (0→1) is driven by scroll;
             --ft-shift = how far the content rises into place (parallax). */
          --p: 0;
          --ft-shift: 14vh;
          /* RED footer — hero crimson tone. The theme tokens are overridden to
             white-based here so all the (previously crimson) accents stay legible. */
          --ink: #ffffff;
          --ink-dim: rgba(255, 255, 255, 0.78);
          --ink-faint: rgba(255, 255, 255, 0.55);
          --accent: #ffffff;
          --accent-2: #ffd9dc;
          --line: rgba(255, 255, 255, 0.24);
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          background: #650b0e;
          color: var(--ink);
          padding: clamp(2rem, 8vh, 5rem) clamp(1.25rem, 5vw, 6rem);
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }
        .contact::before {
          content: "";
          position: absolute; inset: 0;
          background: radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%);
          pointer-events: none;
        }
        /* Dark veil that LIFTS off the footer as it scrolls into view (1 → 0). */
        .contact::after {
          content: "";
          position: absolute; inset: 0;
          background: #000;
          opacity: calc(1 - var(--p));
          pointer-events: none;
          z-index: 5;
        }
        /* Content rises into place as the fixed footer is uncovered. */
        .ct-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          transform: translate3d(0, calc((1 - var(--p)) * var(--ft-shift)), 0);
          will-change: transform;
        }

        .ct-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .ct-kicker::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent); }
        .ct-jp {
          font-family: var(--font-jp), serif;
          font-size: clamp(1rem, 2vw, 1.6rem); letter-spacing: 0.3em; color: var(--ink-dim);
          display: block; margin-top: 0.8rem;
        }
        .ct-title {
          font-family: "Instrument Serif", serif; font-weight: 500;
          font-size: clamp(2.4rem, 7vw, 5.5rem); line-height: 0.95; letter-spacing: -0.02em;
          text-transform: uppercase; margin: 0.6rem 0 0;
        }
        .ct-title em { font-style: italic; color: var(--accent-2); }

        .ct-email {
          display: inline-block;
          margin: clamp(1.2rem, 3vh, 2.2rem) 0 0;
          font-family: "Instrument Serif", serif;
          font-size: clamp(1.5rem, 5vw, 3rem);
          color: var(--ink);
          text-decoration: none;
          position: relative;
          line-height: 1.1;
          word-break: break-word;
        }
        .ct-email::after {
          content: "";
          position: absolute; left: 0; bottom: 2px;
          width: 100%; height: 2px; background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.5s var(--ease-glide);
        }
        .ct-email:hover { color: var(--accent-2); }
        .ct-email:hover::after { transform: scaleX(1); }

        .ct-socials {
          display: flex; flex-wrap: wrap; gap: clamp(0.75rem, 2vw, 1.5rem);
          margin-top: clamp(1.2rem, 3vh, 2.2rem);
        }
        .ct-social {
          display: flex; flex-direction: column; gap: 0.25rem;
          padding: 1rem 1.4rem;
          border: 1px solid var(--line);
          border-radius: 12px;
          text-decoration: none;
          min-width: 11rem;
          transition: border-color 0.3s ease, transform 0.3s var(--ease-glide), background 0.3s ease;
        }
        .ct-social:hover { border-color: rgba(255,255,255,0.6); transform: translateY(-4px); background: rgba(255,255,255,0.08); }
        .ct-social-label {
          font-family: "Geist Mono", monospace;
          font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .ct-social-handle { color: var(--ink); font-size: 0.98rem; }

        .ct-footer {
          position: relative;
          margin-top: clamp(1.5rem, 4vh, 3rem);
          padding: 1.4rem 0 0;
          border-top: 1px solid var(--line);
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: space-between;
          align-items: center;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-dim);
        }
        .ct-footer a { color: var(--ink-dim); text-decoration: none; }
        .ct-footer a:hover { color: var(--accent); }
        .ct-foot-name { font-family: var(--font-jp), serif; letter-spacing: 0.25em; color: var(--ink); text-transform: none; }
      `}</style>

      <div className="ct-inner">
        <span className="ct-kicker ct-reveal">Contact · 連絡</span>
        <h2 className="ct-title ct-reveal">
          Let's build<br />something <em>real</em>
          <span className="ct-jp">一緒に作りましょう</span>
        </h2>

        <a className="ct-email ct-reveal" href={`mailto:${info.email}`}>
          {info.email}
        </a>

        <div className="ct-socials ct-reveal">
          {socials.items.map((s) => (
            <a
              className="ct-social"
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <span className="ct-social-label">{s.label}</span>
              <span className="ct-social-handle">{s.handle}</span>
            </a>
          ))}
        </div>

        <footer className="ct-footer">
          <span>
            © {year} <span className="ct-foot-name">{info.name}</span>
          </span>
          <span>{info.availability} · {info.location}</span>
          <a href="#about">Back to top ↑</a>
        </footer>
      </div>
    </section>
  );
}
