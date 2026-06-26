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
    const ctx = gsap.context(() => {
      gsap.from(".ct-reveal", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <section className="contact" id="contact" ref={sectionRef}>
      <style>{`
        .contact {
          position: relative;
          background: var(--bg-soft);
          color: var(--ink);
          padding: clamp(6rem, 16vh, 14rem) clamp(1.25rem, 5vw, 6rem) 0;
          overflow: hidden;
          border-top: 1px solid var(--line-soft);
        }
        .contact::before {
          content: "";
          position: absolute; inset: 0;
          background: radial-gradient(60% 60% at 50% 0%, rgba(230,0,18,0.12), transparent 70%);
          pointer-events: none;
        }
        .ct-inner { position: relative; max-width: 1500px; margin: 0 auto; }

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
          font-size: clamp(2.8rem, 10vw, 9rem); line-height: 0.95; letter-spacing: -0.02em;
          text-transform: uppercase; margin: 0.6rem 0 0;
        }
        .ct-title em { font-style: italic; color: var(--accent-2); }

        .ct-email {
          display: inline-block;
          margin: clamp(2rem, 5vh, 3.5rem) 0 0;
          font-family: "Instrument Serif", serif;
          font-size: clamp(1.5rem, 5vw, 3.5rem);
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
          margin-top: clamp(2.5rem, 6vh, 4rem);
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
        .ct-social:hover { border-color: rgba(230,0,18,0.45); transform: translateY(-4px); background: var(--bg-elev); }
        .ct-social-label {
          font-family: "Geist Mono", monospace;
          font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent-2);
        }
        .ct-social-handle { color: var(--ink); font-size: 0.98rem; }

        .ct-footer {
          position: relative;
          margin-top: clamp(4rem, 10vh, 8rem);
          padding: 2rem 0;
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
