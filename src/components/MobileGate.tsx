"use client";

import { useEffect, useState } from "react";
import info from "../data/information.json";

// Renders the site ONLY on tablet/desktop. On phones it shows a hero-styled
// "open on a bigger screen" page instead — the heavy site is never mounted there.
export default function MobileGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const check = () => {
      const portraitPhone = window.matchMedia("(max-width: 767px)").matches;
      const landscapePhone = window.matchMedia("(max-height: 480px) and (pointer: coarse)").matches;
      setIsPhone(portraitPhone || landscapePhone);
    };
    check();
    setMounted(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* Block screen — always in the DOM; shown on phones via media query (works
          even before JS), hidden on tablet/desktop. */}
      <div className="mg-screen">
        <style>{`
          .mg-screen { display: none; }
          @media (max-width: 767px) { .mg-screen { display: flex; } }
          @media (max-height: 480px) and (pointer: coarse) { .mg-screen { display: flex; } }

          .mg-screen {
            position: fixed;
            inset: 0;
            z-index: 99999;
            align-items: center;
            justify-content: flex-start;
            padding: clamp(1.5rem, 8vw, 2.5rem);
            background: #000;
            color: var(--ink, #f4f4f4);
            overflow: hidden;
          }
          .mg-screen::before {
            content: "";
            position: absolute; inset: 0;
            background: radial-gradient(70% 50% at 50% 26%, rgba(230, 0, 18, 0.16), transparent 70%);
            pointer-events: none;
          }
          /* faint glowing katakana backdrop, like the hero */
          .mg-bg-name {
            position: absolute;
            right: -0.06em;
            top: 50%;
            transform: translateY(-50%);
            writing-mode: vertical-rl;
            text-orientation: upright;
            font-family: var(--font-jp), 'Meiryo', sans-serif;
            font-weight: 800;
            font-size: 20vh;
            line-height: 0.85;
            letter-spacing: -0.05em;
            white-space: nowrap;
            color: transparent;
            -webkit-text-stroke: 1.5px rgba(230, 0, 18, 0.22);
            opacity: 0.7;
            pointer-events: none;
            user-select: none;
          }

          .mg-inner {
            position: relative;
            z-index: 1;
            max-width: 30rem;
            animation: mg-in 1s cubic-bezier(0.25, 1, 0.5, 1) both;
          }
          .mg-kicker {
            display: inline-flex; align-items: center; gap: 0.6rem;
            font-family: "Geist Mono", monospace;
            font-size: 0.64rem; letter-spacing: 0.26em; text-transform: uppercase;
            color: var(--accent-2, #ff2d3f);
          }
          .mg-kicker::before {
            content: ""; width: 8px; height: 8px; border-radius: 50%;
            background: var(--accent, #e60012); box-shadow: 0 0 12px var(--accent, #e60012);
          }
          .mg-title {
            font-family: var(--font-anurati), "Geist Mono", sans-serif;
            font-weight: 400;
            font-size: clamp(1.4rem, 7.5vw, 2.3rem);
            line-height: 1.3;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin: 1.3rem 0 1.4rem;
            text-shadow: 0 0 24px rgba(230, 0, 18, 0.35);
          }
          .mg-title em { font-style: normal; color: var(--accent-2, #ff2d3f); }
          .mg-msg {
            font-family: "Instrument Sans", Arial, sans-serif;
            font-size: 1rem; line-height: 1.6;
            color: var(--ink-dim, #8a8a8a);
            margin: 0 0 2rem;
            max-width: 26ch;
          }
          .mg-foot {
            display: inline-block;
            font-family: "Geist Mono", monospace;
            font-size: 0.58rem; letter-spacing: 0.16em;
            color: var(--ink-faint, #4d4d52);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 1rem;
          }

          @keyframes mg-in {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: none; }
          }
        `}</style>

        <span className="mg-bg-name" aria-hidden="true">{info.creativeLastName}</span>

        <div className="mg-inner">
          <span className="mg-kicker">{info.name} · ポートフォリオ</span>
          <h1 className="mg-title">Made for the<br /><em>big</em> screen</h1>
          <p className="mg-msg">
            This experience — the shaders, the depth, the detail — is crafted for
            desktop &amp; tablet. Open it on a larger screen to step into the realm.
          </p>
          <span className="mg-foot">画面が小さすぎます — DESKTOP / TABLET ONLY</span>
        </div>
      </div>

      {/* The actual site mounts only on tablet/desktop (never on phones). */}
      {mounted && !isPhone && children}
    </>
  );
}
