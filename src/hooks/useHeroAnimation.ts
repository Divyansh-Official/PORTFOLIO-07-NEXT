import { useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

// ── Shaders ───────────────────────────────────────────────────────────────────

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uSpread;
  varying vec2 vUv;

  float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
  }
  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(
      mix(Hash(i + vec2(0., 0.)), Hash(i + vec2(1., 0.)), f.x),
      mix(Hash(i + vec2(0., 1.)), Hash(i + vec2(1., 1.)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.;
    v += noise(p)      * 0.500;
    v += noise(p * 2.) * 0.250;
    v += noise(p * 4.) * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

    float dissolveEdge = uv.y - uProgress * 1.2;
    float noiseValue   = fbm(centeredUv * 15.0);
    float d            = dissolveEdge + noiseValue * uSpread;

    float pixelSize = 1.0 / uResolution.y;
    float alpha     = 1.0 - smoothstep(-pixelSize, pixelSize, d);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ── Config ────────────────────────────────────────────────────────────────────

// color: "#ebf5df", "#43202b", "#2E0D13"
const CONFIG = { color: "#000000", spread: 0.5, speed: 1.75 };

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 }
    : { r: 0.89, g: 0.89, b: 0.89 };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHeroAnimation(
  heroRef:    React.RefObject<HTMLElement | null>,
  canvasRef:  React.RefObject<HTMLCanvasElement | null>,
  contentRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const hero    = heroRef.current;
    const canvas  = canvasRef.current;
    const content = contentRef.current;
    if (!hero || !canvas || !content) return;

    // ── GPU compositing hint (only on the canvas — avoid over-promoting) ─────
    canvas.style.willChange = "transform";

    // ── Lenis — performance-tuned ─────────────────────────────────────────────
    const lenis = new Lenis({
      lerp: 0.1,           // smoother but responsive — less per-frame interpolation
      syncTouch: true,      // bypass expensive touch smoothing
      touchMultiplier: 1.5, // responsive touch scrolling
    });
    const lenisHandler = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisHandler);
    gsap.ticker.lagSmoothing(0);

    // ── Three.js ──────────────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });

    const rgb      = hexToRgb(CONFIG.color);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress:   { value: 0 },
        uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
        uColor:      { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
        uSpread:     { value: CONFIG.spread },
      },
      transparent: true,
    });
    scene.add(new THREE.Mesh(geometry, material));

    let resizeTimer: ReturnType<typeof setTimeout>;
    function resize() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(1);  // Always 1× — shader is full-screen, 2× is ~4× GPU work
      material.uniforms.uResolution.value.set(w, h);
    }
    resize();
    const debouncedResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener("resize", debouncedResize);

    // ── Scroll → shader progress ──────────────────────────────────────────────
    let scrollProgress = 0;
    let needsRender    = false;

    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      const maxScroll = hero.offsetHeight - window.innerHeight;
      scrollProgress  = Math.min((scroll / maxScroll) * CONFIG.speed, 1.1);
      needsRender     = true;
    });

    renderer.render(scene, camera);

    let heroVisible = true;
    const threeHandler = () => {
      if (!needsRender) return;
      // Stop rendering once the hero is fully scrolled past
      heroVisible = scrollProgress < 1.1;
      if (!heroVisible) { needsRender = false; return; }
      material.uniforms.uProgress.value = scrollProgress;
      renderer.render(scene, camera);
      needsRender = false;
    };
    gsap.ticker.add(threeHandler);

    // ── Hero header parallax ──────────────────────────────────────────────────
    const heroHeader = hero.querySelector(".hero-header") as HTMLElement | null;
    if (heroHeader) {
      heroHeader.style.willChange = "transform";

      gsap.to(heroHeader, {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    }

    // ── SplitText word fade ───────────────────────────────────────────────────
    const h2 = content.querySelector("h2") as HTMLElement | null;
    if (!h2) return;

    const split   = new SplitText(h2, { type: "words" });
    const words   = split.words as HTMLElement[];
    words.forEach(w => { w.style.willChange = "opacity"; });
    const setters = words.map(w => gsap.quickSetter(w, "opacity") as (v: number) => void);
    gsap.set(words, { opacity: 0 });

    const wordST = ScrollTrigger.create({
      trigger: content,
      start: "top 25%",
      end: "bottom 100%",
      onUpdate: ({ progress }) => {
        const total = words.length;
        for (let i = 0; i < total; i++) {
          const wp  = i / total;
          const nwp = (i + 1) / total;
          setters[i](
            progress >= nwp ? 1 :
            progress >= wp  ? (progress - wp) / (nwp - wp) :
            0
          );
        }
      },
    });

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      gsap.ticker.remove(lenisHandler);
      gsap.ticker.remove(threeHandler);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      lenis.destroy();
      wordST.kill();
      split.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      canvas.style.willChange  = "";
      if (heroHeader) heroHeader.style.willChange = "";
      words.forEach(w => { w.style.willChange = ""; });
    };
  }, [heroRef, canvasRef, contentRef]);
}
