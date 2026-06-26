"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../data/projects.json";

gsap.registerPlugin(ScrollTrigger);

type Project = (typeof data.items)[number];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project").forEach((el) => {
        const media = el.querySelector(".proj-media-inner");
        const reveals = el.querySelectorAll<HTMLElement>(".reveal");
        const img = el.querySelector<HTMLElement>(".proj-media-inner img");

        // Clip-path wipe of the media panel
        if (media) {
          gsap.fromTo(
            media,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 78%" },
            }
          );
        }

        // Subtle parallax on the image inside the (now revealed) frame
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -8, scale: 1.12 },
            {
              yPercent: 8,
              scale: 1.12,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Staggered line reveal of the info column
        gsap.from(reveals, {
          y: 42,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 72%" },
        });
      });

      // Section heading reveal
      gsap.from(".proj-head .reveal", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".proj-head", start: "top 85%" },
      });
    }, sectionRef);

    // Recalculate once everything (fonts/images) settles
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section className="projects" id="work" ref={sectionRef}>
      <style>{`
        .projects {
          position: relative;
          background: var(--bg);
          color: var(--ink);
          padding: clamp(5rem, 12vh, 11rem) clamp(1.25rem, 5vw, 6rem);
          overflow: hidden;
        }
        .projects::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(60% 50% at 85% 0%, rgba(230,0,18,0.10), transparent 70%),
            radial-gradient(40% 40% at 0% 100%, rgba(230,0,18,0.06), transparent 70%);
          pointer-events: none;
        }

        /* ── Heading ───────────────────────────────────────────── */
        .proj-head {
          position: relative;
          max-width: 1500px;
          margin: 0 auto clamp(3rem, 8vh, 7rem);
        }
        .proj-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent-2);
        }
        .proj-kicker::before {
          content: "";
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 14px var(--accent);
        }
        .proj-title {
          position: relative;
          font-family: "Instrument Serif", serif;
          font-weight: 500;
          font-size: clamp(3rem, 9vw, 8.5rem);
          line-height: 0.95;
          letter-spacing: -0.02em;
          margin: 0.6rem 0 0;
          text-transform: uppercase;
        }
        .proj-jp {
          font-family: var(--font-jp), serif;
          font-style: normal;
          display: block;
          font-size: clamp(1.1rem, 2.2vw, 2rem);
          letter-spacing: 0.3em;
          color: var(--ink-dim);
          margin-top: 0.4rem;
          text-transform: none;
        }
        .proj-sub {
          max-width: 46ch;
          margin-top: 1.4rem;
          color: var(--ink-dim);
          font-size: clamp(0.95rem, 1.4vw, 1.15rem);
          line-height: 1.6;
        }

        /* ── List ──────────────────────────────────────────────── */
        .proj-list {
          max-width: 1500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: clamp(4rem, 12vh, 10rem);
        }
        .project {
          position: relative;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
        }
        .project:nth-child(even) .proj-media { order: 2; }

        /* media */
        .proj-media { position: relative; }
        .proj-media-inner {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--bg-elev);
          will-change: clip-path;
        }
        .proj-media-inner img {
          position: absolute;
          inset: -10%;
          width: 120%;
          height: 120%;
          object-fit: cover;
          filter: grayscale(0.35) contrast(1.05) brightness(0.82);
          transition: filter 0.5s ease;
        }
        .proj-media-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.65) 100%),
                      radial-gradient(120% 90% at 50% 120%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%);
          mix-blend-mode: normal;
          pointer-events: none;
        }
        .project:hover .proj-media-inner img { filter: grayscale(0) contrast(1.1) brightness(1); }
        .proj-index {
          position: absolute;
          top: 0.6rem;
          left: 1rem;
          font-family: "Barlow Condensed", sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 7vw, 6rem);
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.5);
          z-index: 3;
          pointer-events: none;
        }

        /* info */
        .proj-info { position: relative; }
        .proj-jp-name {
          font-family: var(--font-jp), serif;
          font-size: clamp(0.9rem, 1.6vw, 1.2rem);
          letter-spacing: 0.32em;
          color: var(--accent-2);
          margin-bottom: 0.5rem;
        }
        .proj-name {
          font-family: "Instrument Serif", serif;
          font-weight: 500;
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          line-height: 1;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .proj-meta {
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem 1.4rem;
          margin: 1.1rem 0 1.3rem;
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-dim);
        }
        .proj-meta li { position: relative; padding-left: 1rem; }
        .proj-meta li::before {
          content: "";
          position: absolute; left: 0; top: 50%;
          width: 5px; height: 5px; transform: translateY(-50%) rotate(45deg);
          background: var(--accent);
        }
        .proj-desc {
          max-width: 48ch;
          color: var(--ink);
          opacity: 0.82;
          line-height: 1.65;
          font-size: clamp(0.95rem, 1.3vw, 1.1rem);
        }
        .proj-stack {
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .proj-stack li {
          font-family: "Geist Mono", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-dim);
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--line);
          border-radius: 999px;
          transition: border-color 0.3s ease, color 0.3s ease;
        }
        .project:hover .proj-stack li { border-color: rgba(230,0,18,0.4); color: var(--ink); }
        .proj-links {
          display: flex;
          gap: 1.2rem;
          margin-top: 1.6rem;
        }
        .proj-links a {
          font-family: "Geist Mono", monospace;
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          position: relative;
          padding-bottom: 4px;
        }
        .proj-links a::after {
          content: "";
          position: absolute; left: 0; bottom: 0;
          width: 100%; height: 1px;
          background: var(--accent);
          transform: scaleX(0.25);
          transform-origin: left;
          transition: transform 0.35s var(--ease-glide);
        }
        .proj-links a:hover::after { transform: scaleX(1); }

        @media (max-width: 900px) {
          .project { grid-template-columns: 1fr; gap: 1.5rem; }
          .project:nth-child(even) .proj-media { order: 0; }
        }
      `}</style>

      <header className="proj-head">
        <span className="proj-kicker reveal">{data.kicker}</span>
        <h2 className="proj-title reveal">
          {data.title}
          <em className="proj-jp">{data.label}</em>
        </h2>
        <p className="proj-sub reveal">{data.subtitle}</p>
      </header>

      <div className="proj-list">
        {data.items.map((p: Project) => (
          <article
            className="project"
            key={p.id}
            style={{ "--accent": p.accent } as React.CSSProperties}
          >
            <div className="proj-media">
              <div className="proj-media-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} loading="lazy" />
                <span className="proj-index">{p.index}</span>
              </div>
            </div>

            <div className="proj-info">
              <div className="proj-jp-name reveal">{p.nameJp}</div>
              <h3 className="proj-name reveal">{p.name}</h3>
              <ul className="proj-meta reveal">
                <li>{p.year}</li>
                <li>{p.role}</li>
                <li>{p.category}</li>
              </ul>
              <p className="proj-desc reveal">{p.description}</p>
              <ul className="proj-stack reveal">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {(p.links.live || p.links.repo) && (
                <div className="proj-links reveal">
                  {p.links.live && (
                    <a href={p.links.live} target="_blank" rel="noreferrer">
                      View live ↗
                    </a>
                  )}
                  {p.links.repo && (
                    <a href={p.links.repo} target="_blank" rel="noreferrer">
                      Source ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
