"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

// Full-screen WebGL transition: a crimson fbm-noise dissolve sweeps in to cover
// the screen, the page jumps to the target section while fully covered, then the
// cover dissolves away — with a glowing edge along the dissolve front.

const vertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const fragmentShader = `
  precision highp float;
  uniform float uProgress;   // 0 (clear) → 0.5 (fully covered) → 1 (clear again)
  uniform float uTime;
  uniform vec2  uResolution;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(37.1, 61.7))) * 3758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); f *= f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }

  void main(){
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    float n = fbm(vec2(uv.x * aspect, uv.y) * 3.5 + uTime * 0.04);

    // sweep field: bottom → top, edge broken up by the noise
    float field = mix(1.0 - uv.y, n, 0.5);

    // triangle so the cover grows (0→0.5) then recedes (0.5→1)
    float p = uProgress;
    float t = (p < 0.5) ? (p * 2.0) : (1.0 - (p - 0.5) * 2.0);

    float a = 1.0 - smoothstep(t - 0.12, t + 0.03, field);
    a *= smoothstep(0.0, 0.02, p);   // perfectly clear at idle

    // rich crimson gradient
    vec3 base = mix(vec3(0.05, 0.0, 0.02), vec3(0.85, 0.0, 0.07), uv.y);
    // glowing dissolve front
    float band = 1.0 - smoothstep(0.0, 0.06, abs(field - t));
    vec3 color = base + vec3(1.0, 0.3, 0.32) * band * 1.8;

    gl_FragColor = vec4(color, clamp(a + band * a * 0.6, 0.0, 1.0));
  }
`;

type LenisLike = { scrollTo: (t: Element | number, o?: { immediate?: boolean; offset?: number }) => void };

export default function SectionTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, uniforms, transparent: true, depthTest: false, depthWrite: false,
    });
    scene.add(new THREE.Mesh(geometry, material));

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    let rendering = false;
    const render = () => {
      if (!rendering) return;
      uniforms.uTime.value += 0.016;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(render);

    let active = false;
    const run = (target: string) => {
      if (active) return;
      // "#top" → page top, "#contact" → page bottom (fixed footer); else a section.
      const isTop = target === "#top";
      const isBottom = target === "#contact";
      const el = isTop || isBottom ? null : document.querySelector(target);
      if (!isTop && !isBottom && !el) return;
      active = true;
      rendering = true;
      canvas.style.pointerEvents = "auto";   // block input while transitioning
      gsap.killTweensOf(uniforms.uProgress);
      uniforms.uProgress.value = 0;

      gsap.timeline({
        onComplete: () => {
          rendering = false;
          active = false;
          canvas.style.pointerEvents = "none";
          uniforms.uProgress.value = 0;
          renderer.render(scene, camera);   // clear back to transparent
        },
      })
        // cover the screen
        .to(uniforms.uProgress, { value: 0.5, duration: 0.6, ease: "power2.in" })
        // jump to the section while fully covered
        .add(() => {
          const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
          if (isTop) {
            if (lenis) lenis.scrollTo(0, { immediate: true });
            else window.scrollTo(0, 0);
          } else if (isBottom) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (lenis) lenis.scrollTo(max, { immediate: true });
            else window.scrollTo(0, max);
          } else if (lenis) {
            lenis.scrollTo(el as Element, { immediate: true, offset: 0 });
          } else {
            (el as HTMLElement).scrollIntoView();
          }
        })
        // dissolve away, revealing the target section
        .to(uniforms.uProgress, { value: 1.0, duration: 0.78, ease: "power2.out" }, "+=0.05");
    };
    (window as Window & { __sectionTransition?: (t: string) => void }).__sectionTransition = run;

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", resize);
      delete (window as Window & { __sectionTransition?: (t: string) => void }).__sectionTransition;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 9000, pointerEvents: "none" }}
    />
  );
}
