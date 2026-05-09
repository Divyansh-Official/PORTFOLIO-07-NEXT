import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelTransform {
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number }; // in degrees
  scale?: number;
}

export function use3dElement(containerId: string, transform: ModelTransform = {}) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      '/3dModel/sword.glb',
      function (gltf) {
        const model = gltf.scene;

        // Auto-scale first
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const autoScale = 2 / maxDim;
        model.scale.setScalar(autoScale);
        model.position.sub(center.multiplyScalar(autoScale));

        // ✅ Apply your custom transform on top
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

        scene.add(model);
      },
      undefined,
      function (error) { console.error('GLTFLoader error:', error); }
    );

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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

