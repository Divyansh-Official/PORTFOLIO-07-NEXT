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
    v += noise(p)       * 0.500;
    v += noise(p * 2.)  * 0.250;
    v += noise(p * 4.)  * 0.125;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const CONFIG = { color: "#ebf5df", spread: 0.5, speed: 2 };

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 }
    : { r: 0.89, g: 0.89, b: 0.89 };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHeroAnimation(
  heroRef:    React.RefObject<HTMLElement>,
  canvasRef:  React.RefObject<HTMLCanvasElement>,
  contentRef: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    const hero    = heroRef.current;
    const canvas  = canvasRef.current;
    const content = contentRef.current;
    if (!hero || !canvas || !content) return;

    // ── GPU compositing hints ─────────────────────────────────────────────────
    // Tells the browser to promote these elements to their own compositor layer
    // so scroll/paint never blocks them.
    canvas.style.willChange  = "transform";
    hero.style.willChange    = "transform";

    // ── Lenis — integrated with gsap.ticker (official pattern) ───────────────
    // gsap.ticker is in seconds; Lenis.raf expects milliseconds.
    const lenis = new Lenis();
    const lenisHandler = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisHandler);

    // Disable GSAP lag-smoothing so it never tries to "catch up" after a
    // dropped frame — that catch-up burst is what causes perceived jank.
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger is already synced to gsap.ticker automatically after
    // gsap.registerPlugin(ScrollTrigger) — no manual update() call needed.

    // ── Three.js ──────────────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

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

    function resize() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      material.uniforms.uResolution.value.set(w, h);
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Scroll progress ───────────────────────────────────────────────────────
    let scrollProgress = 0;
    let needsRender    = false; // dirty flag — only render when scroll changes

    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      const maxScroll = hero.offsetHeight - window.innerHeight;
      scrollProgress  = Math.min((scroll / maxScroll) * CONFIG.speed, 1.1);
      needsRender     = true;
    });

    // Render once on load, then only when scrollProgress changes.
    renderer.render(scene, camera);

    const threeHandler = () => {
      if (!needsRender) return;
      material.uniforms.uProgress.value = scrollProgress;
      renderer.render(scene, camera);
      needsRender = false;
    };
    gsap.ticker.add(threeHandler);

    // ── SplitText — quickSetters, no per-tick tween allocation ───────────────
    const h2 = content.querySelector("h2") as HTMLElement | null;
    if (!h2) return;

    const split   = new SplitText(h2, { type: "words" });
    const words   = split.words as HTMLElement[];

    // Pre-apply will-change on each word so the browser layers them ahead of time
    words.forEach(w => { w.style.willChange = "opacity"; });

    const setters = words.map(w => gsap.quickSetter(w, "opacity") as (v: number) => void);
    gsap.set(words, { opacity: 0 });

    const st = ScrollTrigger.create({
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
      window.removeEventListener("resize", resize);
      lenis.destroy();
      st.kill();
      split.revert();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      canvas.style.willChange = "";
      hero.style.willChange   = "";
      words.forEach(w => { w.style.willChange = ""; });
    };
  }, [heroRef, canvasRef, contentRef]);
}





// import { useEffect } from "react";
// import * as THREE from "three";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { SplitText } from "gsap/SplitText";
// import Lenis from "lenis";

// gsap.registerPlugin(ScrollTrigger, SplitText);

// // ── Shaders ───────────────────────────────────────────────────────────────────

// const vertexShader = `
//   varying vec2 vUv;
//   void main() {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `;

// const fragmentShader = `
//   uniform float uProgress;
//   uniform vec2 uResolution;
//   uniform vec3 uColor;
//   uniform float uSpread;
//   varying vec2 vUv;

//   float Hash(vec2 p) {
//     vec3 p2 = vec3(p.xy, 1.0);
//     return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
//   }

//   float noise(in vec2 p) {
//     vec2 i = floor(p);
//     vec2 f = fract(p);
//     f *= f * (3.0 - 2.0 * f);
//     return mix(
//       mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
//       mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
//       f.y
//     );
//   }

//   float fbm(vec2 p) {
//     float v = 0.0;
//     v += noise(p * 1.0) * 0.5;
//     v += noise(p * 2.0) * 0.25;
//     v += noise(p * 4.0) * 0.125;
//     return v;
//   }

//   void main() {
//     vec2 uv = vUv;
//     float aspect = uResolution.x / uResolution.y;
//     vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

//     float dissolveEdge = uv.y - uProgress * 1.2;
//     float noiseValue = fbm(centeredUv * 15.0);
//     float d = dissolveEdge + noiseValue * uSpread;

//     float pixelSize = 1.0 / uResolution.y;
//     float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

//     gl_FragColor = vec4(uColor, alpha);
//   }
// `;

// // ── Config ────────────────────────────────────────────────────────────────────

// const CONFIG = { color: "#ebf5df", spread: 0.5, speed: 2 };

// function hexToRgb(hex: string) {
//   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16) / 255,
//         g: parseInt(result[2], 16) / 255,
//         b: parseInt(result[3], 16) / 255,
//       }
//     : { r: 0.89, g: 0.89, b: 0.89 };
// }

// // ── Hook ──────────────────────────────────────────────────────────────────────

// export function useHeroAnimation(
//   heroRef: React.RefObject<HTMLElement>,
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   contentRef: React.RefObject<HTMLElement>
// ) {
//   useEffect(() => {
//     const hero    = heroRef.current;
//     const canvas  = canvasRef.current;
//     const content = contentRef.current;
//     if (!hero || !canvas || !content) return;

//     // ── Lenis ────────────────────────────────────────────────────────────────
//     const lenis = new Lenis();

//     // ── Three.js ─────────────────────────────────────────────────────────────
//     const scene    = new THREE.Scene();
//     const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
//     const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

//     const rgb      = hexToRgb(CONFIG.color);
//     const geometry = new THREE.PlaneGeometry(2, 2);
//     const material = new THREE.ShaderMaterial({
//       vertexShader,
//       fragmentShader,
//       uniforms: {
//         uProgress:   { value: 0 },
//         uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
//         uColor:      { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
//         uSpread:     { value: CONFIG.spread },
//       },
//       transparent: true,
//     });

//     scene.add(new THREE.Mesh(geometry, material));

//     function resize() {
//       const w = hero.offsetWidth;
//       const h = hero.offsetHeight;
//       renderer.setSize(w, h);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       material.uniforms.uResolution.value.set(w, h);
//     }
//     resize();
//     window.addEventListener("resize", resize);

//     // ── Scroll progress (driven purely by Lenis) ──────────────────────────────
//     let scrollProgress = 0;
//     lenis.on("scroll", ({ scroll }: { scroll: number }) => {
//       const maxScroll = hero.offsetHeight - window.innerHeight;
//       scrollProgress  = Math.min((scroll / maxScroll) * CONFIG.speed, 1.1);
//     });

//     // ── SplitText + quickSetters (one setter per word, created once) ──────────
//     const h2 = content.querySelector("h2");
//     if (!h2) return;

//     const split   = new SplitText(h2, { type: "words" });
//     const words   = split.words as HTMLElement[];
//     const setters = words.map((w) => gsap.quickSetter(w, "opacity") as (v: number) => void);

//     gsap.set(words, { opacity: 0 });

//     const st = ScrollTrigger.create({
//       trigger: content,
//       start: "top 25%",
//       end: "bottom 100%",
//       onUpdate: (self) => {
//         const progress   = self.progress;
//         const totalWords = words.length;

//         for (let i = 0; i < totalWords; i++) {
//           const wordProgress     = i / totalWords;
//           const nextWordProgress = (i + 1) / totalWords;

//           let opacity = 0;
//           if (progress >= nextWordProgress) {
//             opacity = 1;
//           } else if (progress >= wordProgress) {
//             opacity = (progress - wordProgress) / (nextWordProgress - wordProgress);
//           }

//           setters[i](opacity); // direct DOM write — no tween overhead
//         }
//       },
//     });

//     // ── Single unified RAF loop ───────────────────────────────────────────────
//     // One tick drives Lenis, ScrollTrigger, and Three.js — nothing runs twice.
//     let rafId: number;
//     function tick(time: number) {
//       lenis.raf(time);
//       ScrollTrigger.update();
//       material.uniforms.uProgress.value = scrollProgress;
//       renderer.render(scene, camera);
//       rafId = requestAnimationFrame(tick);
//     }
//     rafId = requestAnimationFrame(tick);

//     // ── Cleanup ───────────────────────────────────────────────────────────────
//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("resize", resize);
//       lenis.destroy();
//       st.kill();
//       split.revert();
//       renderer.dispose();
//       geometry.dispose();
//       material.dispose();
//     };
//   }, [heroRef, canvasRef, contentRef]);
// }





// import { useEffect } from "react";
// import * as THREE from "three";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { SplitText } from "gsap/SplitText";
// import Lenis from "lenis";

// gsap.registerPlugin(ScrollTrigger, SplitText);

// // ── Shaders (inlined from shaders.ts) ────────────────────────────────────────

// const vertexShader = `
//   varying vec2 vUv;
//   void main() {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `;

// const fragmentShader = `
//   uniform float uProgress;
//   uniform vec2 uResolution;
//   uniform vec3 uColor;
//   uniform float uSpread;
//   varying vec2 vUv;

//   float Hash(vec2 p) {
//     vec3 p2 = vec3(p.xy, 1.0);
//     return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
//   }

//   float noise(in vec2 p) {
//     vec2 i = floor(p);
//     vec2 f = fract(p);
//     f *= f * (3.0 - 2.0 * f);
//     return mix(
//       mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
//       mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
//       f.y
//     );
//   }

//   float fbm(vec2 p) {
//     float v = 0.0;
//     v += noise(p * 1.0) * 0.5;
//     v += noise(p * 2.0) * 0.25;
//     v += noise(p * 4.0) * 0.125;
//     return v;
//   }

//   void main() {
//     vec2 uv = vUv;
//     float aspect = uResolution.x / uResolution.y;
//     vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

//     float dissolveEdge = uv.y - uProgress * 1.2;
//     float noiseValue = fbm(centeredUv * 15.0);
//     float d = dissolveEdge + noiseValue * uSpread;

//     float pixelSize = 1.0 / uResolution.y;
//     float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

//     gl_FragColor = vec4(uColor, alpha);
//   }
// `;

// // ── Config ────────────────────────────────────────────────────────────────────

// const CONFIG = {
//   color: "#ebf5df",
//   spread: 0.5,
//   speed: 2,
// };

// function hexToRgb(hex: string) {
//   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16) / 255,
//         g: parseInt(result[2], 16) / 255,
//         b: parseInt(result[3], 16) / 255,
//       }
//     : { r: 0.89, g: 0.89, b: 0.89 };
// }

// // ── Hook ──────────────────────────────────────────────────────────────────────

// export function useHeroAnimation(
//   heroRef: React.RefObject<HTMLElement>,
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   contentRef: React.RefObject<HTMLElement>
// ) {
//   useEffect(() => {
//     const hero = heroRef.current;
//     const canvas = canvasRef.current;
//     const contentEl = contentRef.current;

//     if (!hero || !canvas || !contentEl) return;

//     // ── Lenis ──────────────────────────────────────────────────────────────
//     const lenis = new Lenis();

//     function raf(time: number) {
//       lenis.raf(time);
//       ScrollTrigger.update();
//       rafId = requestAnimationFrame(raf);
//     }

//     let rafId = requestAnimationFrame(raf);
//     lenis.on("scroll", ScrollTrigger.update);

//     // ── Three.js ───────────────────────────────────────────────────────────
//     const scene = new THREE.Scene();
//     const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
//     const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

//     function resize() {
//       renderer.setSize(hero.offsetWidth, hero.offsetHeight);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       material.uniforms.uResolution.value.set(hero.offsetWidth, hero.offsetHeight);
//     }

//     const rgb = hexToRgb(CONFIG.color);
//     const geometry = new THREE.PlaneGeometry(2, 2);
//     const material = new THREE.ShaderMaterial({
//       vertexShader,
//       fragmentShader,
//       uniforms: {
//         uProgress:   { value: 0 },
//         uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
//         uColor:      { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
//         uSpread:     { value: CONFIG.spread },
//       },
//       transparent: true,
//     });

//     const mesh = new THREE.Mesh(geometry, material);
//     scene.add(mesh);

//     resize();
//     window.addEventListener("resize", resize);

//     let scrollProgress = 0;
//     let animFrameId: number;

//     function animate() {
//       material.uniforms.uProgress.value = scrollProgress;
//       renderer.render(scene, camera);
//       animFrameId = requestAnimationFrame(animate);
//     }
//     animate();

//     lenis.on("scroll", ({ scroll }: { scroll: number }) => {
//       const maxScroll = hero.offsetHeight - window.innerHeight;
//       scrollProgress = Math.min((scroll / maxScroll) * CONFIG.speed, 1.1);
//     });

//     // ── GSAP SplitText word fade ───────────────────────────────────────────
//     const h2 = contentEl.querySelector("h2");
//     if (!h2) return;

//     const split = new SplitText(h2, { type: "words" });
//     const words = split.words;
//     gsap.set(words, { opacity: 0 });

//     const st = ScrollTrigger.create({
//       trigger: contentEl,
//       start: "top 25%",
//       end: "bottom 100%",
//       onUpdate: (self) => {
//         const progress = self.progress;
//         const totalWords = words.length;

//         words.forEach((word, index) => {
//           const wordProgress     = index / totalWords;
//           const nextWordProgress = (index + 1) / totalWords;

//           let opacity = 0;
//           if (progress >= nextWordProgress) {
//             opacity = 1;
//           } else if (progress >= wordProgress) {
//             opacity = (progress - wordProgress) / (nextWordProgress - wordProgress);
//           }

//           gsap.to(word, { opacity, duration: 0.1, overwrite: true });
//         });
//       },
//     });

//     // ── Cleanup ────────────────────────────────────────────────────────────
//     return () => {
//       cancelAnimationFrame(rafId);
//       cancelAnimationFrame(animFrameId);
//       window.removeEventListener("resize", resize);
//       lenis.destroy();
//       st.kill();
//       split.revert();
//       renderer.dispose();
//       geometry.dispose();
//       material.dispose();
//     };
//   }, [heroRef, canvasRef, contentRef]);
// }