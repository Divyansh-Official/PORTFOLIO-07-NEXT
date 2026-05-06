// "use client";

// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// export default function HeroSectionCard() {
//   const mountRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const mount = mountRef.current;
//     if (!mount) return;

//     let animationId: number;

//     /* ── Scene ── */
//     const scene = new THREE.Scene();
//     const W = mount.clientWidth;
//     const H = mount.clientHeight;

//     const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
//     camera.position.z = 6;

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setSize(W, H);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setClearColor(0x000000, 0);
//     mount.appendChild(renderer.domElement);

//     /* ──────────────────────────────────────────────
//        Card shape — rounded rect + bottom-left tab
//        Matches reference image exactly:
//          • four rounded corners on the main body
//          • tab protrudes downward from bottom-left,
//            left-edge flush with card left edge,
//            tab corners are also rounded
//     ────────────────────────────────────────────── */
//     const CARD_W = 2.4;
//     const CARD_H = 3.0;
//     const R      = 0.22;   // main corner radius
//     const TW     = 0.58;   // tab width  (how wide the bottom-left bump is)
//     const TH     = 0.32;   // tab height (how far it sticks below the card)
//     const TR     = 0.13;   // tab corner radius

//     const hw = CARD_W / 2; // 1.2  (half-width,  x goes -1.2 → +1.2)
//     const hh = CARD_H / 2; // 1.5  (half-height, y goes -1.5 → +1.5)

//     /*  Path — clockwise starting at top-left post-radius
//      *
//      *         TL ────────────────────────── TR
//      *         │                              │
//      *         │        main body             │
//      *         │                              │
//      *         BL──TW──┐                     BR
//      *         │  tab  │
//      *         └───────┘
//      */
//     const shape = new THREE.Shape();

//     // ① top-left (post-radius) → top edge
//     shape.moveTo(-hw + R, hh);
//     // ② top edge →
//     shape.lineTo(hw - R, hh);
//     // ③ top-right corner
//     shape.quadraticCurveTo(hw, hh, hw, hh - R);
//     // ④ right edge ↓
//     shape.lineTo(hw, -hh + R);
//     // ⑤ bottom-right corner
//     shape.quadraticCurveTo(hw, -hh, hw - R, -hh);
//     // ⑥ bottom edge ← to where tab begins (inner-right corner, right angle)
//     shape.lineTo(-hw + TW, -hh);
//     // ⑦ tab right side ↓
//     shape.lineTo(-hw + TW, -hh - TH + TR);
//     // ⑧ tab bottom-right corner
//     shape.quadraticCurveTo(-hw + TW, -hh - TH, -hw + TW - TR, -hh - TH);
//     // ⑨ tab bottom edge ←
//     shape.lineTo(-hw + TR, -hh - TH);
//     // ⑩ tab bottom-left corner
//     shape.quadraticCurveTo(-hw, -hh - TH, -hw, -hh - TH + TR);
//     // ⑪ left edge ↑ (tab left = card left, so straight up from here)
//     shape.lineTo(-hw, hh - R);
//     // ⑫ top-left corner
//     shape.quadraticCurveTo(-hw, hh, -hw + R, hh);

//     const geometry = new THREE.ShapeGeometry(shape, 80);

//     /* ── Custom UVs (map full card bbox 0→1) ── */
//     const fullH  = CARD_H + TH;          // bounding-box height includes tab
//     const originY = -hh - TH;            // bounding-box bottom y
//     const pos = geometry.attributes.position as THREE.BufferAttribute;
//     const uvArr = new Float32Array(pos.count * 2);
//     for (let i = 0; i < pos.count; i++) {
//       uvArr[i * 2]     = (pos.getX(i) + hw) / CARD_W;
//       uvArr[i * 2 + 1] = (pos.getY(i) - originY) / fullH;
//     }
//     geometry.setAttribute("uv", new THREE.BufferAttribute(uvArr, 2));

//     /* ── Shaders ── */
//     const vertexShader = /* glsl */ `
//       varying vec2 vUv;
//       void main() {
//         vUv = uv;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `;

//     const fragmentShader = /* glsl */ `
//       uniform float uTime;
//       uniform vec2  uMouse;
//       uniform float uHover;
//       uniform vec2  uRipplePos[6];
//       uniform float uRippleAge[6];

//       varying vec2 vUv;

//       float hash21(vec2 p) {
//         p = fract(p * vec2(127.1, 311.7));
//         p += dot(p, p + 45.23);
//         return fract(p.x * p.y);
//       }
//       float valueNoise(vec2 p) {
//         vec2 i = floor(p), f = fract(p);
//         f = f * f * (3.0 - 2.0 * f);
//         return mix(
//           mix(hash21(i), hash21(i + vec2(1,0)), f.x),
//           mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x),
//           f.y
//         );
//       }
//       float fbm(vec2 p) {
//         float v = 0.0, a = 0.5;
//         for (int i = 0; i < 4; i++) {
//           v += a * valueNoise(p);
//           p = p * 2.1 + vec2(1.7, 9.2);
//           a *= 0.5;
//         }
//         return v;
//       }

//       void main() {
//         vec2 uv = vUv;

//         // base dark purple-slate
//         vec3 dark   = vec3(0.10, 0.10, 0.22);
//         vec3 mid    = vec3(0.17, 0.15, 0.32);
//         vec3 accent = vec3(0.22, 0.20, 0.42);
//         float g = fbm(uv * 2.2 + uTime * 0.03);
//         vec3 base = mix(dark, mid, uv.y * 0.7 + uv.x * 0.3 + g * 0.15);
//         base = mix(base, accent, smoothstep(0.4, 0.9, uv.y) * 0.4);

//         // grain
//         float grain = valueNoise(uv * 180.0 + uTime * 2.0) * 0.035;
//         base += grain;

//         // vignette
//         vec2 c = uv - 0.5;
//         float vig = 1.0 - dot(c, c) * 2.2;
//         base *= clamp(vig, 0.0, 1.0);

//         // cursor glow
//         float mDist = distance(uv, uMouse);
//         float glow  = smoothstep(0.55, 0.0, mDist) * uHover;
//         base += vec3(0.18, 0.12, 0.45) * glow * 0.9;

//         // specular sheen top-left
//         float sheen = smoothstep(0.5, 0.0, distance(uv, vec2(0.12, 0.88))) * 0.12;
//         base += sheen * vec3(0.6, 0.5, 1.0);

//         // rim light
//         vec2 e  = min(uv, 1.0 - uv);
//         float rim = 1.0 - smoothstep(0.0, 0.025, min(e.x, e.y));
//         base += rim * vec3(0.25, 0.20, 0.55) * 0.7;

//         // ripples
//         float rippleSum = 0.0;
//         for (int i = 0; i < 6; i++) {
//           float age = uRippleAge[i];
//           if (age < 0.0) continue;
//           float d    = distance(uv, uRipplePos[i]);
//           float rad  = age * 1.1;
//           float band = smoothstep(0.07, 0.0, abs(d - rad));
//           float fade = (1.0 - smoothstep(0.0, 1.6, age)) * smoothstep(0.0, 0.05, age);
//           rippleSum += band * fade;
//         }
//         base += rippleSum * vec3(0.35, 0.28, 0.75) * 0.55;

//         // shimmer
//         float shimmer = valueNoise(uv * 12.0 - uTime * 0.4 + uMouse * 3.0) * 0.025 * uHover;
//         base += shimmer * vec3(0.5, 0.4, 1.0);

//         gl_FragColor = vec4(clamp(base, 0.0, 1.0), 1.0);
//       }
//     `;

//     /* ── Ripple ring buffer ── */
//     const MAX_RIPPLES = 6;
//     const ripplePos = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector2(0.5, 0.5));
//     const rippleAge = new Array<number>(MAX_RIPPLES).fill(-1);
//     let rippleHead  = 0;

//     const spawnRipple = (uv: THREE.Vector2) => {
//       ripplePos[rippleHead].copy(uv);
//       rippleAge[rippleHead] = 0;
//       rippleHead = (rippleHead + 1) % MAX_RIPPLES;
//     };

//     /* ── Material ── */
//     const material = new THREE.ShaderMaterial({
//       vertexShader,
//       fragmentShader,
//       uniforms: {
//         uTime:      { value: 0 },
//         uMouse:     { value: new THREE.Vector2(0.5, 0.5) },
//         uHover:     { value: 0 },
//         uRipplePos: { value: ripplePos },
//         uRippleAge: { value: rippleAge },
//       },
//     });

//     const mesh  = new THREE.Mesh(geometry, material);
//     const group = new THREE.Group();
//     group.add(mesh);
//     scene.add(group);

//     /* ── Magnetic state ── */
//     const targetRot  = new THREE.Vector2(0, 0);
//     const currentRot = new THREE.Vector2(0, 0);
//     const targetPos  = new THREE.Vector2(0, 0);
//     const currentPos = new THREE.Vector2(0, 0);

//     let hoverTarget    = 0;
//     let lastRippleTime = 0;
//     const raycaster    = new THREE.Raycaster();
//     const mouseNDC     = new THREE.Vector2();

//     const onMouseMove = (e: MouseEvent) => {
//       const rect = mount.getBoundingClientRect();
//       const nx   = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
//       const ny   = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
//       mouseNDC.set(nx, ny);

//       targetRot.set(ny * 0.28, nx * 0.38);
//       targetPos.set(nx * 0.18, ny * 0.12);

//       raycaster.setFromCamera(mouseNDC, camera);
//       const hits = raycaster.intersectObject(mesh);

//       if (hits.length > 0) {
//         hoverTarget = 1;
//         const uv = hits[0].uv;
//         if (uv) {
//           material.uniforms.uMouse.value.copy(uv);
//           const now = performance.now();
//           if (now - lastRippleTime > 220) {
//             spawnRipple(uv);
//             lastRippleTime = now;
//           }
//         }
//       } else {
//         hoverTarget = 0;
//       }
//     };

//     const onClick = (e: MouseEvent) => {
//       const rect = mount.getBoundingClientRect();
//       mouseNDC.set(
//         ((e.clientX - rect.left) / rect.width)  *  2 - 1,
//         ((e.clientY - rect.top)  / rect.height) * -2 + 1,
//       );
//       raycaster.setFromCamera(mouseNDC, camera);
//       const hits = raycaster.intersectObject(mesh);
//       if (hits.length > 0 && hits[0].uv) {
//         spawnRipple(hits[0].uv);
//         spawnRipple(hits[0].uv);
//       }
//     };

//     const onMouseLeave = () => {
//       targetRot.set(0, 0);
//       targetPos.set(0, 0);
//       hoverTarget = 0;
//     };

//     const onResize = () => {
//       const w = mount.clientWidth;
//       const h = mount.clientHeight;
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//     };

//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("click",     onClick);
//     window.addEventListener("resize",    onResize);
//     mount.addEventListener("mouseleave", onMouseLeave);

//     /* ── Animation loop ── */
//     const clock = new THREE.Clock();

//     const animate = () => {
//       animationId = requestAnimationFrame(animate);
//       const delta   = clock.getDelta();
//       const elapsed = clock.getElapsedTime();

//       material.uniforms.uTime.value = elapsed;

//       for (let i = 0; i < MAX_RIPPLES; i++) {
//         if (rippleAge[i] >= 0) rippleAge[i] += delta;
//         if (rippleAge[i] > 1.8) rippleAge[i] = -1;
//       }
//       material.uniforms.uRippleAge.value = [...rippleAge];

//       const h = material.uniforms.uHover.value as number;
//       material.uniforms.uHover.value = h + (hoverTarget - h) * 0.07;

//       const LF = 0.055;
//       currentRot.x += (targetRot.x - currentRot.x) * LF;
//       currentRot.y += (targetRot.y - currentRot.y) * LF;
//       currentPos.x += (targetPos.x - currentPos.x) * LF;
//       currentPos.y += (targetPos.y - currentPos.y) * LF;

//       group.rotation.x = currentRot.x;
//       group.rotation.y = currentRot.y;
//       group.position.x = currentPos.x;
//       group.position.y = currentPos.y;

//       renderer.render(scene, camera);
//     };

//     animate();

//     return () => {
//       cancelAnimationFrame(animationId);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("click",     onClick);
//       window.removeEventListener("resize",    onResize);
//       mount.removeEventListener("mouseleave", onMouseLeave);
//       renderer.dispose();
//       geometry.dispose();
//       material.dispose();
//       if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
//     };
//   }, []);

//   return (
//     <div
//       ref={mountRef}
//       className="w-full h-full"
//       style={{ cursor: "crosshair" }}
//     />
//   );
// }