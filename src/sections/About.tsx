"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../data/about.json";

gsap.registerPlugin(ScrollTrigger);

// Copy shown ON the flipped (back) face, inside the clip card. Edit freely.
const BACK = {
  tag: "002 — WHO I AM",
  title: "I build the hard middle of the system — and the apps that ride on it.",
};

// Parallax art for the single "side" card that emerges from behind the main card.
// Shared with the hero card's art for now — swap these for its own images later.
// Three parallax depth layers for the side card (back → front).
const SIDE_ART = {
  bg: "/sideCard/background.svg",
  mid: "/sideCard/midground.svg",
  fg: "/sideCard/foreground.svg",
};

// ── Side-card size ── breadth in vmax; height is breadth × SIDE_ASPECT so the aspect
// ratio is LOCKED. That is the key fix: the clip polygon was designed on a ~square, so
// on a tall/narrow rectangle it either stretched or collapsed. With a fixed aspect the
// polygon maps 1:1 to what you drew — no distortion, at any screen size. SIDE_ASPECT
// ~1.3 is a KPR-style portrait; raise it for a taller card (the clip scales with it).
const SIDE_W_VMAX = 22;     // breadth (width)
const SIDE_ASPECT = 1.32;   // height ÷ width
const SIDE_Y_SHIFT = 0.10;  // dock this fraction of the viewport height ABOVE centre
                            // (0 = vertically centred; higher = further toward the top)

// Your exact clip polygon (fractions of the box): all corners square, with a single
// folder tab on the upper-left. Applied FRACTIONALLY — with the locked aspect it
// reproduces the shape exactly as designed. Corners rounded.
// Source: polygon(35% 0, 100% 0, 100% 100%, 27% 100%, 27% 69%, 35% 62%)
const SIDE_POLY: [number, number][] = [
  [0.35, 0.00],
  [1.00, 0.00],
  [1.00, 1.00],
  [0.27, 1.00],
  [0.27, 0.69],
  [0.35, 0.62],
];

// Side-card emergence — it EXPANDS (grows) out from behind the main card, then slides
// to the right and settles. Tune freely.
// ── Layer centring ── each layer's FOCAL centre inside its artwork, as a fraction of
// the image width (measured by scanning the layers on a canvas — not eyeballed):
//   bg  0.464 → the sun disc (bright-pixel centroid; the layer is full-bleed opaque)
//   mid 0.417 → the levitating rock (alpha-bbox centre; 8.3% LEFT of the artwork centre)
//   fg  0.5   → KEEP the artwork's designed composition: it's a FRAME layer (mountains
//               on the left + right edges, open middle) — recentring its mass pushed it
//               left and hid a wall; 0.5 keeps both walls framing the mid/bg clearly.
// The JS computes the exact object-position per layer for the current card shape.
// The measured focal Y values (bg 0.371 / mid 0.522) drive the fixed CSS top nudges.
const FOCUS = { bg: 0.464, mid: 0.417, fg: 0.5 };

const SIDE_START = 0.62;   // initial (visible) scale, tucked behind the main card
const SIDE_BIG   = 1.12;   // overshoot — grows larger before settling
const SIDE_END   = 1.00;   // final resting scale
const SIDE_GROW  = 0.5;    // 0–1: grow-in-place phase length, then it slides to the side

// Round an ordered polygon (points already in px) into an SVG path string using
// quadratic curves. `radius` may be a single value or one-per-vertex (notch/bevel).
function roundedPath(pts: [number, number][], radius: number | number[]): string {
  const n = pts.length;
  const radii = Array.isArray(radius) ? radius : pts.map(() => radius);
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
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const card = sectionRef.current?.querySelector(".hc-card") as HTMLElement | null;
      if (!card) return;
      const stage = sectionRef.current?.querySelector(".ab-collapse") as HTMLElement | null;
      const sideEl = sectionRef.current?.querySelector(".hc-side") as HTMLElement | null;
      const backContent = sectionRef.current?.querySelector(".hc-back-content") as HTMLElement | null;

      let W = card.offsetWidth;
      let H = card.offsetHeight;
      let inDock = false;   // true while the card is docked (card-magnet window)

      // Rounded card via clip-path: path() — quadratic-curve rounding on the outer
      // corners, the folder-tab notch at the TOP-LEFT, and a diagonal BEVEL cut at
      // the BOTTOM-RIGHT only (top + bottom-left are left untouched).
      const buildPath = (sp: number) => {
        const R = sp * 40, nr = sp * 16;
        const nw = sp * 210, nh = sp * 105;  // top-left folder-tab notch (a bit bigger)
        const bv = sp * 130;                 // bottom-right bevel — diagonal corner cut
        const pts: [number, number][] = [
          [nw, 0], [W, 0],
          [W, H - bv], [W - bv, H],          // bottom-right BEVEL (diagonal)
          [0, H], [0, nh], [nw, nh],         // bottom-left → top-left notch
        ];
        const radii = [nr, R, nr, nr, R, nr, nr];
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

      // ── Collapse: the card SCALES DOWN; its clip shape never morphs ─────────
      // The notched-card clip is FIXED. The card starts scaled up large enough
      // that the rounded corners + folder notch sit OFF-SCREEN (so the card just
      // looks like a full-bleed rectangle), and shrinking it on scroll slides
      // those cutouts into view — they are never grown/animated, exactly like the
      // reference. START_SCALE = how zoomed/off-screen the cutouts begin (raise it
      // if any cutout peeks at the top); DOCKED_SCALE = the final docked size.
      // The card is a 100vmax SQUARE. Because it's taller than a 16:9 screen, it
      // only needs a hair over 1× to cover the width with the cutouts off-screen —
      // keeping the image barely zoomed so its detail stays visible.
      const START_SCALE = 1.05;
      // ▼▼ DOCKED CARD SIZE — lower = smaller docked square, higher = bigger.
      const DOCKED_SCALE = 0.20;
      // Back face fills the screen at the very end (cutouts off-screen, like START).
      const END_SCALE = 1.08;
      // How much to scale the (contain-fit) image up so it COVERS the square once
      // docked — closing the top/bottom letterbox bands. Raised to absorb any
      // transparent margin baked into the SVG. (Raise further if bands remain.)
      const IMG_COVER = 2.5;
      // Dock 3D tilt (degrees): rotateX + a rotateY turn during the shrink.
      // POSITIVE y → the card tilts from the RIGHT side (right edge recedes) as it
      // shrinks — the pre-flip pose. The flip then continues from this tilt down to
      // -180 (set in the flip math), so it still turns LEFT → RIGHT.
      const TILT = { x: -13, y: 17 };
      // Cursor "repel" tilt (degrees, max) — while docked, the card tips in the Z axis
      // so the side NEAREST the cursor recedes (it leans away, never translates in x/y).
      const CURSOR_TILT = 18;

      // ── Sequence thresholds over the pinned scroll (progress 0 → 1) ──────────
      //   0 → P_SHRINK : card shrinks to the docked size (cutouts reveal) + tilts
      //   P_SHRINK → P_FLIP_A : docked hold (cursor-magnet window)
      //   P_FLIP_A → P_FLIP_B : card flips on Y, revealing the BACK face
      //   P_UP → 1 : the back face scales up to fill the screen
      // The flip range (P_FLIP_A → P_FLIP_B) is WIDE so the rotation is slow and
      // scroll-controlled rather than snappy.
      const P_SHRINK = 0.26;
      const P_FLIP_A = 0.40;
      const P_FLIP_B = 0.80;
      const P_UP     = 0.80;
      // Back-face content fades in here (after the flip, as the card opens up).
      const CONTENT_IN = 0.86;
      // Card magnet activates here — during the late shrink, once the cutouts show
      // (not only when fully docked).
      const MAGNET_FROM = 0.12;
      // Grid frame + vertical navbar fade in here — just after the card has shrunk
      // a little (earlier than the docked threshold), via a smooth CSS opacity fade.
      const GRID_FROM = 0.1;

      // The image must reach full COVER *before* the square is small enough to show
      // top/bottom bands — that happens at card scale = viewport-height / card-side
      // (= 1/aspect, since the card is a 100vmax square). Compute from the screen.
      let coverBy = 0.68;
      const computeCoverBy = () => {
        const a = window.innerWidth / Math.max(window.innerHeight, 1);
        coverBy = a >= 1 ? Math.min(0.9, 1 / a + 0.12) : 0.9;
      };
      computeCoverBy();

      // ── Single side card — geometry ──────────────────────────────────────────
      // Starts hidden at the screen centre (behind the main card); docks vertically
      // centred at the RIGHT end, just inside the grid frame. Measures its own real
      // px size so the clip + parallax are exact at any viewport.
      let cCenterX = 0, cCenterY = 0;   // emerge start (screen centre)
      let sW = 0, sH = 0;               // measured side-card size in px
      let sideTX = 0, sideTY = 0;       // docked target (right-middle, inside the grid)
      // Size the side card from the constants (single source of truth), then measure.
      // Height = breadth × aspect (both in vmax) → the aspect ratio is locked on every
      // screen, so the clip polygon maps 1:1 to what was designed (no stretching).
      if (sideEl) {
        sideEl.style.width = `${SIDE_W_VMAX}vmax`;
        sideEl.style.height = `${(SIDE_W_VMAX * SIDE_ASPECT).toFixed(3)}vmax`;
      }
      const computeSide = () => {
        // Skip while expanded: the card is a fullscreen fixed box then — measuring it
        // would corrupt sW/sH (and the docked targets) for the collapse.
        if (sideEl?.classList.contains("side-expanded")) return;
        const vw = window.innerWidth, vh = window.innerHeight;
        sW = sideEl?.offsetWidth || 0;
        sH = sideEl?.offsetHeight || 0;
        const inset = Math.min(26, Math.max(14, vw * 0.015)); // matches GridFrame --gf-inset
        const gap = Math.min(22, Math.max(12, vw * 0.014));   // breathing room inside the grid
        cCenterX = vw / 2; cCenterY = vh / 2;
        sideTX = vw - inset - gap - sW / 2;   // right edge tucked just inside the grid border
        // Docked a little toward the TOP (like the KPR reference), clamped so the card
        // never pokes above the grid frame.
        sideTY = Math.max(inset + gap + sH / 2, vh / 2 - vh * SIDE_Y_SHIFT);
      };
      computeSide();

      // The side card's clip — your exact polygon (SIDE_POLY) applied fractionally.
      // Because the card's aspect ratio is locked (SIDE_ASPECT), this reproduces the
      // shape precisely as designed. Corners rounded.
      const buildSideClip = () => {
        const pts = SIDE_POLY.map(([x, y]) => [x * sW, y * sH] as [number, number]);
        return `path("${roundedPath(pts, Math.min(sW, sH) * 0.05)}")`;
      };
      const applySideClip = () => {
        if (!sideEl || sW <= 0) return;
        if (sideEl.classList.contains("side-expanded")) return;   // fullscreen = no cutouts
        sideEl.style.setProperty("--card-clip", buildSideClip());
      };

      // Apply the fixed notched clip once, and re-measure/re-apply on refresh. Set
      // it on the STAGE (the side card overrides its own --card-clip via applySideClip).
      const setClip = () => { (stage ?? card).style.setProperty("--card-clip", `path("${buildPath(1)}")`); };
      setClip();
      gsap.set(card, { scale: START_SCALE, force3D: true });
      if (backContent) gsap.set(backContent, { opacity: 0 });

      // ── Smoothed scale ───────────────────────────────────────────────────────
      // onUpdate sets the scroll TARGET; this ticker glides the scale toward it
      // each frame (lerp) so the scale-up/down reads silky + lag-free instead of
      // tracking raw scroll jitter. Rotation stays scroll-exact (precise flip).
      let tScale = START_SCALE, cScale = START_SCALE, tRotY = 0, tTiltX = 0;
      // Cursor "repel" tilt, added ON TOP of the scroll-driven rotation. Smoothed
      // toward its target each frame so the lean glides.
      let tgtRotX = 0, tgtRotY = 0, curRotX = 0, curRotY = 0;
      let lastImg = -1;   // guard: only re-write the image scale when it actually moves
      const SMOOTH = 0.15;
      const transformTick = () => {
        cScale += (tScale - cScale) * SMOOTH;
        curRotX += (tgtRotX - curRotX) * SMOOTH;
        curRotY += (tgtRotY - curRotY) * SMOOTH;
        gsap.set(card, { scale: cScale, rotateX: tTiltX + curRotX, rotateY: tRotY + curRotY, force3D: true });
        if (backContent) gsap.set(backContent, { scale: 1 / cScale });
        // Image fit: contain (whole panorama) when the card is big → cover (fills
        // the square, no bands) as it shrinks. Driven off the SAME smoothed scale.
        // Only WRITE when it changes → the big SVG layer isn't re-rasterised every
        // idle frame (a key source of the parallax stutter on fast scroll).
        const it = gsap.utils.clamp(0, 1, (START_SCALE - cScale) / (START_SCALE - coverBy));
        const imgScale = 1 + it * (IMG_COVER - 1);
        if (Math.abs(imgScale - lastImg) > 0.0008) {
          if (fg) gsap.set(fg, { scale: imgScale, force3D: true });
          if (bg) gsap.set(bg, { scale: imgScale, force3D: true });
          lastImg = imgScale;
        }
        // Side card glides toward its scroll-driven target (lerp). Skipped while
        // expanded — the expand tween owns the box then.
        if (side.el && !sideExpanded) {
          side.curX += (side.tX - side.curX) * SMOOTH;
          side.curY += (side.tY - side.curY) * SMOOTH;
          side.curS += (side.tS - side.curS) * SMOOTH;
          gsap.set(side.el, { x: side.curX, y: side.curY, scale: side.curS, force3D: true });
        }
      };
      gsap.ticker.add(transformTick);

      // ── Cursor parallax on the front image layers (foreground moves more than
      //    background → depth). quickTo lerps for buttery, precise tracking. ──────
      const fg = card.querySelector(".hc-fg-img") as HTMLElement | null;
      const bg = card.querySelector(".hc-bg-img") as HTMLElement | null;
      const fgX = fg ? gsap.quickTo(fg, "x", { duration: 0.5, ease: "power3.out" }) : null;
      const fgY = fg ? gsap.quickTo(fg, "y", { duration: 0.5, ease: "power3.out" }) : null;
      const bgX = bg ? gsap.quickTo(bg, "x", { duration: 0.6, ease: "power3.out" }) : null;
      const bgY = bg ? gsap.quickTo(bg, "y", { duration: 0.6, ease: "power3.out" }) : null;
      // (The whole card's cursor "repel" tilt is driven in the transform ticker via
      // tgtRotX/tgtRotY — no x/y translation, only a Z-axis lean.)

      // ── Side card — 3-layer parallax rig (bg < mid < fg depth) ───────────────
      const sbg = sideEl?.querySelector(".hs-bg") as HTMLElement | null;
      const smid = sideEl?.querySelector(".hs-mid") as HTMLElement | null;
      const sfg = sideEl?.querySelector(".hs-fg") as HTMLElement | null;
      const side = {
        el: sideEl,
        bgX: sbg ? gsap.quickTo(sbg, "x", { duration: 0.7, ease: "power3.out" }) : null,
        bgY: sbg ? gsap.quickTo(sbg, "y", { duration: 0.7, ease: "power3.out" }) : null,
        midX: smid ? gsap.quickTo(smid, "x", { duration: 0.6, ease: "power3.out" }) : null,
        midY: smid ? gsap.quickTo(smid, "y", { duration: 0.6, ease: "power3.out" }) : null,
        fgX: sfg ? gsap.quickTo(sfg, "x", { duration: 0.5, ease: "power3.out" }) : null,
        fgY: sfg ? gsap.quickTo(sfg, "y", { duration: 0.5, ease: "power3.out" }) : null,
        curX: cCenterX, curY: cCenterY, tX: cCenterX, tY: cCenterY,
        curS: SIDE_START, tS: SIDE_START,   // starts visible (not zero), grows, then settles
      };
      // midground = a LEVITATING object: slow but visible up-and-down float, forever.
      // It rides on yPercent — a separate transform channel from the parallax quickTo's
      // px x/y — so the float and the mouse response compose instead of fighting.
      if (smid) {
        gsap.fromTo(smid, { yPercent: -1.5 }, {
          yPercent: 1.5, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1,
        });
      }
      // Centre each layer's FOCAL POINT (sun / rock / canyon mass — not the artwork
      // midpoint) in the card. object-fit:cover fits the wide panoramas by HEIGHT, so
      // the horizontal crop window depends on the box shape — compute the
      // object-position that puts the layer's focus at the box centre, per state.
      // (boxW/boxH = the img box = 116% of the card, because of the -8% inset.)
      const layerObjPos = (el: HTMLImageElement | null, fx: number, boxW: number, boxH: number) => {
        const nw = el?.naturalWidth || 7349, nh = el?.naturalHeight || 2450;
        const scaledW = nw * (boxH / nh);              // cover → height-fit panorama
        if (scaledW <= boxW) return "50% 50%";         // no horizontal overflow to place
        return `${(((boxW / 2 - fx * scaledW) / (boxW - scaledW)) * 100).toFixed(2)}% 50%`;
      };
      const SIDE_LAYERS: [HTMLImageElement | null, number][] = [
        [sbg as HTMLImageElement | null, FOCUS.bg],
        [smid as HTMLImageElement | null, FOCUS.mid],
        [sfg as HTMLImageElement | null, FOCUS.fg],
      ];
      const applyLayerCenters = () => {
        if (sW <= 0) return;
        if (sideEl?.classList.contains("side-expanded")) return;   // expand tween owns it
        for (const [el, fx] of SIDE_LAYERS)
          if (el) el.style.objectPosition = layerObjPos(el, fx, sW * 1.16, sH * 1.16);
      };
      applyLayerCenters();
      applySideClip();
      // Start the side card centred (behind the main card) at its initial visible
      // scale — onUpdate grows it, then slides it out to the right.
      if (sideEl) {
        gsap.set(sideEl, {
          xPercent: -50, yPercent: -50, x: cCenterX, y: cCenterY,
          scale: SIDE_START, opacity: 0, force3D: true,
        });
      }

      // ── Click to EXPAND: the side card grows to cover the whole screen exactly
      // (clip cutouts dropped → clean full rectangle), scroll locked. Click again to
      // shrink back: it RESIZES to the docked size and REPOSITIONS to the docked spot
      // simultaneously — like the main card's shrink.
      //
      // Mechanics — built for 60fps: the card is PORTALED to <body> (the stage's
      // `perspective` makes it the containing block for even position:fixed
      // descendants) and LAID OUT at the full viewport for the whole ride. The
      // animation is PURE TRANSFORMS (compositor-only — no width/height/
      // object-position writes per frame, which forced a re-layout and a full SVG
      // re-rasterisation of all three panoramas every frame = the jank):
      //   card:   translate+scale from the docked rect → identity (fullscreen)
      //   layers: counter-scale scaleX = scaleY/scaleX of the card, so the NET image
      //           zoom stays uniform every frame — zero distortion, exact cover.
      // Because every layer's focal point is centred in BOTH geometries, the docked
      // appearance and the transformed fullscreen layout coincide at the endpoints —
      // the layout/crop swap at the ends is invisible. Scroll is frozen while open,
      // so the docked rect stays valid for the shrink.
      let sideExpanded = false, sideBusy = false;
      let dockRect: DOMRect | null = null;
      const sideParent = sideEl?.parentElement ?? null;
      const sideNext = sideEl?.nextElementSibling ?? null;
      const layersEl = sideEl?.querySelector(".hs-layers") as HTMLElement | null;
      const dockW = sideEl?.style.width ?? "";        // original docked size (e.g. "22vmax")
      const dockH = sideEl?.style.height ?? "";
      const lenis = (window as Window & { __lenis?: { stop: () => void; start: () => void } }).__lenis;
      const EXPAND_T = 0.9, EXPAND_EASE = "power3.inOut";
      const toggleSide = () => {
        if (!sideEl || sideBusy) return;
        sideBusy = true;
        if (!sideExpanded) {
          sideExpanded = true;
          lenis?.stop();
          dockRect = sideEl.getBoundingClientRect();  // frozen docked geometry (viewport coords)
          document.body.appendChild(sideEl);          // escape the stage's containing block
          sideEl.classList.add("side-expanded");      // lays out at 100vw × 100vh
          // The docked size + clip are INLINE styles — clear/override them (inline
          // beats any class rule) so the class's fullscreen layout applies.
          sideEl.style.width = "";
          sideEl.style.height = "";
          sideEl.style.setProperty("--card-clip", "none");
          // Aim the crops at their fullscreen focal positions ONCE, before the flight.
          for (const [el, fx] of SIDE_LAYERS)
            if (el) el.style.objectPosition = layerObjPos(el, fx, window.innerWidth * 1.16, window.innerHeight * 1.16);
          const sx0 = dockRect.width / window.innerWidth;
          const sy0 = dockRect.height / window.innerHeight;
          const x0 = dockRect.left, y0 = dockRect.top;
          // xPercent/yPercent zeroed: GSAP caches the ticker's -50% per element.
          gsap.set(sideEl, {
            xPercent: 0, yPercent: 0, transformOrigin: "0 0",
            x: x0, y: y0, scaleX: sx0, scaleY: sy0, opacity: 1, force3D: true,
          });
          if (layersEl) gsap.set(layersEl, {
            transformOrigin: "50% 50%", scaleX: sy0 / sx0, scaleY: 1, force3D: true,
          });
          const flight = { p: 0 };
          gsap.to(flight, {
            p: 1, duration: EXPAND_T, ease: EXPAND_EASE,
            onUpdate: () => {
              const sx = sx0 + (1 - sx0) * flight.p, sy = sy0 + (1 - sy0) * flight.p;
              gsap.set(sideEl, { x: x0 * (1 - flight.p), y: y0 * (1 - flight.p), scaleX: sx, scaleY: sy });
              if (layersEl) gsap.set(layersEl, { scaleX: sy / sx });   // exact uniform zoom
            },
            onComplete: () => {
              gsap.set(sideEl, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
              if (layersEl) gsap.set(layersEl, { scaleX: 1 });
              sideBusy = false;
            },
          });
        } else {
          const r = dockRect ?? sideEl.getBoundingClientRect();
          const sx1 = r.width / window.innerWidth;
          const sy1 = r.height / window.innerHeight;
          const flight = { p: 0 };
          gsap.to(flight, {
            p: 1, duration: EXPAND_T, ease: EXPAND_EASE,
            onUpdate: () => {
              const sx = 1 + (sx1 - 1) * flight.p, sy = 1 + (sy1 - 1) * flight.p;
              gsap.set(sideEl, { x: r.left * flight.p, y: r.top * flight.p, scaleX: sx, scaleY: sy });
              if (layersEl) gsap.set(layersEl, { scaleX: sy / sx });   // exact uniform zoom
            },
            onComplete: () => {
              sideEl.classList.remove("side-expanded");
              if (sideParent) sideParent.insertBefore(sideEl, sideNext);   // back to its exact spot
              if (layersEl) gsap.set(layersEl, { clearProps: "transform,transformOrigin" });
              sideEl.style.width = dockW; sideEl.style.height = dockH;      // restore docked size
              applySideClip();                                              // restore the notched clip
              applyLayerCenters();                                          // restore docked crops
              gsap.set(sideEl, {                                            // restore ticker transform
                xPercent: -50, yPercent: -50, x: side.curX, y: side.curY,
                scale: side.curS, opacity: 1, force3D: true,
              });
              lenis?.start();
              sideExpanded = false; sideBusy = false;
            },
          });
        }
      };
      sideEl?.addEventListener("click", toggleSide);

      // Cursor parallax — driven ENTIRELY from arithmetic (no getBoundingClientRect),
      // so a mousemove never forces a synchronous layout while the ticker is writing
      // transforms → zero layout thrash. The main card is centred in the viewport;
      // the side card is measured against its tracked centre (curX/curY).
      const onMove = (ev: MouseEvent) => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const mW = (W * cScale) || 1, mH = (H * cScale) || 1;   // main card's current visual size
        const dx = gsap.utils.clamp(-0.5, 0.5, (ev.clientX - vw / 2) / mW);
        const dy = gsap.utils.clamp(-0.5, 0.5, (ev.clientY - vh / 2) / mH);
        fgX?.(-dx * 50); fgY?.(-dy * 18);     // foreground (panorama → mostly horizontal)
        bgX?.(-dx * 20); bgY?.(-dy * 7);      // background (subtler depth)
        // Repel in Z (docked only): the side nearest the cursor tips AWAY. Cursor to
        // the right → right edge recedes (+rotateY); cursor low → bottom recedes.
        if (inDock) { tgtRotY = dx * CURSOR_TILT; tgtRotX = -dy * CURSOR_TILT; }
        // Side card — 3-layer parallax against its own tracked centre + real size.
        if (side.el) {
          const sdx = gsap.utils.clamp(-0.5, 0.5, (ev.clientX - side.curX) / (sW || 1));
          const sdy = gsap.utils.clamp(-0.5, 0.5, (ev.clientY - side.curY) / (sH || 1));
          side.fgX?.(-sdx * 20); side.fgY?.(-sdy * 11);   // foreground moves most
          side.midX?.(-sdx * 12); side.midY?.(-sdy * 7);  // midground
          side.bgX?.(-sdx * 6);  side.bgY?.(-sdy * 3);    // background least
        }
      };
      window.addEventListener("mousemove", onMove);

      ScrollTrigger.create({
        trigger: ".ab-collapse",
        start: "top top",
        end: "+=320%",   // longer pin: shrink + dock + flip + scale-up all happen here
        pin: ".ab-collapse",
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => { W = card.offsetWidth; H = card.offsetHeight; setClip(); computeCoverBy(); computeSide(); applySideClip(); applyLayerCenters(); },
        onUpdate: (self) => {
          const p = self.progress;
          const ease = gsap.parseEase("power2.inOut");
          const flipEase = gsap.parseEase("sine.inOut");   // gentlest ease → smooth, controlled flip

          // ── SCALE: shrink → docked · hold · scale-up to fill the screen ──────
          let scale: number;
          if (p <= P_SHRINK) {
            scale = START_SCALE - ease(p / P_SHRINK) * (START_SCALE - DOCKED_SCALE);
          } else if (p < P_UP) {
            scale = DOCKED_SCALE;
          } else {
            scale = DOCKED_SCALE + ease((p - P_UP) / (1 - P_UP)) * (END_SCALE - DOCKED_SCALE);
          }

          // ── ROTATE Y: dock tilt (0 → TILT.y) flows into the flip, turning the
          //    card LEFT → RIGHT to -180° on a smooth, scroll-controlled ease ─────
          let rotY: number;
          if (p <= P_SHRINK) rotY = ease(p / P_SHRINK) * TILT.y;        // tilt eases in
          else if (p < P_FLIP_A) rotY = TILT.y;                          // docked tilt holds
          else if (p < P_FLIP_B) rotY = TILT.y + flipEase((p - P_FLIP_A) / (P_FLIP_B - P_FLIP_A)) * (-180 - TILT.y);
          else rotY = -180;                                              // back fully faces us

          // ── TILT (rotateX): in during shrink, hold, out as it fills the screen ─
          let tiltX: number;
          if (p <= P_SHRINK) tiltX = ease(p / P_SHRINK) * TILT.x;
          else if (p < P_UP) tiltX = TILT.x;
          else tiltX = TILT.x * (1 - ease((p - P_UP) / (1 - P_UP)));

          // hand the scroll-driven values to the smoothed transform ticker
          tScale = scale; tRotY = rotY; tTiltX = tiltX;

          // Back-face content lives INSIDE the clip card — fade it in after the flip
          // (its counter-scale is applied in the smoothed transform ticker).
          if (backContent) {
            const cin = gsap.utils.clamp(0, 1, (p - CONTENT_IN) / (1 - CONTENT_IN));
            gsap.set(backContent, { opacity: cin });
          }

          // Grid-line frame + vertical navbar fade in once the card has shrunk a
          // little, and stay on for the rest of the page (smooth CSS opacity fade).
          document.documentElement.classList.toggle("grid-on", p >= GRID_FROM);

          // card magnet active from the late shrink (cutouts visible) until the flip
          const nowDock = p >= MAGNET_FROM && p < P_FLIP_A;
          if (inDock && !nowDock) { tgtRotX = 0; tgtRotY = 0; }   // release the tilt on exit
          inDock = nowDock;

          // ── Side card ───────────────────────────────────────────────────────
          // Phase 1 (grow): from behind the main card it scales UP in place, past its
          // final size, to look larger than the original card. Phase 2 (slide): it
          // then moves to the right-middle while settling to its final size. COLLAPSE:
          // implodes to 0 as the main card flips + scales up to reveal the next content.
          const sp = gsap.utils.clamp(0, 1, p / P_SHRINK);
          const emerge = ease(sp);                                    // 0 → 1 during the shrink
          const col = p > P_UP ? ease(gsap.utils.clamp(0, 1, (p - P_UP) / (1 - P_UP))) : 0;
          let sScale: number, posT: number;
          if (emerge <= SIDE_GROW) {
            sScale = SIDE_START + (SIDE_BIG - SIDE_START) * (emerge / SIDE_GROW);   // grow in place
            posT = 0;
          } else {
            const b = (emerge - SIDE_GROW) / (1 - SIDE_GROW);
            sScale = SIDE_BIG + (SIDE_END - SIDE_BIG) * b;                          // settle to final
            posT = b;                                                              // slide to the side
          }
          side.tS = sScale * (1 - col);                              // implode on collapse
          side.tX = cCenterX + (sideTX - cCenterX) * posT;
          side.tY = cCenterY + (sideTY - cCenterY) * posT;
          if (side.el && !sideExpanded) {
            gsap.set(side.el, { opacity: gsap.utils.clamp(0, 1, emerge / 0.08) * (1 - col) });
            // Clickable only once docked & settled (never an invisible hit-target).
            side.el.style.pointerEvents = emerge > 0.85 && col < 0.4 ? "auto" : "none";
          }
        },
      });

      // ── About content reveals ──────────────────────────────────────────────
      // start values are early ("top 90/95%") so the entrance fires as soon as the
      // grid scrolls in — the pinned collapse above must not leave them hidden.
      gsap.from(".ab-reveal", {
        y: 44, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: ".ab-grid", start: "top 90%" },
      });
      gsap.from(".ab-stat", {
        y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: ".ab-stats", start: "top 95%" },
      });
      gsap.fromTo(".ab-rail-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".ab-grid", start: "top 85%", end: "bottom 60%", scrub: true },
      });

      // The pinned collapse inserts a tall spacer that shifts everything below it,
      // so ScrollTrigger's first position read for these reveals is stale (they
      // stayed hidden on desktop). Recalc once layout settles so they fire.
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(() => requestAnimationFrame(refresh));
      window.addEventListener("load", refresh);

      return () => {
        gsap.ticker.remove(transformTick);
        window.removeEventListener("load", refresh);
        window.removeEventListener("mousemove", onMove);
        sideEl?.removeEventListener("click", toggleSide);
        // If it unmounts while expanded (e.g. HMR), put the card back where React
        // expects it, so React's removeChild doesn't throw.
        if (sideEl && sideEl.parentElement === document.body && sideParent) {
          sideParent.insertBefore(sideEl, sideNext);
        }
        document.documentElement.classList.remove("grid-on");
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <style>{`
        /* Black section (matches the rest of the site) with light-on-black inks. */
        .about {
          --ab-bg:   #000;
          --ab-ink:  #f4f4f4;
          --ab-dim:  #8a8a8a;
          --ab-line: rgba(255, 255, 255, 0.12);
          position: relative;
          background: var(--ab-bg);
          color: var(--ab-ink);
          overflow: hidden;
        }

        /* Light dom pin stage — the card lands here and stays docked */
        .ab-collapse {
          position: relative;
          height: 100vh;
          width: 100%;
          background: var(--ab-bg);
          perspective: 1200px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* The card is a SQUARE (100vmax) centred in the stage. At ~1.16× it covers
           the screen with the cutouts off-screen; shrinking it docks a clean square. */
        .hc-card {
          position: relative;
          z-index: 1;                     /* sits ABOVE the side card */
          flex: none;
          width: 100vmax;
          height: 100vmax;
          transform-origin: center center;
          transform-style: preserve-3d;   /* front + back faces live in 3D for the flip */
          will-change: transform;
        }
        /* Single side card — a RECTANGLE that emerges from behind the main card and
           docks vertically-centred at the right, inside the grid. Rendered at its
           REAL size (not a scaled 100vmax element) → cheap GPU layer. No 3D. */
        .hc-side {
          position: absolute;
          top: 0; left: 0;
          /* width/height are set from JS (SIDE_W_VMAX / SIDE_ASPECT) — edit them there */
          z-index: 0;                /* behind the main card (.hc-card is z-index 1) */
          transform-origin: center center;
          will-change: transform, opacity;
          contain: layout paint;     /* isolate → the ticker's writes don't reflow siblings */
          pointer-events: none;      /* toggled to auto in JS once docked (clickable) */
          cursor: pointer;
          opacity: 0;
        }
        /* Clicked → covers the whole viewport exactly, cutouts dropped. Portaled to
           <body> and LAID OUT at the full viewport for the whole ride; the animation
           is pure GPU transforms (card scales up from the docked rect, the layers
           counter-scale so the images never distort). No width/height/object-position
           changes per frame → zero re-layout and zero SVG re-rasterisation → smooth. */
        .hc-side.side-expanded {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 60;
          --card-clip: none;          /* drop the folder-tab cutouts → full rectangle */
          contain: none;
          pointer-events: auto;
          opacity: 1;
        }
        .hc-side.side-expanded .hc-clip { overflow: visible; }
        /* Two faces of the card: front = the video card, back = the new bg3 section.
           backface-visibility hides whichever face is turned away during the flip. */
        .hc-front, .hc-back {
          position: absolute;
          inset: 0;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .hc-back { transform: rotateY(180deg); }
        .hc-back-clip {
          position: absolute;
          inset: 0;
          clip-path: var(--card-clip, none);   /* same notched/bevel shape as the front */
          overflow: hidden;
          background: #0b0b12;
        }
        .hc-back-clip img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* New-section content, INSIDE the clip card. JS counter-scales it (so it
           never zooms with the card) and fades it in after the flip. */
        .hc-back-content {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 1rem;
          /* clear the grid's left vertical line + border on the other sides */
          padding: calc(clamp(14px, 1.5vw, 26px) + 2rem) calc(clamp(14px, 1.5vw, 26px) + 2rem)
                   calc(clamp(14px, 1.5vw, 26px) + 3rem) calc(clamp(78px, 7vw, 116px) + 2rem);
          transform-origin: center center;
          color: #fff;
          pointer-events: none;
        }
        .hb-tag {
          font-family: "Geist Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent-2, #ff2d3f);
        }
        .hb-title {
          font-family: "Instrument Serif", serif;
          font-weight: 500;
          font-size: clamp(2rem, 4.5vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.01em;
          max-width: 22ch;
          margin: 0;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        /* Shadow on its OWN solid shape, NOT on the card — so the browser never
           re-rasterizes the playing video to recompute the drop-shadow each frame
           (that was the scale-up/down glitch). Both layers share --card-clip. */
        .hc-shadow {
          position: absolute;
          inset: 0;
          clip-path: var(--card-clip, none);
          background: #0b0b12;
          filter: drop-shadow(0 38px 60px rgba(0,0,0,0.55));
          will-change: transform;
          backface-visibility: hidden;
        }
        .hc-clip {
          position: absolute;
          inset: 0;
          z-index: 1;
          clip-path: var(--card-clip, none);
          overflow: hidden;
          backface-visibility: hidden;
        }
        /* Two stacked image layers (cover-fit, oversized so the cursor parallax
           never reveals the card edges). foreground sits above background. */
        .hc-layers { position: absolute; inset: 0; }
        /* contain → the WHOLE 2:1 panorama is shown (not center-cropped). The card
           is taller than 16:9, so at full-screen the letterbox bands fall off-screen
           and the image fills the view; the small docked square shows them (dark). */
        .hc-bg-img, .hc-fg-img {
          position: absolute;
          inset: -4%;                 /* small headroom for the cursor parallax */
          width: 108%;
          height: 108%;
          max-width: none;            /* don't let the global img reset clamp these */
          max-height: none;
          object-fit: contain;
          display: block;
          transform-origin: center center;
          will-change: transform;
          backface-visibility: hidden;
        }
        .hc-fg-img { z-index: 1; }
        .hc-card-content { position: absolute; inset: 0; z-index: 2; pointer-events: none; }

        /* ── Side card: 3 parallax depth layers ───────────────────────────────
           cover-fit so the wide (3:1) panorama fills the portrait card with minimal
           crop; the -8% inset gives headroom so the parallax translate never bares an
           edge. Foreground sits on top and moves most → depth. */
        .hs-layers { position: absolute; inset: 0; }
        .hs-img {
          position: absolute;
          inset: -8%;
          width: 116%;
          height: 116%;
          max-width: none;    /* the global img{max-width:100%} reset was clamping the
                                 116% width → the card's right edge showed a bare strip */
          max-height: none;
          object-fit: cover;
          display: block;
          transform-origin: center center;
          /* NOT promoted to its own GPU layer (no will-change/backface): a composited
             child under a clip-path leaves a 1px seam at the cutout edge. Rendering it
             inside the clip's layer makes the tab edge clean. */
        }
        /* Vertical focal nudges — cover fits the panoramas by HEIGHT (no vertical
           overflow), so vertical centring is a fixed top shift instead of
           object-position: top% = -(8 + (focusY − 0.5) × 116), clamped to
           [-14.5%, -1.5%] so the 116%-tall layer always covers the card with ≥1.5%
           parallax headroom on both edges.
             bg  (sun 0.371, wants +6.96%) → clamped to -1.5% (art lacks headroom to
                 fully centre the sun; this is the safe maximum downshift)
             mid (rock 0.522)              → -10.55% (exact centre)
             fg  — no nudge: frame layer, keeps its designed composition */
        .hs-bg  { z-index: 1; top: -1.5%; }
        .hs-mid { z-index: 2; top: -10.55%; }
        .hs-fg  { z-index: 3; }

        /* Padded to sit INSIDE the grid frame: left clears the vertical line
           (matches GridFrame's --gf-col), right clears the border (--gf-inset). */
        .ab-grid { margin: 0; padding: clamp(5rem, 13vh, 12rem) calc(clamp(14px, 1.5vw, 26px) + 2rem) clamp(5rem, 13vh, 12rem) calc(clamp(78px, 7vw, 116px) + 2rem); display: grid; grid-template-columns: auto 1fr; gap: clamp(2rem, 6vw, 6rem); align-items: start; }
        .ab-rail { display: flex; gap: 1.2rem; align-items: flex-start; position: sticky; top: 14vh; }
        .ab-rail-line { width: 1px; height: clamp(8rem, 20vh, 16rem); background: linear-gradient(var(--accent), transparent); transform-origin: top; }
        .ab-rail-jp { font-family: var(--font-jp), serif; writing-mode: vertical-rl; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: 0.15em; color: transparent; -webkit-text-stroke: 1px rgba(230,0,18,0.55); }
        .ab-kicker { display: inline-flex; align-items: center; gap: 0.6rem; font-family: "Geist Mono", monospace; font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--accent-2); }
        .ab-kicker::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 14px var(--accent); }
        .ab-lead { font-family: "Instrument Serif", serif; font-size: clamp(1.7rem, 3.6vw, 3.2rem); line-height: 1.18; letter-spacing: -0.01em; margin: 1.2rem 0 1.8rem; max-width: 20ch; }
        .ab-lead em { font-style: italic; color: var(--accent-2); }
        .ab-p { max-width: 56ch; color: var(--ab-ink); opacity: 0.72; line-height: 1.7; font-size: clamp(1rem, 1.4vw, 1.18rem); margin-bottom: 1.1rem; }
        .ab-stats { display: flex; flex-wrap: wrap; gap: clamp(1.5rem, 5vw, 4rem); margin: 2.6rem 0 2.2rem; padding-top: 2rem; border-top: 1px solid var(--ab-line); }
        .ab-stat-value { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: clamp(2.6rem, 6vw, 4.5rem); line-height: 1; color: var(--ab-ink); }
        .ab-stat-value span { color: var(--accent); }
        .ab-stat-label { font-family: "Geist Mono", monospace; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ab-dim); margin-top: 0.4rem; }
        .ab-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .ab-tags span { font-family: "Geist Mono", monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ab-dim); padding: 0.45rem 0.85rem; border: 1px solid var(--ab-line); border-radius: 999px; transition: border-color 0.3s ease, color 0.3s ease; }
        .ab-tags span:hover { border-color: rgba(230,0,18,0.45); color: var(--ab-ink); }

        @media (max-width: 760px) {
          .ab-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .ab-rail { position: relative; top: 0; flex-direction: row; }
          .ab-rail-line { width: clamp(4rem, 30vw, 10rem); height: 1px; background: linear-gradient(90deg, var(--accent), transparent); transform-origin: left; }
          .ab-rail-jp { writing-mode: horizontal-tb; }
        }
      `}</style>

      <div className="ab-collapse">
        {/* Single side card — emerges from behind the main card during the shrink
            and docks vertically-centred at the right, inside the grid. Rounded
            rectangle with parallax images (shared for now; swap src for its own). */}
        <div className="hc-side" aria-hidden="true">
          <div className="hc-clip">
            <div className="hs-layers">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hs-img hs-bg" src={SIDE_ART.bg} alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hs-img hs-mid" src={SIDE_ART.mid} alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hs-img hs-fg" src={SIDE_ART.fg} alt="" />
            </div>
          </div>
        </div>

        <div className="hc-card">
          {/* FRONT — the parallax image card that shrinks/docks */}
          <div className="hc-front">
            <div className="hc-shadow" />
            <div className="hc-clip">
              <div className="hc-layers">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hc-bg-img" src="/card/beforeFlip/background.svg" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hc-fg-img" src="/card/beforeFlip/foreground.svg" alt="" />
              </div>
            </div>
            <div className="hc-card-content" />
          </div>

          {/* BACK — the new section revealed by the flip: image + its content, all
              inside the clip card (revealed in place, no separate element). */}
          <div className="hc-back">
            <div className="hc-back-clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/bg4.png" alt="" />
              <div className="hc-back-content">
                <span className="hb-tag">{BACK.tag}</span>
                <h2 className="hb-title">{BACK.title}</h2>
              </div>
            </div>
          </div>
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
