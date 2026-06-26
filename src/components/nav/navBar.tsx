"use client";

import info from "../../data/information.json";

type LenisLike = { scrollTo: (target: Element, opts?: { offset?: number; duration?: number }) => void };

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
          padding: 0.6rem 0.75rem;
          z-index: 1000;
        }
        .nav-logo {
          font-family: var(--font-jp), "Instrument Sans", sans-serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 0.7rem 1.1rem;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
        }
        .nav-logo a { color: var(--ink); text-decoration: none; font-size: 0.95rem; }
        .nav-logo a:hover { color: var(--accent-2); }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.45rem 0.5rem;
          border-radius: 14px;
          background: rgba(101, 11, 14, 0.45);
          border: 1px solid rgba(230, 0, 18, 0.30);
          backdrop-filter: blur(12px);
        }
        .nav-links a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-family: "Instrument Sans", sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 0.5rem 0.85rem;
          border-radius: 9px;
          transition: background 0.2s ease, color 0.2s ease;
          white-space: nowrap;
        }
        .nav-links a:hover { background: var(--accent); color: #fff; }

        @media (max-width: 1000px) {
          .nav-links { gap: 0; padding: 0.35rem; }
          .nav-links a { font-size: 0.72rem; padding: 0.4rem 0.55rem; }
        }
        @media (max-width: 680px) {
          .navbar { gap: 0.5rem; }
          .nav-logo { padding: 0.55rem 0.8rem; }
          .nav-logo a { font-size: 0.82rem; }
          .nav-links {
            gap: 0;
            overflow-x: auto;
            max-width: 70vw;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
                    mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
            scrollbar-width: none;
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
