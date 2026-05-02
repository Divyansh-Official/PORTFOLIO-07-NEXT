"use client";

import { useEffect } from "react";
import Hero from "./Hero";
import info from "../data/information.json";
import loader from "../lottieFiles/Loader.json";
import server from "../lottieFiles/Server.json";
import wifi from "../lottieFiles/Wifi.json";
import deadpool from "../lottieFiles/Deadpool.json";
import Lottie from "lottie-react";

// ─── GSAP + Plugins ──────────────────────────────────────────────────────────
// SplitText splits text nodes into animatable word/line spans.
// CustomEase defines bespoke cubic-bezier curves referenced by name.
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import CustomEase from "gsap/CustomEase";

// Register plugins once at module level so they are available globally.
gsap.registerPlugin(SplitText, CustomEase);

// "hop"   – aggressive snap-in / snap-out: slow start, very slow end, fast middle.
// "glide" – smooth deceleration: fast start, gentle ease-out.
CustomEase.create("hop", "0.9, 0, 0.1, 1");
CustomEase.create("glide", "0.8, 0, 0.2, 1");
// ─────────────────────────────────────────────────────────────────────────────

export default function SplashScreen() {

  // ─── Animation bootstrap ───────────────────────────────────────────────────
  // Runs once after the component mounts (equivalent to DOMContentLoaded).
  // All GSAP queries are safe here because the DOM is fully painted.
  useEffect(() => {

    // ── Gate flag ────────────────────────────────────────────────────────────
    // Prevents the exit animation from firing before the intro finishes.
    let preloaderComplete = false;

    // ── DOM references ───────────────────────────────────────────────────────
    const preloaderTexts = document.querySelectorAll(".preloader p");
    const preloaderBtn   = document.querySelector(".preloader-btn-container") as HTMLElement;

    // Two concentric SVG circles:
    //   • stroke-track    → static background ring (always visible)
    //   • stroke-progress → animated fill ring (draws in as "loading" proceeds)
    const btnOutlineTrack    = document.querySelector(".stroke-track")    as SVGCircleElement;
    const btnOutlineProgress = document.querySelector(".stroke-progress") as SVGCircleElement;

    if (!btnOutlineTrack || !btnOutlineProgress || !preloaderBtn) return;

    // ── Circular progress circumference ─────────────────────────────────────
    // getTotalLength() returns the exact pixel length of the SVG path/circle.
    // All stroke-dashoffset math is relative to this value, so the animation
    // works regardless of circle radius or viewBox size.
    const svgPathLength = (btnOutlineTrack as SVGGeometryElement).getTotalLength();

    // ── Initial state: hide both rings ───────────────────────────────────────
    // strokeDasharray  = total length → one dash, one gap, both = full circle.
    // strokeDashoffset = total length → dash is pushed fully off-screen (invisible).
    // The track ring will be revealed by the introTl; the progress ring fills incrementally.
    gsap.set([btnOutlineTrack, btnOutlineProgress], {
      strokeDasharray:  svgPathLength,
      strokeDashoffset: svgPathLength,
    });

    // ── Text splitting ───────────────────────────────────────────────────────
    // SplitText wraps each line/word in a <div class="line|word">.
    // The CSS `mask: "lines"` / `mask: "words"` clips overflow so the
    // translateY(100%) starting position is invisible until animated up.

    // Split every <p> inside .preloader into individual line spans.
    preloaderTexts.forEach((p) => {
      new SplitText(p, {
        type: "lines",
        linesClass: "line",
        mask: "lines",
      });
    });

    // Split the hero headline into individual word spans.
    // These are held at translateY(100%) and animated in during the exit sequence.
    new SplitText(".hero h1", {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    // ─────────────────────────────────────────────────────────────────────────
    // INTRO TIMELINE
    // Runs automatically (delay: 1s) when the component mounts.
    // Sequence:
    //   1. Preloader body text slides up into view.
    //   2. Track ring draws around the button (simultaneously).
    //   3. SVG ring rotates 270° for a dramatic sweep effect.
    //   4. Progress ring fills in randomised "loading" increments.
    //   5. Deadpool logo fades out once "fully loaded".
    //   6. Button container scales down slightly, feeling "ready".
    //   7. "ENGAGE" label slides into view → sets preloaderComplete = true.
    // ─────────────────────────────────────────────────────────────────────────
    const introTl = gsap.timeline({ delay: 1 });

    // Step 1 + 2 + 3 ── text in, track ring draws, ring rotates (all overlap via "<")
    introTl
      .to(".preloader .p-row p .line", {
        // Slide each text line up from its masked-out starting position.
        y:        "0%",
        duration: 0.75,
        ease:     "power3.out",
        stagger:  0.1, // sequential cascade across all lines
      })
      .to(
        btnOutlineTrack,
        {
          // Draw the track ring from 0 → full circle by animating dashoffset to 0.
          strokeDashoffset: 0,
          duration:         2,
          ease:             "hop",
        },
        "<", // start at the same time as the text animation
      )
      .to(
        ".pbc-svg-strokes svg",
        {
          // Rotate the entire SVG 270° so the ring appears to sweep around.
          rotate:   270,
          duration: 2,
          ease:     "hop",
        },
        "<", // also overlap with track draw
      );

    // ── Randomised loading stops ─────────────────────────────────────────────
    // Simulates an authentic, non-linear progress bar by jumping to four
    // approximate percentages (20 % → 25 % → 85 % → 100 %) with small random
    // offsets so it never looks identical on repeat visits.
    const progressStops = [0.2, 0.25, 0.85, 1].map((base, i) => {
      if (i === 3) return 1; // always reach 100 % at the end
      return base + (Math.random() - 0.5) * 0.1;
    });

    // Step 4 ── progress ring fills in stages
    progressStops.forEach((stop, i) => {
      introTl.to(btnOutlineProgress, {
        // dashoffset counts DOWN from svgPathLength (invisible) toward 0 (full).
        // Multiplying by (1 – stop) converts a 0–1 fraction into remaining offset.
        strokeDashoffset: svgPathLength - svgPathLength * stop,
        duration:         0.75,
        ease:             "glide",
        // First stop has a fixed delay; subsequent stops get a tiny random pause
        // to reinforce the "loading" illusion.
        delay: i === 0 ? 0.3 : 0.3 + Math.random() * 0.2,
      });
    });

    // Step 5 + 6 + 7 ── logo out, button shrinks, "ENGAGE" label appears
    introTl
      .to(
        "#pbc-logo",
        {
          // Fade out the Deadpool Lottie once the progress ring completes.
          opacity:  0,
          duration: 0.35,
          ease:     "power1.out",
        },
        "-=0.25", // slightly before the last progress stop finishes
      )
      .to(
        preloaderBtn,
        {
          // Scale the entire button container down to a "pressable" feel.
          scale:    0.9,
          duration: 1.5,
          ease:     "hop",
        },
        "-=0.5",
      )
      .to(
        "#pbc-label .line",
        {
          // Reveal the "ENGAGE" label; when done, unlock the click handler.
          y:        "0%",
          duration: 0.75,
          ease:     "power3.out",
          onComplete: () => {
            preloaderComplete = true; // ← gate opens; user may now click
          },
        },
        "-=0.75",
      );

    // ─────────────────────────────────────────────────────────────────────────
    // EXIT SEQUENCE  (fires on button click, only if intro is complete)
    // Sequence:
    //   1. Preloader panel scales down toward the hero beneath it.
    //   2. Both ring outlines sweep off-screen in the opposite direction.
    //   3. "ENGAGE" label exits upward; "INITIALIZATION COMPLETED" enters.
    //   4. Preloader panel clips away to the left (wipe-out transition).
    //   5. Hero white revealer wipes away simultaneously (slightly offset).
    //   6. Hero panel scales up to full size.
    //   7. Hero headline words slide into view in a staggered cascade.
    // ─────────────────────────────────────────────────────────────────────────
    const handleClick = () => {
      if (!preloaderComplete) return; // guard: block double-clicks / early clicks
      preloaderComplete = false;      // prevent re-triggering mid-animation

      const exitTl = gsap.timeline();

      exitTl
        // Step 1 ── scale preloader down (reveals the hero section below)
        .to(".preloader", {
          scale:    0.75,
          duration: 1.25,
          ease:     "hop",
        })

        // Step 2 ── sweep both rings off-screen in the negative direction
        .to(
          [btnOutlineTrack, btnOutlineProgress],
          {
            strokeDashoffset: -svgPathLength, // negative → dash shoots past zero
            duration:         1.25,
            ease:             "hop",
          },
          "<", // overlap with scale-down
        )

        // Step 3a ── "ENGAGE" text exits upward
        .to(
          "#pbc-label .line",
          {
            y:        "-100%",
            duration: 0.75,
            ease:     "power3.out",
          },
          "-=1.25",
        )

        // Step 3b ── "INITIALIZATION COMPLETED" text enters from below
        .to(
          "#pbc-outro-label .line",
          {
            y:        "0%",
            duration: 0.75,
            ease:     "power3.out",
          },
          "-=0.75",
        )

        // Step 4 ── clip-path wipe: preloader slides out to the left
        // polygon goes from full-width rectangle → zero-width rectangle
        .to(".preloader", {
          clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
          duration: 1.5,
          ease:     "hop",
        })

        // Step 5 ── hero revealer (white overlay) wipes away in sync with preloader
        .to(
          ".preloader-revealer",
          {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            duration: 1.5,
            ease:     "hop",
            onComplete: () => {
              // Remove the preloader from the layout entirely once hidden,
              // so it no longer intercepts pointer events.
              gsap.set(".preloader", { display: "none" });
            },
          },
          "-=1.45", // nearly identical timing to the preloader wipe
        )

        // Step 6 ── hero scales from 0.75 (set in CSS) back to full size
        .to(".hero", {
          scale:    1,
          duration: 1.25,
          ease:     "hop",
        })

        // Step 7 ── headline words cascade up from behind their word-masks
        .to(
          ".hero h1 .word",
          {
            y:        "0%",
            duration: 1,
            ease:     "glide",
            stagger:  0.05, // each word follows 50 ms after the previous
          },
          "-=1.75", // starts well before the hero scale finishes for overlap
        );
    };

    // Attach click handler; cleaned up when component unmounts.
    preloaderBtn.addEventListener("click", handleClick);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    // Kill all running GSAP tweens and remove the event listener on unmount
    // to prevent memory leaks and stale animations.
    return () => {
      preloaderBtn.removeEventListener("click", handleClick);
      gsap.killTweensOf("*");
    };

  }, []); // empty dep array → runs once on mount, mirrors DOMContentLoaded
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="">

      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Geist+Mono:wght@100..900&display=swap");
          
          :root {
          --base-100: #fff;
          --base-200: #7a7a7a;
          --base-300: #000;
          }
          
          * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          }

          h1 {
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: clamp(5rem, 15vw, 15rem);
          letter-spacing: -02%;
          line-height: 0.8;
          }

          p{
          text-transform: uppercase;
          font-family: 'Geist Mono', monospace;
          font-weight: 500;
          font-size: 0.8rem;
          line-height: 1;
          }

          h1 .word,
          p .line {
          position: relative;
          transform: translateY(100%);
          will-change: transform;
          }

          .preloader-backdrop {
          position: fixed;
          width: 100%;
          height: 100%;
          background-color: var(--base-100);
          color: var(--base-200);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 0;
          }

          .pb-row {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          }

          .pb-row:nth-child(2) {
          align-items: flex-end;
          }

          .pb-row #pbc-logo {
          width: 2.5rem;
          height: 2.5rem;
          padding: 0.25rem;
          border: 1px dashed var(--base-200);
          }

          #pb-loader {
          width: 5rem;
          height: 5rem;
          justify-self: center;
          }

          #pb-server {
          width: 3rem;
          height: 3rem;
          justify-self: center;
          }

          .preloader {
          position: fixed;
          width: 100%;
          height: 100svh;
          background-color: var(--base-300);
          color: var(--base-100);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          will-change: clip-path;
          z-index: 2; 
          }

          .p-row {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          }

          .p-row .p-col {
          display: flex;
          gap: 6rem;
          align-items: flex-end;
          }

          #p-wifi {
          width: 3rem;
          height: 3rem;
          justify-self: center;
          }

          .preloader-btn-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20rem;
          height: 20rem;
          }

          .pbc-svg-strokes,
          #pbc-logo, #pbc-label, #pbc-outro-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          }

          #pbc-logo {
          width: 10rem;
          height: 10rem;
          }

          #pbc-label, #pbc-outro-label {
          font-size: 0.8rem;
          }

          .pbc-svg-strokes, .pbc-svg-strokes svg {
          width: 100%;
          height: 100%;
          will-change: transform;
          }

          .hero {
          position: relative;
          width: 100%;
          height: 100svh;
          // padding: 1.5rem;
          background-color: var(--base-300);
          color: var(--base-100);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transform: scale(0.75);
          will-change: transform;
          z-index: 1;
          }

          .hero .preloader-revealer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--base-100);
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          will-change: clip-path;
         }

         .hero h1 {
         width: 90%;
         }

         @media (max-width: 1000px) {
         .pb-row .pb-col:nth-child(1),
          .pb-row .pb-col:nth-child(2),
          .pb-row .pb-col:nth-child(5) {
          display: none;
         }
        `}
      </style>

      {/* ── Backdrop layer (z-index: 0) ────────────────────────────────────────
          Sits behind everything. Shows ambient "system boot" text and Lottie
          indicators that are visible through the scaled-down preloader panel
          during the exit animation. */}
      <div className="preloader-backdrop"> 
        <div className="pb-row">
          <div className="pb-col">
            <p> {info.creativeFirstName} </p>
            <p> {info.creativeLastName} </p>
          </div>
          <div className="pb-col">
            <p> REBOOTING THE PLATFORM </p>
            <p> .::.:::.::.::.:::.::. </p>
          </div>
          <div className="pb-col">
            <p> 役割 // {info.creativeRole} </p>
          </div>
          <div className="pb-col">
            <p> COMBINING THE PACKAGES </p>
            <p> /.////..//..//..///./ </p>
            <p> </p>
          </div>
          <div className="pb-col">
            <p> {info.creativeLocationCity} </p>
            <p> {info.creativeLocationState} </p>
          </div>
        </div>

        <div className="pb-row">
          <div className="pb-col">
              <p> - LOADING ASSETS </p>
              <p> - DEBUGGING PORTFOLIO </p>
              <p> - CREATING THE PAGES </p>
          </div>
          <div className="pb-col">
            <p> {info.creativeFieldsTop} </p>
            <p> {info.creativeFieldsBottom} </p>
          </div>
          <div className="pb-col">
              {/* Spinning loader Lottie — visual "activity" indicator */}
              <Lottie id="pb-loader"
              animationData={loader}
              loop={true}
              autoplay={true} />
              <p> ESTABLISHING CONNECTION </p>
          </div>
          <div className="pb-col">
            {/* Server Lottie — decorative tech indicator */}
            <Lottie id="pb-server"
            animationData={server}
            loop={true}
            autoplay={true} />
            <p> FINALIZING THE EXPERIENCE </p>
          </div>
          <div className="pb-col">
            <p> ------------------ </p>
            <p> ------------------ </p>
          </div>
          <div className="pb-col">
            <p> @ Copyright 2026 </p>
            <p> {info.name} </p>
          </div>
        </div>
      </div>

      {/* ── Preloader panel (z-index: 2) ───────────────────────────────────────
          Dark foreground screen. Clip-path starts as a full rectangle and is
          wiped to zero-width by the exit animation, revealing the hero below. */}
      <div className="preloader">
        {/* Top row — status label, fades in as first text animation runs */}
        <div className="p-row">
          <p> INITIALIZING </p>
        </div>

        {/* Bottom row — descriptive labels + wifi Lottie */}
        <div className="p-row">
          <div className="p-col">
            <div className="p-sub-col">
              <p> GRAPHIC LOADER </p>
              <p> SEQUENCIAL OPTIMISATION </p>
            </div>
            <div className="p-sub-col">
              <p> SIGNAL // SCAN </p>
              <p> INTERNAL LAYERS </p>
            </div>
          </div>
          <div className="p-col">
            {/* Wifi Lottie — decorative connectivity indicator */}
            <Lottie id="p-wifi"
            animationData={wifi}
            loop={true}
            autoplay={true} />
          </div>
        </div>

        {/* ── Central interactive button ──────────────────────────────────────
            Contains: Deadpool Lottie logo, two state labels ("CLICK TO ENGAGE" /
            "INITIALIZED"), and the two SVG circular progress rings.
            GSAP targets this entire container for scale + click handling. */}
        <div className="preloader-btn-container">

          {/* Deadpool Lottie — visual centrepiece, fades out when loading completes */}
          <Lottie id="pbc-logo"
          animationData={deadpool}
          loop={true}
          autoplay={true} />

          {/* "CLICK TO ENGAGE" — call-to-action label, slides in at end of intro timeline */}
          <p id="pbc-label"> CLICK TO ENGAGE </p>

          {/* "INITIALIZED" — swaps in during exit sequence */}
          <p id="pbc-outro-label"> INITIALIZED </p>

          {/* SVG ring container — rotated + drawn in by introTl */}
          <div className="pbc-svg-strokes">
            <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Track ring: full-circle reference stroke (dark, always present) */}
              <circle className="stroke-track"    cx="160" cy="160" r="155" stroke="#2b2b2b" strokeWidth="2" strokeDasharray="974" strokeDashoffset="974" />
              {/* Progress ring: animated white stroke that fills as "loading" proceeds */}
              <circle className="stroke-progress" cx="160" cy="160" r="155" stroke="#fff"    strokeWidth="2" strokeDasharray="974" strokeDashoffset="974" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Hero section (z-index: 1) ──────────────────────────────────────────
          Starts scaled to 0.75 (set in CSS). The preloader-revealer child acts
          as a white clipping mask that wipes away simultaneously with the
          preloader panel during the exit sequence. */}
      <section className="hero z-1"> <Hero /> </section>

    </div>
  );
}










// "use client";

// import { useEffect } from "react";
// import dynamic from "next/dynamic";
// import Hero from "./Hero";
// import info from "../data/information.json";
// import loader from "../lottieFiles/Loader.json";
// import server from "../lottieFiles/Server.json";
// import wifi from "../lottieFiles/Wifi.json";
// import deadpool from "../lottieFiles/Deadpool.json";

// // ─── Lottie: dynamic import with ssr: false ───────────────────────────────────
// // lottie-react relies on browser-only APIs (canvas, requestAnimationFrame).
// // Importing it normally causes Next.js SSR to receive an object instead of a
// // component function → "Element type is invalid" runtime error.
// // dynamic() defers the import to the client bundle; ssr: false ensures
// // the module is never evaluated on the server.
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// // ─── GSAP + Plugins ──────────────────────────────────────────────────────────
// // Do NOT import gsap, SplitText, or CustomEase at module level.
// // Next.js SSR evaluates ALL top-level imports on the server. Club GSAP plugins
// // (SplitText, CustomEase) touch browser globals (window, document) during their
// // own module initialisation — even before registerPlugin() is called — which
// // hangs Next.js hydration and leaves the tab stuck on "Loading...".
// // Solution: use dynamic await import() inside useEffect so the modules are
// // only ever fetched and evaluated inside the browser.
// // ─────────────────────────────────────────────────────────────────────────────

// export default function SplashScreen() {

//   // ─── Animation bootstrap ───────────────────────────────────────────────────
//   // Runs once after the component mounts (equivalent to DOMContentLoaded).
//   // All GSAP queries are safe here because the DOM is fully painted.
//   useEffect(() => {
//     // Mutable ref to the click handler so the synchronous cleanup
//     // function (returned below) can remove the exact same function instance.
//     let cleanupFn: (() => void) | null = null;

//     void (async () => {

//     // ── GSAP dynamic imports (browser-only) ─────────────────────────────────
//     // All three modules are loaded via await import() so they are NEVER
//     // evaluated on the server. This is the only reliable way to use Club GSAP
//     // plugins (SplitText, CustomEase) in Next.js without hanging hydration.
//     const { gsap }      = await import("gsap");
//     const { SplitText } = await import("gsap/SplitText");
//     const { default: CustomEase } = await import("gsap/CustomEase");

//     // Register plugins + define custom eases now that we're safely in the browser.
//     // "hop"   – aggressive snap: slow start/end, very fast middle.
//     // "glide" – smooth deceleration: fast start, gentle ease-out.
//     gsap.registerPlugin(SplitText, CustomEase);
//     CustomEase.create("hop",   "0.9, 0, 0.1, 1");
//     CustomEase.create("glide", "0.8, 0, 0.2, 1");

//     // ── Gate flag ────────────────────────────────────────────────────────────
//     // Prevents the exit animation from firing before the intro finishes.
//     let preloaderComplete = false;

//     // ── DOM references ───────────────────────────────────────────────────────
//     const preloaderTexts = document.querySelectorAll(".preloader p");
//     const preloaderBtn   = document.querySelector(".preloader-btn-container") as HTMLElement;

//     // Two concentric SVG circles:
//     //   • stroke-track    → static background ring (always visible)
//     //   • stroke-progress → animated fill ring (draws in as "loading" proceeds)
//     const btnOutlineTrack    = document.querySelector(".stroke-track")    as SVGCircleElement;
//     const btnOutlineProgress = document.querySelector(".stroke-progress") as SVGCircleElement;

//     if (!btnOutlineTrack || !btnOutlineProgress || !preloaderBtn) return;

//     // ── Circular progress circumference ─────────────────────────────────────
//     // getTotalLength() returns the exact pixel length of the SVG path/circle.
//     // All stroke-dashoffset math is relative to this value, so the animation
//     // works regardless of circle radius or viewBox size.
//     const svgPathLength = (btnOutlineTrack as SVGGeometryElement).getTotalLength();

//     // ── Initial state: hide both rings ───────────────────────────────────────
//     // strokeDasharray  = total length → one dash, one gap, both = full circle.
//     // strokeDashoffset = total length → dash is pushed fully off-screen (invisible).
//     // The track ring will be revealed by the introTl; the progress ring fills incrementally.
//     gsap.set([btnOutlineTrack, btnOutlineProgress], {
//       strokeDasharray:  svgPathLength,
//       strokeDashoffset: svgPathLength,
//     });

//     // ── Text splitting ───────────────────────────────────────────────────────
//     // SplitText wraps each line/word in a <div class="line|word">.
//     // The CSS `mask: "lines"` / `mask: "words"` clips overflow so the
//     // translateY(100%) starting position is invisible until animated up.

//     // Split every <p> inside .preloader into individual line spans.
//     preloaderTexts.forEach((p) => {
//       new SplitText(p, {
//         type: "lines",
//         linesClass: "line",
//         mask: "lines",
//       });
//     });

//     // Split the hero headline into individual word spans.
//     // These are held at translateY(100%) and animated in during the exit sequence.
//     new SplitText(".hero h1", {
//       type: "words",
//       wordsClass: "word",
//       mask: "words",
//     });

//     // ─────────────────────────────────────────────────────────────────────────
//     // INTRO TIMELINE
//     // Runs automatically (delay: 1s) when the component mounts.
//     // Sequence:
//     //   1. Preloader body text slides up into view.
//     //   2. Track ring draws around the button (simultaneously).
//     //   3. SVG ring rotates 270° for a dramatic sweep effect.
//     //   4. Progress ring fills in randomised "loading" increments.
//     //   5. Deadpool logo fades out once "fully loaded".
//     //   6. Button container scales down slightly, feeling "ready".
//     //   7. "ENGAGE" label slides into view → sets preloaderComplete = true.
//     // ─────────────────────────────────────────────────────────────────────────
//     const introTl = gsap.timeline({ delay: 1 });

//     // Step 1 + 2 + 3 ── text in, track ring draws, ring rotates (all overlap via "<")
//     introTl
//       .to(".preloader .p-row p .line", {
//         // Slide each text line up from its masked-out starting position.
//         y:        "0%",
//         duration: 0.75,
//         ease:     "power3.out",
//         stagger:  0.1, // sequential cascade across all lines
//       })
//       .to(
//         btnOutlineTrack,
//         {
//           // Draw the track ring from 0 → full circle by animating dashoffset to 0.
//           strokeDashoffset: 0,
//           duration:         2,
//           ease:             "hop",
//         },
//         "<", // start at the same time as the text animation
//       )
//       .to(
//         ".pbc-svg-strokes svg",
//         {
//           // Rotate the entire SVG 270° so the ring appears to sweep around.
//           rotate:   270,
//           duration: 2,
//           ease:     "hop",
//         },
//         "<", // also overlap with track draw
//       );

//     // ── Randomised loading stops ─────────────────────────────────────────────
//     // Simulates an authentic, non-linear progress bar by jumping to four
//     // approximate percentages (20 % → 25 % → 85 % → 100 %) with small random
//     // offsets so it never looks identical on repeat visits.
//     const progressStops = [0.2, 0.25, 0.85, 1].map((base, i) => {
//       if (i === 3) return 1; // always reach 100 % at the end
//       return base + (Math.random() - 0.5) * 0.1;
//     });

//     // Step 4 ── progress ring fills in stages
//     progressStops.forEach((stop, i) => {
//       introTl.to(btnOutlineProgress, {
//         // dashoffset counts DOWN from svgPathLength (invisible) toward 0 (full).
//         // Multiplying by (1 – stop) converts a 0–1 fraction into remaining offset.
//         strokeDashoffset: svgPathLength - svgPathLength * stop,
//         duration:         0.75,
//         ease:             "glide",
//         // First stop has a fixed delay; subsequent stops get a tiny random pause
//         // to reinforce the "loading" illusion.
//         delay: i === 0 ? 0.3 : 0.3 + Math.random() * 0.2,
//       });
//     });

//     // Step 5 + 6 + 7 ── logo out, button shrinks, "ENGAGE" label appears
//     introTl
//       .to(
//         "#pbc-logo",
//         {
//           // Fade out the Deadpool Lottie once the progress ring completes.
//           opacity:  0,
//           duration: 0.35,
//           ease:     "power1.out",
//         },
//         "-=0.25", // slightly before the last progress stop finishes
//       )
//       .to(
//         preloaderBtn,
//         {
//           // Scale the entire button container down to a "pressable" feel.
//           scale:    0.9,
//           duration: 1.5,
//           ease:     "hop",
//         },
//         "-=0.5",
//       )
//       .to(
//         "#pbc-label .line",
//         {
//           // Reveal the "ENGAGE" label; when done, unlock the click handler.
//           y:        "0%",
//           duration: 0.75,
//           ease:     "power3.out",
//           onComplete: () => {
//             preloaderComplete = true; // ← gate opens; user may now click
//           },
//         },
//         "-=0.75",
//       );

//     // ─────────────────────────────────────────────────────────────────────────
//     // EXIT SEQUENCE  (fires on button click, only if intro is complete)
//     // Sequence:
//     //   1. Preloader panel scales down toward the hero beneath it.
//     //   2. Both ring outlines sweep off-screen in the opposite direction.
//     //   3. "ENGAGE" label exits upward; "INITIALIZATION COMPLETED" enters.
//     //   4. Preloader panel clips away to the left (wipe-out transition).
//     //   5. Hero white revealer wipes away simultaneously (slightly offset).
//     //   6. Hero panel scales up to full size.
//     //   7. Hero headline words slide into view in a staggered cascade.
//     // ─────────────────────────────────────────────────────────────────────────
//     const handleClick = () => {
//       if (!preloaderComplete) return; // guard: block double-clicks / early clicks
//       preloaderComplete = false;      // prevent re-triggering mid-animation

//       const exitTl = gsap.timeline();

//       exitTl
//         // Step 1 ── scale preloader down (reveals the hero section below)
//         .to(".preloader", {
//           scale:    0.75,
//           duration: 1.25,
//           ease:     "hop",
//         })

//         // Step 2 ── sweep both rings off-screen in the negative direction
//         .to(
//           [btnOutlineTrack, btnOutlineProgress],
//           {
//             strokeDashoffset: -svgPathLength, // negative → dash shoots past zero
//             duration:         1.25,
//             ease:             "hop",
//           },
//           "<", // overlap with scale-down
//         )

//         // Step 3a ── "ENGAGE" text exits upward
//         .to(
//           "#pbc-label .line",
//           {
//             y:        "-100%",
//             duration: 0.75,
//             ease:     "power3.out",
//           },
//           "-=1.25",
//         )

//         // Step 3b ── "INITIALIZATION COMPLETED" text enters from below
//         .to(
//           "#pbc-outro-label .line",
//           {
//             y:        "0%",
//             duration: 0.75,
//             ease:     "power3.out",
//           },
//           "-=0.75",
//         )

//         // Step 4 ── clip-path wipe: preloader slides out to the left
//         // polygon goes from full-width rectangle → zero-width rectangle
//         .to(".preloader", {
//           clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
//           duration: 1.5,
//           ease:     "hop",
//         })

//         // Step 5 ── hero revealer (white overlay) wipes away in sync with preloader
//         .to(
//           ".preloader-revealer",
//           {
//             clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
//             duration: 1.5,
//             ease:     "hop",
//             onComplete: () => {
//               // Remove the preloader from the layout entirely once hidden,
//               // so it no longer intercepts pointer events.
//               gsap.set(".preloader", { display: "none" });
//             },
//           },
//           "-=1.45", // nearly identical timing to the preloader wipe
//         )

//         // Step 6 ── hero scales from 0.75 (set in CSS) back to full size
//         .to(".hero", {
//           scale:    1,
//           duration: 1.25,
//           ease:     "hop",
//         })

//         // Step 7 ── headline words cascade up from behind their word-masks
//         .to(
//           ".hero h1 .word",
//           {
//             y:        "0%",
//             duration: 1,
//             ease:     "glide",
//             stagger:  0.05, // each word follows 50 ms after the previous
//           },
//           "-=1.75", // starts well before the hero scale finishes for overlap
//         );
//     };

//     // Store ref for synchronous cleanup, then attach.
//     cleanupFn = handleClick;
//     preloaderBtn.addEventListener("click", handleClick);

//   // Close the async IIFE — the return cleanup runs synchronously in useEffect.
//   })();

//   // ── Cleanup ────────────────────────────────────────────────────────────────
//   // Returned synchronously from useEffect. Removes the exact handler instance
//   // via the cleanupFn ref, and kills all active GSAP tweens.
//   return () => {
//     const btn = document.querySelector(".preloader-btn-container");
//     if (btn && cleanupFn) btn.removeEventListener("click", cleanupFn);
//     import("gsap").then(({ gsap }) => gsap.killTweensOf("*"));
//   };

//   }, []); // empty dep array → runs once on mount, mirrors DOMContentLoaded
//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="">

//       <style>
//         {`
//           @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Geist+Mono:wght@100..900&display=swap");
          
//           :root {
//           --base-100: #fff;
//           --base-200: #7a7a7a;
//           --base-300: #000;
//           }
          
//           * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//           }

//           h1 {
//           text-transform: uppercase;
//           font-family: 'Barlow Condensed', sans-serif;
//           font-weight: 800;
//           font-size: clamp(5rem, 15vw, 15rem);
//           letter-spacing: -02%;
//           line-height: 0.8;
//           }

//           p{
//           text-transform: uppercase;
//           font-family: 'Geist Mono', monospace;
//           font-weight: 500;
//           font-size: 0.8rem;
//           line-height: 1;
//           }

//           h1 .word,
//           p .line {
//           position: relative;
//           transform: translateY(100%);
//           will-change: transform;
//           }

//           .preloader-backdrop {
//           position: fixed;
//           width: 100%;
//           height: 100%;
//           background-color: var(--base-100);
//           color: var(--base-200);
//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;
//           z-index: 0;
//           }

//           .pb-row {
//           width: 100%;
//           padding: 1.5rem;
//           display: flex;
//           justify-content: space-between;
//           }

//           .pb-row:nth-child(2) {
//           align-items: flex-end;
//           }

//           .pb-row #pbc-logo {
//           width: 2.5rem;
//           height: 2.5rem;
//           padding: 0.25rem;
//           border: 1px dashed var(--base-200);
//           }

//           #pb-loader {
//           width: 5rem;
//           height: 5rem;
//           justify-self: center;
//           }

//           #pb-server {
//           width: 3rem;
//           height: 3rem;
//           justify-self: center;
//           }

//           .preloader {
//           position: fixed;
//           width: 100%;
//           height: 100svh;
//           background-color: var(--base-300);
//           color: var(--base-100);
//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;
//           clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
//           will-change: clip-path;
//           z-index: 2; 
//           }

//           .p-row {
//           width: 100%;
//           padding: 1.5rem;
//           display: flex;
//           justify-content: space-between;
//           }

//           .p-row .p-col {
//           display: flex;
//           gap: 6rem;
//           align-items: flex-end;
//           }

//           #p-wifi {
//           width: 3rem;
//           height: 3rem;
//           justify-self: center;
//           }

//           .preloader-btn-container {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           width: 20rem;
//           height: 20rem;
//           }

//           .pbc-svg-strokes,
//           #pbc-logo, #pbc-label, #pbc-outro-label {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           }

//           #pbc-logo {
//           width: 10rem;
//           height: 10rem;
//           }

//           #pbc-label, #pbc-outro-label {
//           font-size: 0.8rem;
//           }

//           .pbc-svg-strokes, .pbc-svg-strokes svg {
//           width: 100%;
//           height: 100%;
//           will-change: transform;
//           }

//           .hero {
//           position: relative;
//           width: 100%;
//           height: 100svh;
//           padding: 1.5rem;
//           background-color: var(--base-300);
//           color: var(--base-100);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           text-align: center;
//           transform: scale(0.75);
//           will-change: transform;
//           z-index: 1;
//           }

//           .hero .preloader-revealer {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background-color: var(--base-100);
//           clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
//           will-change: clip-path;
//          }

//          .hero h1 {
//          width: 90%;
//          }

//          @media (max-width: 1000px) {
//          .pb-row .pb-col:nth-child(1),
//           .pb-row .pb-col:nth-child(2),
//           .pb-row .pb-col:nth-child(5) {
//           display: none;
//          }
//         `}
//       </style>

//       {/* ── Backdrop layer (z-index: 0) ────────────────────────────────────────
//           Sits behind everything. Shows ambient "system boot" text and Lottie
//           indicators that are visible through the scaled-down preloader panel
//           during the exit animation. */}
//       <div className="preloader-backdrop"> 
//         <div className="pb-row">
//           <div className="pb-col">
//             <p> {info.creativeFirstName} </p>
//             <p> {info.creativeLastName} </p>
//           </div>
//           <div className="pb-col">
//             <p> REBOOTING THE PLATFORM </p>
//             <p> .::.:::.::.::.:::.::. </p>
//           </div>
//           <div className="pb-col">
//             <p> 役割 // {info.creativeRole} </p>
//           </div>
//           <div className="pb-col">
//             <p> COMBINING THE PACKAGES </p>
//             <p> /.////..//..//..///./ </p>
//             <p> </p>
//           </div>
//           <div className="pb-col">
//             <p> {info.creativeLocationCity} </p>
//             <p> {info.creativeLocationState} </p>
//           </div>
//         </div>

//         <div className="pb-row">
//           <div className="pb-col">
//               <p> - LOADING ASSETS </p>
//               <p> - DEBUGGING PORTFOLIO </p>
//               <p> - CREATING THE PAGES </p>
//           </div>
//           <div className="pb-col">
//             <p> {info.creativeFieldsTop} </p>
//             <p> {info.creativeFieldsBottom} </p>
//           </div>
//           <div className="pb-col">
//               {/* Spinning loader Lottie — visual "activity" indicator */}
//               <Lottie id="pb-loader"
//               animationData={loader}
//               loop={true}
//               autoplay={true} />
//               <p> ESTABLISHING CONNECTION </p>
//           </div>
//           <div className="pb-col">
//             {/* Server Lottie — decorative tech indicator */}
//             <Lottie id="pb-server"
//             animationData={server}
//             loop={true}
//             autoplay={true} />
//             <p> FINALIZING THE EXPERIENCE </p>
//           </div>
//           <div className="pb-col">
//             <p> ------------------ </p>
//             <p> ------------------ </p>
//           </div>
//           <div className="pb-col">
//             <p> @ Copyright 2026 </p>
//             <p> {info.name} </p>
//           </div>
//         </div>
//       </div>

//       {/* ── Preloader panel (z-index: 2) ───────────────────────────────────────
//           Dark foreground screen. Clip-path starts as a full rectangle and is
//           wiped to zero-width by the exit animation, revealing the hero below. */}
//       <div className="preloader">
//         {/* Top row — status label, fades in as first text animation runs */}
//         <div className="p-row">
//           <p> INITIALIZING </p>
//         </div>

//         {/* Bottom row — descriptive labels + wifi Lottie */}
//         <div className="p-row">
//           <div className="p-col">
//             <div className="p-sub-col">
//               <p> GRAPHIC LOADER </p>
//               <p> SEQUENCIAL OPTIMISATION </p>
//             </div>
//             <div className="p-sub-col">
//               <p> SIGNAL // SCAN </p>
//               <p> INTERNAL LAYERS </p>
//             </div>
//           </div>
//           <div className="p-col">
//             {/* Wifi Lottie — decorative connectivity indicator */}
//             <Lottie id="p-wifi"
//             animationData={wifi}
//             loop={true}
//             autoplay={true} />
//           </div>
//         </div>

//         {/* ── Central interactive button ──────────────────────────────────────
//             Contains: Deadpool Lottie logo, two state labels ("ENGAGE" /
//             "INITIALIZATION COMPLETED"), and the two SVG circular progress rings.
//             GSAP targets this entire container for scale + click handling. */}
//         <div className="preloader-btn-container">

//           {/* Deadpool Lottie — visual centrepiece, fades out when loading completes */}
//           <Lottie id="pbc-logo"
//           animationData={deadpool}
//           loop={true}
//           autoplay={true} />

//           {/* "ENGAGE" — call-to-action label, slides in at end of intro timeline */}
//           <p id="pbc-label"> ENGAGE </p>

//           {/* "INITIALIZATION COMPLETED" — swaps in during exit sequence */}
//           <p id="pbc-outro-label"> INITIALIZATION COMPLETED </p>

//           {/* SVG ring container — rotated + drawn in by introTl */}
//           <div className="pbc-svg-strokes">
//             <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
//               {/* Track ring: full-circle reference stroke (dark, always present) */}
//               <circle className="stroke-track"    cx="160" cy="160" r="155" stroke="#2b2b2b" strokeWidth="2" strokeDasharray="974" strokeDashoffset="974" />
//               {/* Progress ring: animated white stroke that fills as "loading" proceeds */}
//               <circle className="stroke-progress" cx="160" cy="160" r="155" stroke="#fff"    strokeWidth="2" strokeDasharray="974" strokeDashoffset="974" />
//             </svg>
//           </div>
//         </div>
//       </div>

//       {/* ── Hero section (z-index: 1) ──────────────────────────────────────────
//           Starts scaled to 0.75 (set in CSS). The preloader-revealer child acts
//           as a white clipping mask that wipes away simultaneously with the
//           preloader panel during the exit sequence. */}
//       <section className="hero z-1"> <Hero /> </section>

//     </div>
//   );
// }