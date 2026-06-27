"use client";

import info from "../../data/information.json";

type LenisLike = {
  scrollTo: (target: Element, opts?: { offset?: number; duration?: number }) => void;
};

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Education", href: "#qualifications" },
  { label: "Awards", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export default function BasicNavigationBar() {
  // Smooth-scroll in-page anchors through Lenis (exposed by useHeroAnimation),
  // with a native fallback if Lenis hasn't mounted yet.
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
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
        }

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
          <a href="#about" onClick={(e) => handleAnchor(e, "#about")}>
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
    </>
  );
}
