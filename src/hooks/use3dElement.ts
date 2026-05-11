import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelTransform {
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number }; // degrees
  scale?: number;
}

interface ScrollConfig {
  rotation?: { x?: number; y?: number; z?: number }; // degrees per full page scroll
  position?: { x?: number; y?: number; z?: number }; // units per full page scroll
  speed?: number; // multiplier: 1 = normal, 2 = faster, 0.5 = slower
}

export function use3dElement(
  containerId: string,
  transform: ModelTransform = {},
  scroll: ScrollConfig = {}
) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(15, 15, 15);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Track base transform after model loads
    const basePosition = new THREE.Vector3();
    const baseRotation = new THREE.Euler();
    let model: THREE.Group | null = null;

    const loader = new GLTFLoader();
    loader.load(
      '/3dModel/sword.glb',
      function (gltf) {
        model = gltf.scene;

        // Auto-scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const autoScale = 2 / maxDim;
        model.scale.setScalar(autoScale);
        model.position.sub(center.multiplyScalar(autoScale));

        // Apply initial transform
        const { position, rotation, scale } = transform;

        if (position) {
          model.position.x += position.x ?? 0;
          model.position.y += position.y ?? 0;
          model.position.z += position.z ?? 0;
        }

        if (rotation) {
          model.rotation.x += THREE.MathUtils.degToRad(rotation.x ?? 0);
          model.rotation.y += THREE.MathUtils.degToRad(rotation.y ?? 0);
          model.rotation.z += THREE.MathUtils.degToRad(rotation.z ?? 0);
        }

        if (scale !== undefined) {
          model.scale.setScalar(autoScale * scale);
        }

        // ✅ Save base transform for scroll calculations
        basePosition.copy(model.position);
        baseRotation.copy(model.rotation);

        scene.add(model);
      },
      undefined,
      (error) => console.error('GLTFLoader error:', error)
    );

    // ✅ Scroll handler
    const handleScroll = () => {
      if (!model) return;

      const scrollY = window.scrollY;
      const maxScroll = Math.max(0, container.clientHeight - window.innerHeight);
      const scrollFraction = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0; // 0 to 1

      const speed = scroll.speed ?? 1;

      // Rotation from scroll
      const rx = THREE.MathUtils.degToRad((scroll.rotation?.x ?? 0) * scrollFraction * speed);
      const ry = THREE.MathUtils.degToRad((scroll.rotation?.y ?? 0) * scrollFraction * speed);
      const rz = THREE.MathUtils.degToRad((scroll.rotation?.z ?? 0) * scrollFraction * speed);

      model.rotation.x = baseRotation.x + rx;
      model.rotation.y = baseRotation.y + ry;
      model.rotation.z = baseRotation.z + rz;

      // Position from scroll
      model.position.x = basePosition.x + (scroll.position?.x ?? 0) * scrollFraction * speed;
      model.position.y = basePosition.y + (scroll.position?.y ?? 0) * scrollFraction * speed;
      model.position.z = basePosition.z + (scroll.position?.z ?? 0) * scrollFraction * speed;
    };

    window.addEventListener('scroll', handleScroll);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const reRender3D = () => {
      animId = requestAnimationFrame(reRender3D);
      renderer.render(scene, camera);
    };
    reRender3D();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerId]);
}





// import { useEffect } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// interface ModelTransform {
//   position?: { x?: number; y?: number; z?: number };
//   rotation?: { x?: number; y?: number; z?: number }; // in degrees
//   scale?: number;
// }

// export function use3dElement(containerId: string, transform: ModelTransform = {}) {
//   useEffect(() => {
//     const container = document.getElementById(containerId);
//     if (!container) return;

//     const scene = new THREE.Scene();

//     const camera = new THREE.PerspectiveCamera(
//       45,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(0, 0, 5);

//     const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
//     directionalLight.position.set(5, 5, 5);
//     scene.add(directionalLight);

//     const pointLight = new THREE.PointLight(0xffffff, 1);
//     pointLight.position.set(-5, -5, -5);
//     scene.add(pointLight);

//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     container.appendChild(renderer.domElement);

//     const loader = new GLTFLoader();
//     loader.load(
//       '/3dModel/sword.glb',
//       function (gltf) {
//         const model = gltf.scene;

//         // Auto-scale first
//         const box = new THREE.Box3().setFromObject(model);
//         const center = box.getCenter(new THREE.Vector3());
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         const autoScale = 2 / maxDim;
//         model.scale.setScalar(autoScale);
//         model.position.sub(center.multiplyScalar(autoScale));

//         // ✅ Apply your custom transform on top
//         const { position, rotation, scale } = transform;

//         if (position) {
//           model.position.x += position.x ?? 0;
//           model.position.y += position.y ?? 0;
//           model.position.z += position.z ?? 0;
//         }

//         if (rotation) {
//           model.rotation.x += THREE.MathUtils.degToRad(rotation.x ?? 0);
//           model.rotation.y += THREE.MathUtils.degToRad(rotation.y ?? 0);
//           model.rotation.z += THREE.MathUtils.degToRad(rotation.z ?? 0);
//         }

//         if (scale !== undefined) {
//           model.scale.setScalar(autoScale * scale);
//         }

//         scene.add(model);
//       },
//       undefined,
//       function (error) { console.error('GLTFLoader error:', error); }
//     );

//     const handleResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener('resize', handleResize);

//     let animId: number;
//     const reRender3D = () => {
//       animId = requestAnimationFrame(reRender3D);
//       renderer.render(scene, camera);
//     };
//     reRender3D();

//     return () => {
//       cancelAnimationFrame(animId);
//       window.removeEventListener('resize', handleResize);
//       renderer.dispose();
//       if (container.contains(renderer.domElement)) {
//         container.removeChild(renderer.domElement);
//       }
//     };
//   }, [containerId]);
// }





// import { useEffect } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// export function use3dElement(containerId: string) {
//   useEffect(() => {
//     const container = document.getElementById(containerId);
//     if (!container) return;

//     // Scene
//     const scene = new THREE.Scene();

//     // Camera
//     const camera = new THREE.PerspectiveCamera(
//       45,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(0, 0, 5);

//     // ✅ Lights — without these the model is invisible
//     const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
//     directionalLight.position.set(5, 5, 5);
//     scene.add(directionalLight);

//     const pointLight = new THREE.PointLight(0xffffff, 1);
//     pointLight.position.set(-5, -5, -5);
//     scene.add(pointLight);

//     // Renderer
//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     container.appendChild(renderer.domElement);

//     // Load model
//     const loader = new GLTFLoader();
//     loader.load(
//       '/3dModel/sword.glb',
//       function (gltf) {
//         const model = gltf.scene;

//         // ✅ Auto-center and scale the model to fit view
//         const box = new THREE.Box3().setFromObject(model);
//         const center = box.getCenter(new THREE.Vector3());
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         const scale = 2 / maxDim; // fit within 2 units

//         model.scale.setScalar(scale);
//         model.position.sub(center.multiplyScalar(scale)); // center it

//         scene.add(model);
//       },
//       undefined,
//       function (error) { console.error('GLTFLoader error:', error); }
//     );

//     // Resize handler
//     const handleResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener('resize', handleResize);

//     // Render loop
//     let animId: number;
//     const reRender3D = () => {
//       animId = requestAnimationFrame(reRender3D);
//       renderer.render(scene, camera);
//     };
//     reRender3D();

//     return () => {
//       cancelAnimationFrame(animId);
//       window.removeEventListener('resize', handleResize);
//       renderer.dispose();
//       if (container.contains(renderer.domElement)) {
//         container.removeChild(renderer.domElement);
//       }
//     };
//   }, [containerId]);
// }





// import { useEffect } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// export function use3dElement(containerId: string) {
//   useEffect(() => {
//     const container = document.getElementById(containerId);
//     if (!container) return;

//     const camera = new THREE.PerspectiveCamera(
//       10,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     camera.position.z = 13;

//     const scene = new THREE.Scene();
//     let bee: THREE.Group;

//     const loader = new GLTFLoader();
//     loader.load(
//       '/3dModel/sword.glb',
//       function (gltf) {
//         bee = gltf.scene;
//         scene.add(bee);
//       },
//       function (xhr) {},
//       function (error) { console.error(error); }
//     );

//     const renderer = new THREE.WebGLRenderer({ alpha: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     container.appendChild(renderer.domElement);

//     const handleResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener('resize', handleResize);

//     let animId: number;
//     const reRender3D = () => {
//       animId = requestAnimationFrame(reRender3D);
//       renderer.render(scene, camera);
//     };
//     reRender3D();

//     // cleanup on unmount
//     return () => {
//       cancelAnimationFrame(animId);
//       window.removeEventListener('resize', handleResize);
//       renderer.dispose();
//       container.removeChild(renderer.domElement);
//     };
//   }, [containerId]);
// }





// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// const camera = new THREE.PerspectiveCamera(
//     10,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );
// camera.position.z = 13;

// const scene = new THREE.Scene();
// let bee: THREE.Group;
// const loader = new GLTFLoader();
// loader.load('../3dModel/sword.glb',
//     function (gltf) {
//         bee = gltf.scene;
//         scene.add(bee);  // ✅ was scene.add(sword) — sword was never defined
//     },
//     function (xhr) {},
//     function (error) {}
// );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.getElementById('container3D')?.appendChild(renderer.domElement);

// const reRender3D = () => {
//     requestAnimationFrame(reRender3D);
//     renderer.render(scene, camera);
// };

// reRender3D();





// import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// const camera = new THREE.PerspectiveCamera(
//     10,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );
// camera.position.z = 13;

// const scene = new THREE.Scene();
// let bee;
// const loader = new GLTFLoader();
// loader.load('../3dModel/sword.glb',
//     function (gltf) {
//         bee = gltf.scene;
//         scene.add(sword);
//     },
//     function (xhr) {},
//     function (error) {}
// );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.getElementById('container3D').appendChild(renderer.domElement);

// const reRender3D = () => {
//     requestAnimationFrame(reRender3D);
//     renderer.render(scene, camera);
// };

// reRender3D();

