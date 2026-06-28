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
  uniform float uProgress1;
  uniform float uProgress2;
  uniform vec2 uResolution;
  uniform float uSpread;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform vec2 uTexRes1;
  uniform vec2 uTexRes2;
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

  // Cover-fit the reveal image to the canvas (fill, crop the overflow).
  vec2 coverUV(vec2 uv, vec2 res, vec2 texSize) {
    if (texSize.x < 1.0 || texSize.y < 1.0) return uv;
    vec2 s = res / texSize;
    float scale = max(s.x, s.y);
    vec2 scaled = texSize * scale;
    vec2 offset = (res - scaled) * 0.5;
    return (uv * res - offset) / scaled;
  }

  // Noise-edged dissolve mask: 0 (hidden) → 1 (revealed) as progress grows.
  float dissolveAlpha(vec2 uv, float progress, float noiseV) {
    float edge = uv.y + uSpread - progress * (1.0 + uSpread * 2.0);
    float d    = edge + noiseV * uSpread;
    float px   = 1.0 / uResolution.y;
    return 1.0 - smoothstep(-px, px, d);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);
    float noiseV = fbm(centeredUv * 15.0);

    // Stage 1: bg2 dissolves in over the fluid background.
    // Stage 2: bg3 dissolves in over bg2 — same noise edge, just delayed.
    float a1 = dissolveAlpha(uv, uProgress1, noiseV);
    float a2 = dissolveAlpha(uv, uProgress2, noiseV);

    vec4 c1 = texture2D(uTex1, coverUV(uv, uResolution, uTexRes1));
    vec4 c2 = texture2D(uTex2, coverUV(uv, uResolution, uTexRes2));

    vec3 color  = mix(c1.rgb, c2.rgb, a2);  // bg3 over bg2
    float alpha = max(a1, a2);              // opaque where either is revealed
    gl_FragColor = vec4(color, alpha);
  }
`;

// ── Config ────────────────────────────────────────────────────────────────────

// image: the picture the dissolve reveals over the fluid background as you
// scroll (swap for any path under /public). spread = dissolve edge softness,
// speed = how fast the reveal completes relative to the hero's scroll.
// speed 1 → the bg2 reveal completes exactly as the hero finishes scrolling,
// handing off seamlessly to the collapse card at the top of the next section.
const CONFIG = { image1: "/hero/bg2.png", image2: "/hero/bg3.png", spread: 0.5, speed: 0.5 };

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
    // Expose Lenis so the nav (and anything else) can smooth-scroll to anchors.
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    // CRITICAL: keep ScrollTrigger in sync with Lenis' smooth scroll. Without
    // this, wheel-driven desktop scrolling never updates triggers, so every
    // gsap.from(opacity:0) reveal stays stuck hidden on desktop. (Mobile touch
    // uses native scroll events, which is why it appeared to work there.)
    lenis.on("scroll", ScrollTrigger.update);
    const lenisHandler = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisHandler);
    gsap.ticker.lagSmoothing(0);

    // ── Three.js ──────────────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });

    const geometry = new THREE.PlaneGeometry(2, 2);

    // Two images revealed in sequence — bg2 first, then bg3 over it. Cover-fit, sRGB.
    const loadTex = (url: string, onLoad: (t: THREE.Texture) => void) => {
      const t = new THREE.TextureLoader().load(url, onLoad);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const tex1 = loadTex(CONFIG.image1, (t) => {
      const img = t.image as { width: number; height: number };
      material.uniforms.uTexRes1.value.set(img.width, img.height);
    });
    const tex2 = loadTex(CONFIG.image2, (t) => {
      const img = t.image as { width: number; height: number };
      material.uniforms.uTexRes2.value.set(img.width, img.height);
    });

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress1:  { value: 0 },
        uProgress2:  { value: 0 },
        uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
        uSpread:     { value: CONFIG.spread },
        uTex1:       { value: tex1 },
        uTex2:       { value: tex2 },
        uTexRes1:    { value: new THREE.Vector2(1, 1) },
        uTexRes2:    { value: new THREE.Vector2(1, 1) },
      },
      transparent: true,
    });
    scene.add(new THREE.Mesh(geometry, material));

    let resizeTimer: any;
    function resize() {
      if (!hero) return;
      const w = hero.offsetWidth, h = hero.offsetHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(1);  // Always 1× — shader is full-screen, 2× is ~4× GPU work
      material.uniforms.uResolution.value.set(w, h);
    }
    resize();
    const debouncedResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener("resize", debouncedResize);

    // ── Scroll → shader progress ──────────────────────────────────────────────
    // Two reveals across the hero scroll: bg2 over the first ~half, then bg3
    // over bg2 across the second half (so by the hero end you're on bg3).
    let scrollProgress1 = 0;
    let scrollProgress2 = 0;
    let needsRender     = false;

    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      const maxScroll = hero.offsetHeight - window.innerHeight;
      const t = Math.min(Math.max(scroll / maxScroll, 0), 1) * CONFIG.speed;
      // bg2 done by ~t=0.39, bg3 done (and frozen) by ~t=0.79 — a buffer before
      // the collapse pin engages at t=1, so nothing re-renders during the pin.
      scrollProgress1 = Math.min(t * 2.8, 1.1);                      // bg2 reveal
      scrollProgress2 = Math.min(Math.max((t - 0.4) * 2.8, 0), 1.1); // bg3 reveal
      needsRender = true;
    });

    renderer.render(scene, camera);

    let heroVisible = true;
    const threeHandler = () => {
      if (!needsRender) return;
      // Stop rendering once bg3 is fully revealed (hero scrolled through)
      heroVisible = scrollProgress2 < 1.1;
      if (!heroVisible) { needsRender = false; return; }
      material.uniforms.uProgress1.value = scrollProgress1;
      material.uniforms.uProgress2.value = scrollProgress2;
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

    // ── SplitText word fade (only if an <h2> exists in the content) ───────────
    const h2 = content.querySelector("h2") as HTMLElement | null;
    let split: SplitText | null = null;
    let wordST: ScrollTrigger | null = null;
    let words: HTMLElement[] = [];

    if (h2) {
      split = new SplitText(h2, { type: "words" });
      words = split.words as HTMLElement[];
      words.forEach(w => { w.style.willChange = "opacity"; });
      const setters = words.map(w => gsap.quickSetter(w, "opacity") as (v: number) => void);
      gsap.set(words, { opacity: 0 });

      wordST = ScrollTrigger.create({
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
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      gsap.ticker.remove(lenisHandler);
      gsap.ticker.remove(threeHandler);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      if ((window as Window & { __lenis?: Lenis }).__lenis === lenis) {
        delete (window as Window & { __lenis?: Lenis }).__lenis;
      }
      lenis.destroy();
      wordST?.kill();
      split?.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      tex1.dispose();
      tex2.dispose();
      canvas.style.willChange  = "";
      if (heroHeader) heroHeader.style.willChange = "";
      words.forEach(w => { w.style.willChange = ""; });
    };
  }, [heroRef, canvasRef, contentRef]);
}
