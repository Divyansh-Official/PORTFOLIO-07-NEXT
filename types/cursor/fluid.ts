// types/fluid.ts
import * as THREE from 'three';

export interface FluidConfig {
  simResolution: number;
  dyeResolution: number;
  curl: number;
  pressureIterations: number;
  velocityDissipation: number;
  dyeDissipation: number;
  splatRadius: number;
  forceStrength: number;
  pressureDecay: number;
  threshold: number;
  edgeSoftness: number;
  inkColor: THREE.Color;
}

// Do NOT export a defaultConfig with `new THREE.Color()` here —
// construct it inside useEffect in the component instead.