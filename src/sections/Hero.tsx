import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
import BasicNavigationBar from "../components/nav/navBar";
import info from "../data/information.json";
import Qualification from "./Introduction";
import { useRef, useState, useEffect } from "react";
import { useHeroAnimation } from "../hooks/useHeroAnimation";
import Image from "next/image";
import SectionData from "../data/sections_data.json";
import { use3dElement } from "../hooks/use3dElement"; // ✅ import
import { useFluidEffect } from "../hooks/useFluidEffect";
import FlashImageGallery from "../components/FlashImageGallery";

export default function Hero() {

  // const heroRef    = useRef<HTMLElement>(null);
  // const canvasRef  = useRef<HTMLCanvasElement>(null);
  // const contentRef = useRef<HTMLElement>(null);
  // const canvasRefInteractiveBG = useFluidEffect();

  // const [clipPath, setClipPath] = useState<string | undefined>(undefined);

  const heroRef    = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const canvasRefInteractiveBG = useFluidEffect();

  const [clipPath, setClipPath] = useState<string | undefined>(undefined);
  const [heroHeadlineText, setHeroHeadlineText] = useState(info.slogan);

  // use3dElement("container3D"); // ✅ call the hook

//   use3dElement("container3D", {
//   position: { x: 3, y: 0, z: 0 },  // move right, slightly down
//   rotation: { x: 10, y: -60, z: -76 },    // degrees on each axis
//   scale: 1.5,                             // 1 = auto size, >1 bigger, <1 smaller
// });

use3dElement(
  "container3D",

  // Initial transform
  {
    position: { x: 1.6, y: 0.75, z: 0 },
    rotation: { x: 10, y: -60, z: -79 },
    scale: 0.75,
  },

  // Scroll animation
  {
    speed: 0.71, // we removed the speed multiplier essentially or left it 1
    rotation: { x: 20, y: 360.5, z: 390 },
    position: { x: -2.25, y: -2, z: 0 }, // move left and down towards the Introduction tag
  },

  // Cursor reaction
  {
    rotation: { x: 15, y: 25 }, // max tilt in degrees when cursor at screen edge
    speed: 0.05,                 // lerp: 0.01 = very slow/floaty, 0.15 = snappy
  }
);

  useEffect(() => {
    const updateClipPath = () => {
      const heroEl = heroRef.current;
      const navEl = document.querySelector('.nav-links') as HTMLElement;
      const logoEl = document.querySelector('.nav-logo') as HTMLElement;

      if (!heroEl || !navEl || !logoEl) return;

      const W = heroEl.offsetWidth;
      const H = heroEl.offsetHeight;
      const R = 20;

      const navRect = navEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();

      const cutoutRightX = navRect.left - 10;
      const cutoutRightY = navEl.offsetHeight + navEl.offsetTop + 1;

      const cutoutLeftX = logoRect.right + 10;
      const cutoutLeftY = cutoutRightY; // Keep vertical depth symmetrical

      if (window.innerWidth < 1000) {
        setClipPath(undefined);
        return;
      }

      const path = `path("M ${cutoutLeftX + R} 0 L ${cutoutRightX - R} 0 A ${R} ${R} 0 0 1 ${cutoutRightX} ${R} L ${cutoutRightX} ${cutoutRightY - R} A ${R} ${R} 0 0 0 ${cutoutRightX + R} ${cutoutRightY} L ${W - R} ${cutoutRightY} A ${R} ${R} 0 0 1 ${W} ${cutoutRightY + R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L ${R} ${H} A ${R} ${R} 0 0 1 0 ${H - R} L 0 ${cutoutLeftY + R} A ${R} ${R} 0 0 1 ${R} ${cutoutLeftY} L ${cutoutLeftX - R} ${cutoutLeftY} A ${R} ${R} 0 0 0 ${cutoutLeftX} ${cutoutLeftY - R} L ${cutoutLeftX} ${R} A ${R} ${R} 0 0 1 ${cutoutLeftX + R} 0 Z")`;
      setClipPath(path);
    };

    updateClipPath();

    let observer: ResizeObserver | null = null;
    const navElObserver = document.querySelector('.nav-links');
    const logoElObserver = document.querySelector('.nav-logo');
    
    if (window.ResizeObserver) {
      observer = new ResizeObserver(updateClipPath);
      if (navElObserver) observer.observe(navElObserver);
      if (logoElObserver) observer.observe(logoElObserver);
    }
    window.addEventListener('resize', updateClipPath);

    return () => {
      window.removeEventListener('resize', updateClipPath);
      if (observer) observer.disconnect();
    };
  // }, []);

  // useHeroAnimation(heroRef, canvasRef, contentRef);

    }, []);

  useEffect(() => {
    const section = heroRef.current;
    const headline = headlineRef.current;
    const finalText = info.slogan;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    let revealInterval: ReturnType<typeof window.setInterval> | null = null;
    let iteration = 0;

    if (!section || !headline) return;

    const startReveal = () => {
      revealInterval = window.setInterval(() => {
        setHeroHeadlineText(
          finalText
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration) return finalText[index];
              return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("")
        );

        if (iteration >= finalText.length) {
          if (revealInterval) window.clearInterval(revealInterval);
          setHeroHeadlineText(finalText);
        }

        iteration += 0.5;
      }, 32);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startReveal();
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (revealInterval) window.clearInterval(revealInterval);
    };
  }, []);

  useHeroAnimation(heroRef, canvasRef, contentRef);


  return (
    <>
    <section className="hero" ref={heroRef}>


      <style>{`
        @import url('https://fonts.cdnfonts.com/css/ica-rubrik-black');
        @import url('https://fonts.cdnfonts.com/css/poppins');

        :root {
          --base-100: #ebf5df;
          --base-200: #fff;
          --base-300: #000;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        img { width: 100%; height: 100%; object-fit: cover; }
        h1, h2 {
          text-transform: uppercase;
          font-family: "Instrument Serif", sans-serif;
          font-weight: 500;
          line-height: 0.9;
        }
        h1 { font-size: clamp(4rem, 7.5vw, 10rem); }
        h2 { font-size: clamp(2.5rem, 4.5vw, 5rem); }
        p { font-family: "Instrument Sans", sans-serif; font-size: 1.125rem; font-weight: 400; }
        .hero {
          position: relative;
          width: 100%;
          height: 175svh;
          color: var(--base-200);
          overflow: hidden;
          contain: layout style;
        }
        .hero-img { width: 100%; height: 100%; position: absolute; inset: 0; top: -150px; }
        .hero-header {
          position: absolute;
          width: 100%;
          height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          // align-items: center;
          gap: 0.5rem;
          // text-align: center; 
        }
        .hero-header p { 
         width: 75%; 
         }
.engagment-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25rem;
  margin: 1rem 0 0.75rem;
}

.engagment-button button {
  padding: 0.85rem 1.45rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(24, 26, 31, 0.42);
  color: #fff;
  font-family: "Instrument Sans", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12),
              0 18px 45px rgba(0, 0, 0, 0.28);
  cursor: pointer;
}

        .hero-canvas { position: absolute; bottom: 0; width: 100%; height: 100%; pointer-events: none; }
        .hero-content {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 125svh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .hero-content h2 { width: 75%; color: var(--base-300); }
        @media (max-width: 1000px) { .hero-content h2 { width: calc(100% - 4rem); } }
        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: clip-path 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .container3D {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 100;
          pointer-events: none;
        }

        :root {
          /* Adjust the original gallery size and position here */
          --gallery-left: 14.1%;
          --gallery-top: 1%;
          --gallery-width: 12.5%;
          --gallery-height: 15%;
        }

        .gallery-trigger, .flash-image-gallery-container {
          position: fixed;
          left: var(--gallery-left);
          top: var(--gallery-top);
          width: var(--gallery-width);
          height: var(--gallery-height);
          border-radius: 25px;
        }

        .gallery-trigger {
          z-index: 200;
          cursor: pointer;
        }

        .flash-image-gallery-container {
          background-color: transparent;
          backdrop-filter: blur(75px);
          z-index: 50;
          transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          overflow: hidden;
          pointer-events: none;
        }

        .gallery-trigger:hover + .flash-image-gallery-container {
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100svh !important;
          border-radius: 0 !important;
          z-index: 150 !important;
        }
      `}</style>

      <div className="hero-bg" style={clipPath ? { clipPath } : {}}>
          <canvas
          ref={canvasRefInteractiveBG}
          style={{
            objectFit: 'cover',
            position: "absolute",
            top: "-150px",
            left: 0,
            width: "100%",
            height: "100%",
            inset: 0,
            scale: 1.75
          }}
          data-sizes="100vw"
          data-priority="true"
          data-quality={75}
        />

        <div className="hero-header" style={{}}>
          <div className="header-name" style={{textAlign: "center"}}><h1 style={{}}>{info.creativeFirstName}</h1></div>
          <div className="engagment-button" style={{}}>
            <button> Hire Me </button>
            <button> Message Me </button>
          </div>
            <p ref={headlineRef} aria-label={info.slogan}>{heroHeadlineText}</p>
        </div>

        <canvas className="hero-canvas" ref={canvasRef}></canvas>

        {/* ✅ container3D must have this id for the hook to find it */}
        <Qualification contentRef={contentRef} />

        <div id="container3D" className="container3D" />

        <div className="gallery-trigger"></div>
        <div className="flash-image-gallery-container">
          <FlashImageGallery 
            images={['/imageFlash/1.jpg', '/imageFlash/2.jpg', '/imageFlash/3.jpg']} 
            speedMs={400} 
            transitionDurationMs={50} 
          />
        </div>

      </div>

    </section>

    </>
  );
}





// // import HeroSectionCard from "../components/card/HeroSectionCard";
// import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
// import BasicNavigationBar from "../components/nav/navBar";
// import info from "../data/information.json";
// import Qualification from "./Introduction";
// import { useRef, useState, useEffect } from "react";
// import { useHeroAnimation } from "../hooks/useHeroAnimation";   
// import StringProgressReveal from "../components/StringProgressReveal";
// import Image from "next/image";
// import ImageSlider from "../components/ImageSlider";
// import SectionData from "../data/sections_data.json"
// import { Span } from "next/dist/trace";

// export default function Hero() {

//   const heroRef    = useRef<HTMLElement>(null);
//   const canvasRef  = useRef<HTMLCanvasElement>(null);
//   const contentRef = useRef<HTMLElement>(null);

//   const [clipPath, setClipPath] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     const updateClipPath = () => {
//       const heroEl = heroRef.current;
//       const navEl = document.querySelector('.nav-links') as HTMLElement;

//       if (!heroEl || !navEl) return;

//       const W = heroEl.offsetWidth;
//       const H = heroEl.offsetHeight;
//       const R = 20; // Radius for the curve

//       const navRect = navEl.getBoundingClientRect();
      
//       const cutoutLeft = navRect.left - 10; // 30px padding
//       const cutoutBottom = navEl.offsetHeight + navEl.offsetTop + 1; // 20px padding below nav

//       // If mobile view, links stack or behave differently, so we might not need the clip path
//       if (window.innerWidth < 1000) {
//         setClipPath(undefined);
//         return;
//       }

//       // Path with two SVG arcs (A commands) for the perfect rounded curve as requested
//       // const path = `path("M 0 0 L ${cutoutLeft - R} 0 A ${R} ${R} 0 0 1 ${cutoutLeft} ${R} L ${cutoutLeft} ${cutoutBottom - R} A ${R} ${R} 0 0 0 ${cutoutLeft + R} ${cutoutBottom} L ${W} ${cutoutBottom} L ${W} ${H} L 0 ${H} Z")`;
//       const path = `path("M 0 0 L ${cutoutLeft - R} 0 A ${R} ${R} 0 0 1 ${cutoutLeft} ${R} L ${cutoutLeft} ${cutoutBottom - R} A ${R} ${R} 0 0 0 ${cutoutLeft + R} ${cutoutBottom} L ${W - R} ${cutoutBottom} A ${R} ${R} 0 0 1 ${W} ${cutoutBottom + R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L 0 ${H} Z")`;
//       setClipPath(path);
//     };

//     updateClipPath();
    
//     // Use ResizeObserver to catch font loads or layout shifts
//     let observer: ResizeObserver | null = null;
//     const navEl = document.querySelector('.nav-links');
//     if (navEl && window.ResizeObserver) {
//       observer = new ResizeObserver(updateClipPath);
//       observer.observe(navEl);
//     }
//     window.addEventListener('resize', updateClipPath);

//     return () => {
//       window.removeEventListener('resize', updateClipPath);
//       if (observer) observer.disconnect();
//     };
//   }, []);

//   useHeroAnimation(heroRef, canvasRef, contentRef);

//   return (
//     <>
//     <section className="hero" ref={heroRef}>

//       <style>
//         {`

//         :root {
//           --base-100: #ebf5df;
//           // --base-200: #fec81d;
//           --base-200: #fff;
//           --base-300: #000;
//         }

//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         h1,
//         h2 {
//           text-transform: uppercase;
//           font-family: "Instrument Serif", sans-serif;
//           font-weight: 500;
//           line-height: 0.9;
//         }

//         h1 {
//           font-size: clamp(4rem, 7.5vw, 10rem);
//         }

//         h2 {
//           font-size: clamp(2.5rem, 4.5vw, 5rem);
//         }

//         p {
//           font-family: "Instrument Sans", sans-serif;
//           font-size: 1.125rem;
//           font-weight: 400;
//         }

//         .hero {
//           position: relative;
//           width: 100%;
//           height: 175svh;
//           color: var(--base-200);
//           overflow: hidden;
//           contain: layout style;
//         }

//         .hero-img {
//           width: 100%;
//           height: 100%;
//           position: absolute;
//           inset: 0;
//           top: -150px;
//         }

//         .hero-header {
//           position: absolute;
//           width: 100%;
//           height: 100svh;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           gap: 0.5rem;
//           text-align: center;
//         }

//         .hero-header p {
//           width: 75%;
//         }

//         .hero-canvas {
//           position: absolute;
//           bottom: 0;
//           width: 100%;
//           height: 100%;
//           pointer-events: none;
//         }

//         .hero-content {
//           position: absolute;
//           bottom: 0;
//           width: 100%;
//           height: 125svh;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           text-align: center;
//         }

//         .hero-content h2 {
//          width: 75%;
//          color: var(--base-300);
//         }

//         @media (max-width: 1000px) {
//          .hero-content h2 {
//            width: calc(100% - 4rem);
//          }
//         }

//         .hero-bg {
//           position: absolute;
//           inset: 0;
//           width: 100%;
//           height: 100%;
//           transition: clip-path 0.4s cubic-bezier(0.25, 1, 0.5, 1);
//         }

//         .container3D {
//         position: fixed:
//         inset: 0;
//         backgroundColor: yellow;
//         z-index: 100;
//         pointer-events: none;
//         }


//         `}
//       </style>

//       <div className="hero-bg" style={clipPath ? { clipPath } : {}}>
//         <div className="hero-img">

//         <Image
//           src={SectionData.hero.bgimage1}
//           alt="Hero Image"
//           fill
//           priority
//           sizes="100vw"
//           quality={75}
//           style={{ objectFit: 'cover' }}
//         />
//       </div>

//       <div className="hero-header">
//         <h1> {info.creativeFirstName} </h1>
//         <p> {info.headline} </p>
//       </div>

//       <canvas className="hero-canvas" ref={canvasRef}></canvas>

//       <div className="container3D">

//       </div>

//       {/* <div className="hero-content" ref={contentRef as React.RefObject<HTMLDivElement>}> */}
//         {/* <h2> {info.role} </h2> */}
//        <Qualification contentRef={contentRef} />
//       {/* </div> */}
//       </div>

//       {/* <section className="qualification">
//         <Qualification />
//       </section> */}

//       {/* <FluidCursorTrail /> */}
//     </section>

//     {/* <StringProgressReveal /> */}

//     {/* <ImageSlider /> */}

//     {/* <FluidCursorTrail /> */}

//     </>
//   );
// }





// // import HeroSectionCard from "../components/card/HeroSectionCard";
// import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
// import BasicNavigationBar from "../components/nav/navBar";
// import info from "../data/information.json";
// import Qualification from "./Introduction";
// import { useRef, useState, useEffect } from "react";
// import { useHeroAnimation } from "../hooks/useHeroAnimation";   
// import StringProgressReveal from "../components/StringProgressReveal";
// import Image from "next/image";
// import ImageSlider from "../components/ImageSlider";
// import SectionData from "../data/sections_data.json"
// import { Span } from "next/dist/trace";

// export default function Hero() {

//   const heroRef    = useRef<HTMLElement>(null);
//   const canvasRef  = useRef<HTMLCanvasElement>(null);
//   const contentRef = useRef<HTMLElement>(null);

//   const [clipPath, setClipPath] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     const updateClipPath = () => {
//       const heroEl = heroRef.current;
//       const navEl = document.querySelector('.nav-links') as HTMLElement;

//       if (!heroEl || !navEl) return;

//       const W = heroEl.offsetWidth;
//       const H = heroEl.offsetHeight;
//       const R = 20; // Radius for the curve

//       const navRect = navEl.getBoundingClientRect();
      
//       const cutoutLeft = navRect.left - 30; // 30px padding
//       const cutoutBottom = navEl.offsetHeight + navEl.offsetTop + 20; // 20px padding below nav

//       // If mobile view, links stack or behave differently, so we might not need the clip path
//       if (window.innerWidth < 1000) {
//         setClipPath(undefined);
//         return;
//       }

//       // Path with two SVG arcs (A commands) for the perfect rounded curve as requested
//       // const path = `path("M 0 0 L ${cutoutLeft - R} 0 A ${R} ${R} 0 0 1 ${cutoutLeft} ${R} L ${cutoutLeft} ${cutoutBottom - R} A ${R} ${R} 0 0 0 ${cutoutLeft + R} ${cutoutBottom} L ${W} ${cutoutBottom} L ${W} ${H} L 0 ${H} Z")`;
//       const path = `path("M 0 0 L ${cutoutLeft - R} 0 A ${R} ${R} 0 0 1 ${cutoutLeft} ${R} L ${cutoutLeft} ${cutoutBottom - R} A ${R} ${R} 0 0 0 ${cutoutLeft + R} ${cutoutBottom} L ${W - R} ${cutoutBottom} A ${R} ${R} 0 0 1 ${W} ${cutoutBottom + R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L 0 ${H} Z")`;
//       setClipPath(path);
//     };

//     updateClipPath();
    
//     // Use ResizeObserver to catch font loads or layout shifts
//     let observer: ResizeObserver | null = null;
//     const navEl = document.querySelector('.nav-links');
//     if (navEl && window.ResizeObserver) {
//       observer = new ResizeObserver(updateClipPath);
//       observer.observe(navEl);
//     }
//     window.addEventListener('resize', updateClipPath);

//     return () => {
//       window.removeEventListener('resize', updateClipPath);
//       if (observer) observer.disconnect();
//     };
//   }, []);

//   useHeroAnimation(heroRef, canvasRef, contentRef);

//   return (
//     <>
//     <section className="hero" ref={heroRef}>

//       <style>
//         {`

//         :root {
//           --base-100: #ebf5df;
//           // --base-200: #fec81d;
//           --base-200: #fff;
//           --base-300: #000;
//         }

//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         h1,
//         h2 {
//           text-transform: uppercase;
//           font-family: "Instrument Serif", sans-serif;
//           font-weight: 500;
//           line-height: 0.9;
//         }

//         h1 {
//           font-size: clamp(4rem, 7.5vw, 10rem);
//         }

//         h2 {
//           font-size: clamp(2.5rem, 4.5vw, 5rem);
//         }

//         p {
//           font-family: "Instrument Sans", sans-serif;
//           font-size: 1.125rem;
//           font-weight: 400;
//         }

//         .hero {
//           position: relative;
//           width: 100%;
//           height: 175svh;
//           color: var(--base-200);
//           overflow: hidden;
//           contain: layout style;
//         }

//         .hero-img {
//           width: 100%;
//           height: 100%;
//           position: absolute;
//           inset: 0;
//           top: -150px;
//         }

//         .hero-header {
//           position: absolute;
//           width: 100%;
//           height: 100svh;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           gap: 0.5rem;
//           text-align: center;
//         }

//         .hero-header p {
//           width: 75%;
//         }

//         .hero-canvas {
//           position: absolute;
//           bottom: 0;
//           width: 100%;
//           height: 100%;
//           pointer-events: none;
//         }

//         .hero-content {
//           position: absolute;
//           bottom: 0;
//           width: 100%;
//           height: 125svh;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           text-align: center;
//         }

//         .hero-content h2 {
//          width: 75%;
//          color: var(--base-300);
//         }

//         @media (max-width: 1000px) {
//          .hero-content h2 {
//            width: calc(100% - 4rem);
//          }
//         }

//         .hero-bg {
//           position: absolute;
//           inset: 0;
//           width: 100%;
//           height: 100%;
//           transition: clip-path 0.4s cubic-bezier(0.25, 1, 0.5, 1);
//         }


//         `}
//       </style>

//       <div className="hero-bg" style={clipPath ? { clipPath } : {}}>
//         <div className="hero-img">

//         <Image
//           src={SectionData.hero.bgimage1}
//           alt="Hero Image"
//           fill
//           priority
//           sizes="100vw"
//           quality={75}
//           style={{ objectFit: 'cover' }}
//         />
//       </div>

//       <div className="hero-header">
//         <h1> {info.creativeFirstName} </h1>
//         <p> {info.headline} </p>
//       </div>

//       <canvas className="hero-canvas" ref={canvasRef}></canvas>

//       {/* <div className="hero-content" ref={contentRef as React.RefObject<HTMLDivElement>}> */}
//         {/* <h2> {info.role} </h2> */}
//        <Qualification contentRef={contentRef} />
//       {/* </div> */}
//       </div>

//       {/* <section className="qualification">
//         <Qualification />
//       </section> */}

//       {/* <FluidCursorTrail /> */}
//     </section>

//     {/* <StringProgressReveal /> */}

//     {/* <ImageSlider /> */}

//     {/* <FluidCursorTrail /> */}

//     </>
//   );
// }