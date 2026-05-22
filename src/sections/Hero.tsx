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

const GlassButton = ({ children }: { children: React.ReactNode }) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add highlight effect
    const specular = e.currentTarget.querySelector('.glass-specular') as HTMLElement;
    if (specular) {
      specular.style.background = `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(255,255,255,0.15) 0%,
        rgba(255,255,255,0.05) 30%,
        rgba(255,255,255,0) 60%
      )`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const filter = document.querySelector('#glass-distortion feDisplacementMap');
    if (filter) {
      filter.setAttribute('scale', '77');
    }
    
    const specular = e.currentTarget.querySelector('.glass-specular') as HTMLElement;
    if (specular) {
      specular.style.background = 'none';
    }
  };

  return (
    <button className="glass-button" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="glass-filter"></div>
      <div className="glass-overlay"></div>
      <div className="glass-specular"></div>
      <div className="glass-content">
        <span>{children}</span>
      </div>
    </button>
  );
};

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
    let revealInterval: any = null;
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
          align-items: center; /* Center the buttons */
          gap: 0.5rem;
        }
        
        .header-name {
          position: absolute;
          left: 5%; /* Position on the left side like the reference */
          top: 45px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
        }

        .header-name h1 {
          font-family: 'ICA Rubrik', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
          font-weight: 900;
          font-size: clamp(4rem, 12vh, 12rem);
          color: transparent;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.85);
          writing-mode: vertical-rl;
          text-orientation: upright; /* Keeps Japanese upright, English stacks vertically */
          line-height: 0.85;
          letter-spacing: -0.05em;
          margin: 0;
          white-space: nowrap;
        }
.engagment-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25rem;
  margin: 1rem 0 0.75rem;
  z-index: 10; /* keep it above everything */
}

/* Glass Button Container */
.glass-button {
  --bg-color: rgba(255, 255, 255, 0.25);
  --highlight: rgba(255, 255, 255, 0.75);
  --text: #ffffff;
  
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 999px; /* Make it more pill shaped like previous buttons */
  cursor: pointer;
  overflow: hidden;
  background: transparent;
  transition: transform 0.2s ease;
  outline: none;
}

.glass-button:hover {
  transform: scale(1.05);
}

.glass-button:active {
  transform: scale(0.95);
}

.glass-filter,
.glass-overlay,
.glass-specular {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none; /* Make sure mouse events pass through to button */
}

.glass-filter {
  z-index: 1;
  backdrop-filter: blur(4px);
  filter: url(#glass-distortion) saturate(120%) brightness(1.15);
}

.glass-overlay {
  z-index: 2;
  background: var(--bg-color);
}

.glass-specular {
  z-index: 3;
  box-shadow: inset 1px 1px 1px var(--highlight);
  transition: background 0.1s ease;
}

.glass-content {
  position: relative;
  z-index: 4;
  color: var(--text);
  font-family: "Instrument Sans", sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .glass-button {
    --bg-color: rgba(0, 0, 0, 0.25);
    --highlight: rgba(255, 255, 255, 0.15);
  }
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

        .heroSlogan {
        font-family: var(--font-anurati);
        position: absolute;
        bottom: 3rem;
         left: 50%;
  transform: translateX(-50%);

  text-align: center;
  letter-spacing: 0.2em;
  font-size: 1.5rem;
        }
      `}</style>

      <BasicNavigationBar />

      <svg style={{ display: "none" }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      <div className="hero-bg" style={clipPath ? { clipPath } : {}}>
          <canvas
          ref={canvasRefInteractiveBG}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
          }}
          data-sizes="100vw"
          data-priority="true"
          data-quality={75}
        />

        <div className="hero-header">
          <div className="header-name">
            <h1>{info.creativeFirstName}</h1>
          </div>
          <div className="engagment-button" style={{}}>
            <GlassButton> Hire Me </GlassButton>
            <GlassButton> Contact </GlassButton>
          </div>
            <p className="heroSlogan" ref={headlineRef} aria-label={info.slogan}>{heroHeadlineText}</p>
        </div>

        <canvas className="hero-canvas" ref={canvasRef}></canvas>

        {/* ✅ container3D must have this id for the hook to find it */}
        <Qualification contentRef={contentRef} />

        {/* <div id="container3D" className="container3D" /> */}

        <div className="gallery-trigger"></div>
        {/* <div className="flash-image-gallery-container">
          <FlashImageGallery 
            images={['/imageFlash/1.jpg', '/imageFlash/2.jpg', '/imageFlash/3.jpg']} 
            speedMs={400} 
            transitionDurationMs={50} 
          />
        </div> */}

      </div>

    </section>

    </>
  );
}