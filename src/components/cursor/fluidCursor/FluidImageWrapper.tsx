'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FluidSimulation } from './FluidSimulation';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function FluidImageWrapper({ children, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSimulation | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Ensure we are in the browser and refs are assigned
    if (!canvas || !container) return;

    const config = {
      simResolution: 128,
      dyeResolution: 512,
      curl: 25,
      pressureIterations: 20,
      velocityDissipation: 0.95,
      dyeDissipation: 0.95,
      splatRadius: 0.3,
      forceStrength: 8,
      pressureDecay: 0.75,
      threshold: 0.5,
      edgeSoftness: 0.2,
      inkColor: new THREE.Color(1, 1, 1),
    };

    // Initialize the simulation once using the ref
    // We pass the container as the third argument to scope mouse events to this wrapper
    simRef.current = new FluidSimulation(canvas, config, container);

    return () => {
      // Clean up the simulation when the component unmounts
      if (simRef.current) {
        simRef.current.destroy();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* This renders your image or content */}
      <div className="relative z-0">
        {children}
      </div>
      
      {/* The fluid overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-difference"
      />
    </div>
  );
}





// 'use client';

// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { FluidSimulation } from './FluidSimulation';

// interface Props {
//   children: React.ReactNode;
//   className?: string;
// }

// export default function FluidImageWrapper({ children, className = '' }: Props) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const container = containerRef.current;
//     if (!canvas || !container) return;

//     const config = {
//       simResolution: 128,
//       dyeResolution: 512,
//       curl: 25,
//       pressureIterations: 20,
//       velocityDissipation: 0.95,
//       dyeDissipation: 0.95,
//       splatRadius: 0.3,
//       forceStrength: 8,
//       pressureDecay: 0.75,
//       threshold: 0.5,
//       edgeSoftness: 0.2,
//       inkColor: new THREE.Color(1, 1, 1),
//     };

//     const sim = new FluidSimulation(canvas, config, container);
//     return () => sim.destroy();
//   }, []);

//   return (
//     <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
//       {children}
//       <canvas
//         ref={canvasRef}
//         className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-difference"
//       />
//     </div>
//   );
// }