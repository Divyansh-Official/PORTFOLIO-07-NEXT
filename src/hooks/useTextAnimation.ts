import { useEffect } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import gsap from "gsap";

// ─── Font URL ─────────────────────────────────────────────────────────────────
// helvetiker_bold is the most reliably available typeface in three.js examples.
// droid_sans_bold can silently fall back to "?" glyphs on some CDN versions,
// which is exactly what caused the ??? rendering in the hero.
const FONT_URL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

// ─── Vertex shader ────────────────────────────────────────────────────────────
// Each triangle flies in along a cubic-bezier arc from a scattered position to
// its final resting place.  Progress drives the blend from scattered → formed.
const VERT = /* glsl */ `
  uniform float uTime;

  attribute vec2 aAnimation;    // x = delay, y = duration
  attribute vec3 aControl0;     // bezier control point 0  (scattered side)
  attribute vec3 aControl1;     // bezier control point 1  (landing side)
  attribute vec3 aEndPosition;  // destination — all zeros so pieces collapse to origin

  vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
    float tn = 1.0 - t;
    return tn*tn*tn*p0
         + 3.0*tn*tn*t*c0
         + 3.0*tn*t*t*c1
         + t*t*t*p1;
  }

  void main() {
    float tDelay    = aAnimation.x;
    float tDuration = aAnimation.y;
    float tTime     = clamp(uTime - tDelay, 0.0, tDuration);
    float tProgress = tTime / tDuration;

    // Start fully scattered (tProgress = 0) → fully formed (tProgress = 1)
    vec3 pos  = position;
    pos      *= (1.0 - tProgress);                                        // shrink scatter contribution
    pos      += cubicBezier(position, aControl0, aControl1, aEndPosition, tProgress);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ─── Fragment shader ──────────────────────────────────────────────────────────
// Pure white to match the hero text colour.  Adjust here to tint the text.
const FRAG = /* glsl */ `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Mounts a Three.js text-reveal animation into `containerRef`.
 *
 * Behaviour
 * - ONE-SHOT reveal: triangles fly in from scattered positions and assemble
 *   the text.  No looping, no yoyo.
 * - Click + drag (or touch-drag) scrubs the animation forward / backward in
 *   real time, identical to the original CodePen.  Releasing the mouse
 *   resumes auto-play from wherever it was paused.
 *
 * @param text         String to render (uppercased internally).
 * @param containerRef Ref to the div that will host the canvas.
 *                     The div MUST have an explicit pixel height (e.g. 160px)
 *                     so the renderer can read offsetHeight on mount.
 */
export function useTextAnimation(
  text: string,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    // Guard: nothing to render if text or container are absent.
    if (!text || typeof text !== "string" || text.trim() === "") return;
    const el = containerRef.current;
    if (!el) return;

    // ── Renderer setup ──────────────────────────────────────────────────────
    const W = el.offsetWidth  || 800;
    const H = el.offsetHeight || 160;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);            // fully transparent background
    el.appendChild(renderer.domElement);

    // Make the canvas fill the container div absolutely so it doesn't push layout.
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset     = "0";
    canvas.style.width     = "100%";
    canvas.style.height    = "100%";

    const camera = new THREE.PerspectiveCamera(10, W / H, 1, 10_000);
    camera.position.set(0, 0, 1400);

    const scene = new THREE.Scene();

    // ── State shared between font-load callback and event handlers ──────────
    let rafId   = 0;
    let tween: gsap.core.Tween | null = null;
    const tweenObj = { progress: 0 };
    let totalDuration = 1;          // updated once geometry is built

    let mouseDown = false;
    let prevX     = 0;

    let cleanupEvents: (() => void) | null = null;

    // ── Render loop (starts immediately so the empty scene doesn't stall) ───
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();

    // ── Font + geometry ─────────────────────────────────────────────────────
    const loader = new FontLoader();

    loader.load(
      FONT_URL,
      (font) => {
        // Build text geometry
        const textGeo = new TextGeometry(text.toUpperCase(), {
          font,
          size:            14,
          depth:           0,
          bevelEnabled:    true,
          bevelSize:       0.75,
          bevelThickness:  0.5,
          curveSegments:   4,
        });

        textGeo.computeBoundingBox();
        const bb = textGeo.boundingBox!;
        const sw = bb.max.x - bb.min.x;
        const sh = bb.max.y - bb.min.y;
        const sd = bb.max.z - bb.min.z;

        // Centre the text at the origin
        textGeo.translate(-sw * 0.5, -sh * 0.5, -sd * 0.5);

        // Convert to non-indexed so every 3 vertices form one independent triangle
        const geo      = textGeo.toNonIndexed();
        const posAttr  = geo.getAttribute("position") as THREE.BufferAttribute;
        const vCount   = posAttr.count;
        const faceCount = vCount / 3;

        // Per-vertex attribute arrays
        const aAnimation = new Float32Array(vCount * 2);
        const aControl0  = new Float32Array(vCount * 3);
        const aControl1  = new Float32Array(vCount * 3);
        const aEndPos    = new Float32Array(vCount * 3); // stays zero — pieces fly to origin

        const size3D  = new THREE.Vector3(sw, sh, sd).multiplyScalar(0.5).length();
        const maxDelay = size3D * 0.06;

        for (let i = 0; i < faceCount; i++) {
          const ix = i * 3;

          // Triangle centroid
          const cx = (posAttr.getX(ix) + posAttr.getX(ix + 1) + posAttr.getX(ix + 2)) / 3;
          const cy = (posAttr.getY(ix) + posAttr.getY(ix + 1) + posAttr.getY(ix + 2)) / 3;
          const cz = (posAttr.getZ(ix) + posAttr.getZ(ix + 1) + posAttr.getZ(ix + 2)) / 3;

          // Direction helpers for outward scatter
          const dx      = cx > 0 ? 1 : -1;
          const dy      = cy > 0 ? 1 : -1;
          const centLen = Math.sqrt(cx * cx + cy * cy + cz * cz);

          // Delay based on distance from origin gives a natural wave-in effect
          const delay    = centLen * (0.03 + Math.random() * 0.03);
          const duration = 2 + Math.random() * 2;

          // Bezier control points give each triangle a unique arc
          const c0x = Math.random() * 30                   * dx;
          const c0y = (60 + Math.random() * 60)            * dy;
          const c0z = (Math.random() - 0.5) * 40;

          const c1x = (30 + Math.random() * 30)            * dx;
          const c1y = Math.random() * 60                   * dy;
          const c1z = (Math.random() - 0.5) * 40;

          for (let v = 0; v < 3; v++) {
            const i2 = (ix + v) * 2;
            const i3 = (ix + v) * 3;

            aAnimation[i2]     = delay + Math.random(); // small per-vertex jitter
            aAnimation[i2 + 1] = duration;

            aControl0[i3]     = c0x;
            aControl0[i3 + 1] = c0y;
            aControl0[i3 + 2] = c0z;

            aControl1[i3]     = c1x;
            aControl1[i3 + 1] = c1y;
            aControl1[i3 + 2] = c1z;
            // aEndPos stays 0 — collapse to origin, matching original codepen
          }
        }

        geo.setAttribute("aAnimation",   new THREE.BufferAttribute(aAnimation, 2));
        geo.setAttribute("aControl0",    new THREE.BufferAttribute(aControl0,  3));
        geo.setAttribute("aControl1",    new THREE.BufferAttribute(aControl1,  3));
        geo.setAttribute("aEndPosition", new THREE.BufferAttribute(aEndPos,    3));

        totalDuration = maxDelay + 4 + 1;

        const mat = new THREE.ShaderMaterial({
          uniforms:       { uTime: { value: 0 } },
          vertexShader:   VERT,
          fragmentShader: FRAG,
          side:           THREE.DoubleSide,
          transparent:    false,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        scene.add(mesh);

        // ── ONE-SHOT reveal tween (no loop, no yoyo) ────────────────────────
        tween = gsap.fromTo(
          tweenObj,
          { progress: 0 },
          {
            progress:  1,
            duration:  4,
            ease:      "power1.inOut",
            repeat:    0,           // single play — reveal only
            onUpdate:  () => {
              mat.uniforms.uTime.value = totalDuration * tweenObj.progress;
            },
          }
        );

        // ── Drag-to-scrub (click/touch drag controls animation progress) ─────
        function seek(dx: number) {
          const p = Math.max(0, Math.min(1, tweenObj.progress + dx * 0.001));
          tween!.progress(p);
          tweenObj.progress                = p;
          mat.uniforms.uTime.value         = totalDuration * p;
        }

        // Desktop mouse
        const onMouseDown = (e: MouseEvent) => {
          mouseDown = true;
          prevX     = e.clientX;
          gsap.to(tween!, { timeScale: 0, duration: 2 });
          document.body.style.cursor = "ew-resize";
        };
        const onMouseUp = () => {
          if (!mouseDown) return;
          mouseDown = false;
          gsap.to(tween!, { timeScale: 1, duration: 2 });
          document.body.style.cursor = "pointer";
        };
        const onMouseMove = (e: MouseEvent) => {
          if (!mouseDown) return;
          seek(e.clientX - prevX);
          prevX = e.clientX;
        };

        // Touch
        let tcx = 0;
        const onTouchStart = (e: TouchEvent) => {
          tcx = e.touches[0].clientX;
          gsap.to(tween!, { timeScale: 0, duration: 2 });
          e.preventDefault();
        };
        const onTouchEnd = (e: TouchEvent) => {
          gsap.to(tween!, { timeScale: 1, duration: 2 });
          e.preventDefault();
        };
        const onTouchMove = (e: TouchEvent) => {
          seek(e.touches[0].clientX - tcx);
          tcx = e.touches[0].clientX;
          e.preventDefault();
        };

        window.addEventListener("mousedown",  onMouseDown);
        window.addEventListener("mouseup",    onMouseUp);
        window.addEventListener("mousemove",  onMouseMove);
        window.addEventListener("touchstart", onTouchStart, { passive: false });
        window.addEventListener("touchend",   onTouchEnd,   { passive: false });
        window.addEventListener("touchmove",  onTouchMove,  { passive: false });

        cleanupEvents = () => {
          window.removeEventListener("mousedown",  onMouseDown);
          window.removeEventListener("mouseup",    onMouseUp);
          window.removeEventListener("mousemove",  onMouseMove);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchend",   onTouchEnd);
          window.removeEventListener("touchmove",  onTouchMove);
        };
      },
      undefined,
      (err) => {
        console.error("[useTextAnimation] Font failed to load:", err);
      }
    );

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      const nW = el.offsetWidth;
      const nH = el.offsetHeight || 160;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      tween?.kill();
      cleanupEvents?.();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(canvas)) el.removeChild(canvas);
    };
  }, [text]); // re-run only when the text string changes
}





// import { useEffect } from "react";
// import * as THREE from "three";
// import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
// import { FontLoader } from "three/addons/loaders/FontLoader.js";
// import gsap from "gsap";

// // Drop into Hero.tsx header-name div.
// // Replaces static <h1> with animated Three.js canvas.
// // Cursor drag scrubs animation progress (same as original codepen).

// const FONT_URL =
//   "https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json";

// const VERT = /* glsl */ `
//   uniform float uTime;
//   attribute vec2  aAnimation;   // x=delay, y=duration
//   attribute vec3  aControl0;
//   attribute vec3  aControl1;
//   attribute vec3  aEndPosition; // all zeros → pieces collapse to origin

//   vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
//     float tn = 1.0 - t;
//     return tn*tn*tn*p0 + 3.0*tn*tn*t*c0 + 3.0*tn*t*t*c1 + t*t*t*p1;
//   }

//   void main() {
//     float tDelay    = aAnimation.x;
//     float tDuration = aAnimation.y;
//     float tTime     = clamp(uTime - tDelay, 0.0, tDuration);
//     float tProgress = tTime / tDuration;

//     vec3 pos  = position;
//     pos      *= (1.0 - tProgress);
//     pos      += cubicBezier(position, aControl0, aControl1, aEndPosition, tProgress);

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//   }
// `;

// const FRAG = /* glsl */ `
//   void main() {
//     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // white — matches hero text colour
//   }
// `;

// export function useTextAnimation(
//   text: string,
//   containerRef: React.RefObject<HTMLDivElement | null>
// ) {
//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     /* ── renderer ───────────────────────────────────────────────── */
//     const W = el.offsetWidth || 800;
//     const H = el.offsetHeight || 160;

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(W, H);
//     renderer.setClearColor(0x000000, 0);
//     el.appendChild(renderer.domElement);

//     const camera = new THREE.PerspectiveCamera(10, W / H, 1, 10000);
//     camera.position.set(0, 0, 1400);

//     const scene = new THREE.Scene();

//     let rafId = 0;
//     let tween: gsap.core.Tween | null = null;
//     const tweenObj = { progress: 0 };

//     /* ── cursor scrub state ─────────────────────────────────────── */
//     let mouseDown = false;
//     let prevX = 0;

//     /* ── font + mesh ────────────────────────────────────────────── */
//     const loader = new FontLoader();
//     let cleanupEvents: (() => void) | null = null;

//     loader.load(FONT_URL, (font) => {
//       /* geometry */
//       const textGeo = new TextGeometry(text.toUpperCase(), {
//         font,
//         size: 14,
//         depth: 0,
//         bevelEnabled: true,
//         bevelSize: 0.75,
//         bevelThickness: 0.5,
//       });

//       textGeo.computeBoundingBox();
//       const bb = textGeo.boundingBox!;
//       const sw = bb.max.x - bb.min.x;
//       const sh = bb.max.y - bb.min.y;
//       const sd = bb.max.z - bb.min.z;
//       textGeo.translate(-sw * 0.5, -sh * 0.5, -sd * 0.5);

//       /* non-indexed so every 3 verts = 1 triangle */
//       const geo = textGeo.toNonIndexed();
//       const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
//       const vCount = posAttr.count;
//       const faceCount = vCount / 3;

//       const aAnimation  = new Float32Array(vCount * 2);
//       const aControl0   = new Float32Array(vCount * 3);
//       const aControl1   = new Float32Array(vCount * 3);
//       const aEndPos     = new Float32Array(vCount * 3); // zeros by default

//       const size3D =
//         new THREE.Vector3(sw, sh, sd).multiplyScalar(0.5).length();
//       const maxDelay = size3D * 0.06;

//       for (let i = 0; i < faceCount; i++) {
//         const ix = i * 3;

//         /* centroid */
//         const cx =
//           (posAttr.getX(ix) + posAttr.getX(ix + 1) + posAttr.getX(ix + 2)) / 3;
//         const cy =
//           (posAttr.getY(ix) + posAttr.getY(ix + 1) + posAttr.getY(ix + 2)) / 3;
//         const cz =
//           (posAttr.getZ(ix) + posAttr.getZ(ix + 1) + posAttr.getZ(ix + 2)) / 3;

//         const dx = cx > 0 ? 1 : -1;
//         const dy = cy > 0 ? 1 : -1;

//         const centLen = Math.sqrt(cx * cx + cy * cy + cz * cz);
//         const delay    = centLen * (0.03 + Math.random() * 0.03);
//         const duration = 2 + Math.random() * 2;

//         const c0x = Math.random() * 30 * dx;
//         const c0y = (60 + Math.random() * 60) * dy;
//         const c0z = (Math.random() - 0.5) * 40;

//         const c1x = (30 + Math.random() * 30) * dx;
//         const c1y = Math.random() * 60 * dy;
//         const c1z = (Math.random() - 0.5) * 40;

//         for (let v = 0; v < 3; v++) {
//           const i2 = (ix + v) * 2;
//           const i3 = (ix + v) * 3;

//           aAnimation[i2]     = delay + Math.random();
//           aAnimation[i2 + 1] = duration;

//           aControl0[i3]     = c0x;
//           aControl0[i3 + 1] = c0y;
//           aControl0[i3 + 2] = c0z;

//           aControl1[i3]     = c1x;
//           aControl1[i3 + 1] = c1y;
//           aControl1[i3 + 2] = c1z;
//           // aEndPos stays 0 — pieces collapse to origin (matches original)
//         }
//       }

//       geo.setAttribute("aAnimation",  new THREE.BufferAttribute(aAnimation, 2));
//       geo.setAttribute("aControl0",   new THREE.BufferAttribute(aControl0, 3));
//       geo.setAttribute("aControl1",   new THREE.BufferAttribute(aControl1, 3));
//       geo.setAttribute("aEndPosition",new THREE.BufferAttribute(aEndPos, 3));

//       const totalDuration = maxDelay + 4 + 1;

//       const mat = new THREE.ShaderMaterial({
//         uniforms:       { uTime: { value: 0 } },
//         vertexShader:   VERT,
//         fragmentShader: FRAG,
//         side:           THREE.DoubleSide,
//       });

//       const mesh = new THREE.Mesh(geo, mat);
//       mesh.frustumCulled = false;
//       scene.add(mesh);

//       /* ── gsap tween (auto-plays, yoyo) ─────────────────────── */
//       tween = gsap.fromTo(
//         tweenObj,
//         { progress: 0 },
//         {
//           progress: 1,
//           duration: 4,
//           ease: "power1.inOut",
//           repeat: -1,
//           yoyo: true,
//           onUpdate: () => {
//             mat.uniforms.uTime.value = totalDuration * tweenObj.progress;
//           },
//         }
//       );

//       /* ── cursor scrub (identical to original codepen logic) ─── */
//       function seek(dx: number) {
//         const p = Math.max(0, Math.min(1, tweenObj.progress + dx * 0.001));
//         tween!.progress(p);
//         tweenObj.progress = p;
//         mat.uniforms.uTime.value = totalDuration * p;
//       }

//       const onDown = (e: MouseEvent) => {
//         mouseDown = true;
//         prevX = e.clientX;
//         gsap.to(tween!, { timeScale: 0, duration: 2 });
//         document.body.style.cursor = "ew-resize";
//       };
//       const onUp = () => {
//         mouseDown = false;
//         gsap.to(tween!, { timeScale: 1, duration: 2 });
//         document.body.style.cursor = "pointer";
//       };
//       const onMove = (e: MouseEvent) => {
//         if (!mouseDown) return;
//         seek(e.clientX - prevX);
//         prevX = e.clientX;
//       };

//       let tcx = 0;
//       const onTouchStart = (e: TouchEvent) => {
//         tcx = e.touches[0].clientX;
//         gsap.to(tween!, { timeScale: 0, duration: 2 });
//         e.preventDefault();
//       };
//       const onTouchEnd = (e: TouchEvent) => {
//         gsap.to(tween!, { timeScale: 1, duration: 2 });
//         e.preventDefault();
//       };
//       const onTouchMove = (e: TouchEvent) => {
//         seek(e.touches[0].clientX - tcx);
//         tcx = e.touches[0].clientX;
//         e.preventDefault();
//       };

//       window.addEventListener("mousedown",  onDown);
//       window.addEventListener("mouseup",    onUp);
//       window.addEventListener("mousemove",  onMove);
//       window.addEventListener("touchstart", onTouchStart, { passive: false });
//       window.addEventListener("touchend",   onTouchEnd,   { passive: false });
//       window.addEventListener("touchmove",  onTouchMove,  { passive: false });

//       cleanupEvents = () => {
//         window.removeEventListener("mousedown",  onDown);
//         window.removeEventListener("mouseup",    onUp);
//         window.removeEventListener("mousemove",  onMove);
//         window.removeEventListener("touchstart", onTouchStart);
//         window.removeEventListener("touchend",   onTouchEnd);
//         window.removeEventListener("touchmove",  onTouchMove);
//       };
//     });

//     /* ── render loop ────────────────────────────────────────────── */
//     const tick = () => {
//       rafId = requestAnimationFrame(tick);
//       renderer.render(scene, camera);
//     };
//     tick();

//     /* ── resize ─────────────────────────────────────────────────── */
//     const onResize = () => {
//       const nW = el.offsetWidth;
//       const nH = el.offsetHeight || 160;
//       camera.aspect = nW / nH;
//       camera.updateProjectionMatrix();
//       renderer.setSize(nW, nH);
//     };
//     window.addEventListener("resize", onResize);

//     /* ── cleanup ─────────────────────────────────────────────────── */
//     return () => {
//       cancelAnimationFrame(rafId);
//       tween?.kill();
//       cleanupEvents?.();
//       window.removeEventListener("resize", onResize);
//       renderer.dispose();
//       if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
//     };
//   }, [text]);
// }