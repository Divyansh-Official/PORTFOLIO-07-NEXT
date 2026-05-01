"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FluidSimulation } from "./FluidSimulation";

const config = {
  simResolution: 256,
  dyeResolution: 1024,
  curl: 30,
  pressureIterations: 50,
  velocityDissipation: 0.98,
  dyeDissipation: 0.97,
  splatRadius: 0.4,
  forceStrength: 8,
  pressureDecay: 0.8,
  threshold: 0.3,
  edgeSoftness: 0.2,
  inkColor: new THREE.Color(1, 1, 1),
};

export default function FluidCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const sim = new FluidSimulation(canvasRef.current, config);
    return () => sim.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
        mixBlendMode: "difference",
      }}
    />
  );
}





// "use client";

// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { FluidSimulation } from "./FluidSimulation";

// const config = {
//   simResolution: 256,
//   dyeResolution: 1024,
//   curl: 25,
//   pressureIterations: 50,
//   velocityDissipation: 0.95,
//   dyeDissipation: 0.95,
//   splatRadius: 0.275,
//   forceStrength: 7.5,
//   pressureDecay: 0.75,
//   threshold: 1.0,
//   edgeSoftness: 0.0,
//   inkColor: new THREE.Color(0, 0, 0),
// };

// export default function FluidCursorTrail() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;
//     const sim = new FluidSimulation(canvasRef.current, config);
//     return () => sim.destroy();
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "fixed",
//         inset: 0,
//         width: "100%",
//         height: "100%",
//         pointerEvents: "none",
//         zIndex: 1,
//       }}
//     />
//   );
// }





// import BasicNavigationBar from "../../nav/navBar";

// export default function Hero() {
//   return (
//     <>
//     <style>
//       {`

//       @import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

//       * {
//       padding: 0;
//       box-sizing: border-box;
//       margin: 0; }

//       // h1 {
//       //   font-family: "Inter";
//       //   text-transform: uppercase;
//       //   font-size: clamp(3rem, 10vw, 15rem);
//       //   line-height: 0.9;
//       //   letter-spacing: -4%;
//       //   font-weight: 900; }
        
//         a {
//           text-decoration: none;
//           text-transform: uppercase;
//           font-family: "DM Mono";
//           font-size: 0.85rem;
//           font-weight: 500;
//           color: #000;
//           display: inline-block; }

//         #fluid {
//           inset: 0;
//           width: 100%;
//           height: 100%;
//           pointer-events: none;
//           z-index: 100;
//           mix-blend-mode: difference;
//           position: fixed; }

//         // @media (max-width: 1000px) {
//         //   .nav-links {
//         //   flex-direction: column;
//         //   gap: 0;
//         //   align-items: flex-end; } 

//         // .hero h1 {
//         //   text-align: center;
//         //   align-self: center !important; }
//         // }







//       `}
//     </style>

//     <div className="nav" > <BasicNavigationBar /> </div>
//     <div className="hero"> <Hero /> </div>

//     <canvas className="fluid" />
    
//     </>
// )};