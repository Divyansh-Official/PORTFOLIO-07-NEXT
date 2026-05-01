// components/FluidCursorTrail.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FluidSimulation } from './FluidSimulation';

export default function FluidCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config = {
      simResolution: 128,
      dyeResolution: 1024, // Higher resolution for smoother "ink" edges
      curl: 30,
      pressureIterations: 20,
      velocityDissipation: 0.98,
      dyeDissipation: 0.96,
      splatRadius: 0.25,
      forceStrength: 10,
      pressureDecay: 0.8,
      threshold: 0.6,      // CRITICAL: Controls the "thick ink" look
      edgeSoftness: 0.1,   // CRITICAL: Keeps the edges sharp but not aliased
      inkColor: new THREE.Color(1, 1, 1), // Pure white
    };

    const sim = new FluidSimulation(canvasRef.current, config);
    
    return () => {
      // Logic for sim.destroy() should cancel rAF and dispose textures
      if (sim.destroy) sim.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999] mix-blend-difference"
      style={{ background: 'transparent' }}
    />
  );
}





// 'use client';

// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import BasicNavigationBar from '../../nav/navBar';
// import { FluidSimulation } from './FluidSimulation';

// export default function FluidCursorTrail() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // Config is created inside useEffect so THREE runs only client-side
//     const config = {
//       simResolution: 256,
//       dyeResolution: 1024,
//       curl: 25,
//       pressureIterations: 50,
//       velocityDissipation: 0.95,
//       dyeDissipation: 0.95,
//       splatRadius: 0.275,
//       forceStrength: 7.5,
//       pressureDecay: 0.75,
//       threshold: 1.0,
//       edgeSoftness: 0.0,
//       inkColor: new THREE.Color(1, 1, 1),
//     };

//     const sim = new FluidSimulation(canvas, config);

//     return () => {
//       sim.destroy(); // cleanup on unmount
//     };
//   }, []);

//   return (
//     <div>
//       <div className="nav">
//         <BasicNavigationBar />
//       </div>
//       <canvas
//         ref={canvasRef}
//         className="fixed inset-0 w-full h-full pointer-events-none z-[100] mix-blend-difference"
//       />
//     </div>
//   );
// }