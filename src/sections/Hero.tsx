// import HeroSectionCard from "../components/card/HeroSectionCard";
import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
import BasicNavigationBar from "../components/nav/navBar";
import info from "../data/information.json";
import Qualification from "./Introduction";
import { useRef, useState, useEffect } from "react";
import { useHeroAnimation } from "../hooks/useHeroAnimation";   
import StringProgressReveal from "../components/StringProgressReveal";
import Image from "next/image";
import ImageSlider from "../components/ImageSlider";
import SectionData from "../data/sections_data.json"
import { Span } from "next/dist/trace";

export default function Hero() {

  const heroRef    = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const [clipPath, setClipPath] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updateClipPath = () => {
      const heroEl = heroRef.current;
      const navEl = document.querySelector('.nav-links') as HTMLElement;

      if (!heroEl || !navEl) return;

      const W = heroEl.offsetWidth;
      const H = heroEl.offsetHeight;
      const R = 20; // Radius for the curve

      const navRect = navEl.getBoundingClientRect();
      
      const cutoutLeft = navRect.left - 30; // 30px padding
      const cutoutBottom = navEl.offsetHeight + navEl.offsetTop + 20; // 20px padding below nav

      // If mobile view, links stack or behave differently, so we might not need the clip path
      if (window.innerWidth < 1000) {
        setClipPath(undefined);
        return;
      }

      // Path with two SVG arcs (A commands) for the perfect rounded curve as requested
      // const path = `path("M 0 0 L ${cutoutLeft - R} 0 A ${R} ${R} 0 0 1 ${cutoutLeft} ${R} L ${cutoutLeft} ${cutoutBottom - R} A ${R} ${R} 0 0 0 ${cutoutLeft + R} ${cutoutBottom} L ${W} ${cutoutBottom} L ${W} ${H} L 0 ${H} Z")`;
      const path = `path("M 0 0 L ${cutoutLeft - R} 0 A ${R} ${R} 0 0 1 ${cutoutLeft} ${R} L ${cutoutLeft} ${cutoutBottom - R} A ${R} ${R} 0 0 0 ${cutoutLeft + R} ${cutoutBottom} L ${W - R} ${cutoutBottom} A ${R} ${R} 0 0 1 ${W} ${cutoutBottom + R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L 0 ${H} Z")`;
      setClipPath(path);
    };

    updateClipPath();
    
    // Use ResizeObserver to catch font loads or layout shifts
    let observer: ResizeObserver | null = null;
    const navEl = document.querySelector('.nav-links');
    if (navEl && window.ResizeObserver) {
      observer = new ResizeObserver(updateClipPath);
      observer.observe(navEl);
    }
    window.addEventListener('resize', updateClipPath);

    return () => {
      window.removeEventListener('resize', updateClipPath);
      if (observer) observer.disconnect();
    };
  }, []);

  useHeroAnimation(heroRef, canvasRef, contentRef);

  return (
    <>
    <section className="hero" ref={heroRef}>

      <style>
        {`

        :root {
          --base-100: #ebf5df;
          // --base-200: #fec81d;
          --base-200: #fff;
          --base-300: #000;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        h1,
        h2 {
          text-transform: uppercase;
          font-family: "Instrument Serif", sans-serif;
          font-weight: 500;
          line-height: 0.9;
        }

        h1 {
          font-size: clamp(4rem, 7.5vw, 10rem);
        }

        h2 {
          font-size: clamp(2.5rem, 4.5vw, 5rem);
        }

        p {
          font-family: "Instrument Sans", sans-serif;
          font-size: 1.125rem;
          font-weight: 400;
        }

        .hero {
          position: relative;
          width: 100%;
          height: 175svh;
          color: var(--base-200);
          overflow: hidden;
          contain: layout style;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          top: -150px;
        }

        .hero-header {
          position: absolute;
          width: 100%;
          height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .hero-header p {
          width: 75%;
        }

        .hero-canvas {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

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

        .hero-content h2 {
         width: 75%;
         color: var(--base-300);
        }

        @media (max-width: 1000px) {
         .hero-content h2 {
           width: calc(100% - 4rem);
         }
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: clip-path 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }


        `}
      </style>

      <div className="hero-bg" style={clipPath ? { clipPath } : {}}>
        <div className="hero-img">

        <Image
          src={SectionData.hero.bgimage1}
          alt="Hero Image"
          fill
          priority
          sizes="100vw"
          quality={75}
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="hero-header">
        <h1> {info.creativeFirstName} </h1>
        <p> {info.headline} </p>
      </div>

      <canvas className="hero-canvas" ref={canvasRef}></canvas>

      {/* <div className="hero-content" ref={contentRef as React.RefObject<HTMLDivElement>}> */}
        {/* <h2> {info.role} </h2> */}
       <Qualification contentRef={contentRef} />
      {/* </div> */}
      </div>

      {/* <section className="qualification">
        <Qualification />
      </section> */}

      {/* <FluidCursorTrail /> */}
    </section>

    {/* <StringProgressReveal /> */}

    {/* <ImageSlider /> */}

    {/* <FluidCursorTrail /> */}

    </>
  );
}