"use client";

import info from "../../data/information.json";

type LenisLike = {
  scrollTo: (target: Element | number, opts?: { offset?: number; duration?: number }) => void;
};

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Edu", href: "#qualifications" },
  { label: "Awards", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export default function BasicNavigationBar() {
  // The top navbar hiding + the vertical navbar appearing are both driven by the
  // `grid-on` class on <html> (toggled by the About collapse once the card docks),
  // so the nav and the grid frame fade in together — see the CSS below.

  // Smooth-scroll in-page anchors through Lenis (exposed by useHeroAnimation),
  // with a native fallback if Lenis hasn't mounted yet.
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    // "#top" is a virtual target → the very top of the hero. Others must resolve.
    if (href !== "#top" && !document.querySelector(href)) return;
    e.preventDefault();
    // Prefer the WebGL section transition (covers the screen, jumps, dissolves).
    const transition = (window as Window & { __sectionTransition?: (t: string) => void }).__sectionTransition;
    if (transition) { transition(href); return; }
    // Fallback: plain smooth scroll if the transition isn't mounted yet.
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
    if (href === "#top") {
      if (lenis) lenis.scrollTo(0, { offset: 0 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href)!;
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1rem;
          z-index: 1000;
          transition: transform 0.7s cubic-bezier(0.76, 0, 0.24, 1);
        }
        /* When the grid appears, the top navbar slides up out of view */
        :root.grid-on .navbar { transform: translateY(-150%); }

        /* Vertical navbar — sits INSIDE the grid's left column (no container).
           Fades in TOGETHER with the grid (both driven by .grid-on). mix-blend-mode
           keeps it legible on any background. */
        .navbar-v {
          position: fixed;
          left: clamp(30px, 3vw, 46px);
          top: 50%;
          transform: translate(-12px, -50%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.8rem;                     /* roomy spacing between logo + items */
          z-index: 1000;
          pointer-events: none;
          opacity: 0;
          mix-blend-mode: difference;
          transition: opacity 0.9s cubic-bezier(0.25, 1, 0.5, 1),
                      transform 0.9s cubic-bezier(0.25, 1, 0.5, 1);
        }
        :root.grid-on .navbar-v { opacity: 1; transform: translate(0, -50%); pointer-events: auto; }
        .navv-logo {
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.22em;
          color: #fff; text-decoration: none;
        }
        .navv-links { display: flex; flex-direction: column; gap: 1.8rem; }
        .navv-links a {
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 0.66rem; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255, 255, 255, 0.62);
          text-decoration: none; white-space: nowrap; line-height: 1;
          transition: color 0.2s ease, letter-spacing 0.25s ease;
        }
        .navv-links a:hover { color: #fff; letter-spacing: 0.2em; }

        /* Minimal, understated glass — just enough backing for legibility */
        .nav-logo,
        .nav-links {
          background: rgba(8, 8, 10, 0.5);
          backdrop-filter: blur(14px) saturate(135%);
          -webkit-backdrop-filter: blur(14px) saturate(135%);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
        }

        .nav-logo { padding: 0.6rem 1.05rem; }
        .nav-logo a {
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #f4f4f4;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .nav-logo a:hover { color: var(--accent-2, #ff2d3f); }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.1rem;
          padding: 0.35rem 0.4rem;
        }
        .nav-links a {
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          padding: 0.45rem 0.7rem;
          border-radius: 8px;
          white-space: nowrap;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .nav-links a:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 1000px) {
          .nav-links a { font-size: 0.64rem; padding: 0.4rem 0.5rem; letter-spacing: 0.1em; }
        }
        @media (max-width: 680px) {
          .navbar { gap: 0.5rem; }
          .nav-logo a { font-size: 0.7rem; letter-spacing: 0.12em; }
          .nav-links {
            overflow-x: auto;
            max-width: 70vw;
            scrollbar-width: none;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
                    mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
          }
          .nav-links::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-logo">
          <a href="#top" onClick={(e) => handleAnchor(e, "#top")}>
            {info.name}
          </a>
        </div>

        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => handleAnchor(e, l.href)}>
              {l.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Vertical navbar — fades in with the grid once the card has docked */}
      <nav className="navbar-v">
        <a className="navv-logo" href="#top" onClick={(e) => handleAnchor(e, "#top")}>
          {info.name.split(" ").map((w) => w[0]).join("")}
        </a>
        <div className="navv-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => handleAnchor(e, l.href)}>
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
