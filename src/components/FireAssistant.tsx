"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import fire from "../lottieFiles/Red_Fire.json";

// ── Edit these ────────────────────────────────────────────────────────────────
const NAME = "AGNI";
const MESSAGES = [
  "Hey there, wanderer! 🔥 Welcome to Divyansh's realm — where robust backends meet the apps that ride on them.",
  "Scroll on — the work, the skills, and the stories behind them are all just below.",
  "Like what you see? The Hire Me button up top reaches me directly.",
];
// ──────────────────────────────────────────────────────────────────────────────

// Fixed bottom-right Lottie button (does NOT scroll) with a chat-bubble message.
export default function FireAssistant() {
  const [shown, setShown] = useState(false);  // fades in after the splash clears
  const [open, setOpen] = useState(true);      // bubble visible
  const [idx, setIdx] = useState(0);           // which message

  useEffect(() => {
    // Reveal ONLY once the splash has cleared — never before (no timed fallback,
    // so a slow/long splash can't surface the assistant early).
    const reveal = () => setShown(true);
    const w = window as Window & { __heroSplashDone?: boolean };
    if (w.__heroSplashDone) reveal();
    else window.addEventListener("splash:complete", reveal, { once: true });
    return () => {
      window.removeEventListener("splash:complete", reveal);
    };
  }, []);

  const last = idx >= MESSAGES.length - 1;
  const next = () => {
    if (last) { setOpen(false); setIdx(0); }  // close + reset for next time
    else setIdx((i) => i + 1);
  };
  const toggle = () => setOpen((o) => !o);

  return (
    <div className={`fa-root${shown ? " fa-shown" : ""}`}>
      <style>{`
        .fa-root {
          position: fixed;
          right: clamp(1rem, 2vw, 2rem);
          bottom: clamp(1rem, 2vw, 2rem);
          z-index: 1200;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.6rem;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          pointer-events: none;
        }
        .fa-root.fa-shown { opacity: 1; transform: none; pointer-events: auto; }

        .fa-bubble {
          position: relative;
          max-width: min(340px, 78vw);
          background: rgba(18, 18, 24, 0.92);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1rem 1.1rem 0.9rem;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
          color: #f4f4f4;
          transform-origin: bottom right;
          animation: fa-pop 0.35s cubic-bezier(0.25, 1, 0.5, 1);
        }
        /* little tail pointing down toward the avatar */
        .fa-bubble::after {
          content: "";
          position: absolute;
          right: 26px;
          bottom: -7px;
          width: 14px;
          height: 14px;
          background: rgba(18, 18, 24, 0.92);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transform: rotate(45deg);
        }
        .fa-msg {
          font-family: "Instrument Sans", sans-serif;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 0.85rem;
        }
        .fa-next {
          display: block;
          margin-left: auto;
          padding: 0.5rem 1.15rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-family: "Geist Mono", monospace;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .fa-next:hover { background: rgba(230, 0, 18, 0.28); border-color: rgba(230, 0, 18, 0.55); }
        .fa-next:active { transform: scale(0.94); }

        .fa-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          filter: drop-shadow(0 0 18px rgba(230, 0, 18, 0.45));
          transition: transform 0.2s ease;
        }
        .fa-btn:hover { transform: scale(1.06); }
        .fa-btn:active { transform: scale(0.96); }
        .fa-lottie { width: clamp(66px, 7vw, 96px); height: clamp(66px, 7vw, 96px); }
        .fa-name {
          font-family: "Geist Mono", monospace;
          font-size: 0.6rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent-2, #ff2d3f);
        }

        @keyframes fa-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fa-bubble { animation: none; }
        }
      `}</style>

      {open && (
        <div className="fa-bubble" role="dialog" aria-label={`${NAME} message`}>
          <p className="fa-msg">{MESSAGES[idx]}</p>
          <button className="fa-next" onClick={next}>{last ? "Got it" : "Next"}</button>
        </div>
      )}

      <button className="fa-btn" onClick={toggle} aria-label={`${NAME} assistant`}>
        <Lottie className="fa-lottie" animationData={fire} loop autoplay />
        <span className="fa-name">{NAME}</span>
      </button>
    </div>
  );
}
