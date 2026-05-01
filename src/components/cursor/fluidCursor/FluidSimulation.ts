import * as THREE from "three";
import shaders from "./shaders";

interface Config {
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

type DoubleTarget = {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap(): void;
};

export class FluidSimulation {
  private config: Config;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private quad!: THREE.Mesh;
  private dpr!: number;
  private width!: number;
  private height!: number;
  private simSize!: { w: number; h: number };
  private dyeSize!: { w: number; h: number };
  private velocity!: DoubleTarget;
  private dye!: DoubleTarget;
  private divergenceTarget!: THREE.WebGLRenderTarget;
  private curlTarget!: THREE.WebGLRenderTarget;
  private pressure!: DoubleTarget;
  private material!: Record<string, THREE.ShaderMaterial>;
  private mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false };
  private rafId = 0;
  private _onResize!: () => void;
  private _onMouseMove!: (e: MouseEvent) => void;
  private _onTouchMove!: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, config: Config) {
    this.config = config;
    this._setupRenderer(canvas);
    this._setupScene();
    this._setupTargets();
    this._setupMaterials();
    this._setupInput();
    this._loop();
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("touchmove", this._onTouchMove);
    this.renderer.dispose();
  }

  private _setupRenderer(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.dpr = this.renderer.getPixelRatio();
    this.width = innerWidth * this.dpr;
    this.height = innerHeight * this.dpr;
    this._onResize = () => {
      this.renderer.setSize(innerWidth, innerHeight);
      this.width = innerWidth * this.dpr;
      this.height = innerHeight * this.dpr;
    };
    window.addEventListener("resize", this._onResize);
  }

  private _setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);
  }

  private _setupTargets() {
    const { simResolution: simRes, dyeResolution: dyeRes } = this.config;
    const aspect = this.width / this.height;
    const options = {
      type: THREE.HalfFloatType as THREE.TextureDataType,
      depthBuffer: false,
    };

    const single = (w: number, h: number) =>
      new THREE.WebGLRenderTarget(w, h, options);

    const double = (w: number, h: number): DoubleTarget => ({
      read: single(w, h),
      write: single(w, h),
      swap() {
        [this.read, this.write] = [this.write, this.read];
      },
    });

    this.simSize = { w: simRes, h: Math.round(simRes / aspect) };
    this.dyeSize = { w: dyeRes, h: Math.round(dyeRes / aspect) };
    this.velocity = double(this.simSize.w, this.simSize.h);
    this.dye = double(this.dyeSize.w, this.dyeSize.h);
    this.divergenceTarget = single(this.simSize.w, this.simSize.h);
    this.curlTarget = single(this.simSize.w, this.simSize.h);
    this.pressure = double(this.simSize.w, this.simSize.h);
  }

  private _setupMaterials() {
    const make = (
      [vertexShader, fragmentShader]: string[],
      uniforms: Record<string, { value: unknown }>
    ) => new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });

    const tex = () => ({ value: null as THREE.Texture | null });
    const num = (v = 0) => ({ value: v });
    const vec2 = () => ({ value: new THREE.Vector2() });

    this.material = {
      splat: make(shaders.splat, {
        uTarget: tex(),
        aspectRatio: num(),
        radius: num(),
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
      }),
      advection: make(shaders.advection, {
        uVelocity: tex(),
        uSource: tex(),
        texelSize: vec2(),
        dt: num(),
        dissipation: num(),
      }),
      divergence: make(shaders.divergence, {
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      curl: make(shaders.curl, { uVelocity: tex(), texelSize: vec2() }),
      vorticity: make(shaders.vorticity, {
        uVelocity: tex(),
        uCurl: tex(),
        texelSize: vec2(),
        curlStrength: num(),
        dt: num(),
      }),
      pressure: make(shaders.pressure, {
        uPressure: tex(),
        uDivergence: tex(),
        texelSize: vec2(),
      }),
      gradientSubtract: make(shaders.gradientSubtract, {
        uPressure: tex(),
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      clear: make(shaders.clear, { uTexture: tex(), value: num() }),
      display: make(shaders.display, {
        uTexture: tex(),
        threshold: num(),
        edgeSoftness: num(),
        inkColor: { value: new THREE.Color() },
      }),
    };
  }

  private _setupInput() {
    const onMove = (x: number, y: number) => {
      this.mouse.velocityX =
        (x * this.dpr - this.mouse.x) * this.config.forceStrength;
      this.mouse.velocityY =
        (y * this.dpr - this.mouse.y) * this.config.forceStrength;
      this.mouse.x = x * this.dpr;
      this.mouse.y = y * this.dpr;
      this.mouse.moved = true;
    };
    this._onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    this._onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("touchmove", this._onTouchMove, { passive: false });
  }

  private _pass(
    material: THREE.ShaderMaterial,
    target: THREE.WebGLRenderTarget | null
  ) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target ?? null);
    this.renderer.render(this.scene, this.camera);
  }

  private _set(
    material: THREE.ShaderMaterial,
    values: Record<string, unknown>
  ) {
    Object.entries(values).forEach(
      ([key, val]) => (material.uniforms[key].value = val)
    );
    return material;
  }

  private _splat(x: number, y: number, velocityX: number, velocityY: number) {
    const { material: m, velocity: vel, dye, width, height, config: c } = this;
    this._set(m.splat, {
      aspectRatio: width / height,
      point: new THREE.Vector2(x / width, 1 - y / height),
      radius: c.splatRadius / 100,
    });
    this._set(m.splat, {
      uTarget: vel.read.texture,
      color: new THREE.Vector3(velocityX, -velocityY, 0),
    });
    this._pass(m.splat, vel.write);
    vel.swap();

    this._set(m.splat, {
      uTarget: dye.read.texture,
      color: new THREE.Vector3(3, 3, 3),
    });
    this._pass(m.splat, dye.write);
    dye.swap();
  }

  private _simulate(dt: number) {
    const {
      material: m,
      velocity: vel,
      dye,
      divergenceTarget: div,
      curlTarget: curl,
      pressure: pres,
      simSize,
      dyeSize,
      config: c,
    } = this;
    const simTexel = new THREE.Vector2(1 / simSize.w, 1 / simSize.h);

    this._pass(
      this._set(m.curl, { uVelocity: vel.read.texture, texelSize: simTexel }),
      curl
    );
    this._pass(
      this._set(m.vorticity, {
        uVelocity: vel.read.texture,
        uCurl: curl.texture,
        texelSize: simTexel,
        curlStrength: c.curl,
        dt,
      }),
      vel.write
    );
    vel.swap();

    this._pass(
      this._set(m.divergence, {
        uVelocity: vel.read.texture,
        texelSize: simTexel,
      }),
      div
    );
    this._pass(
      this._set(m.clear, {
        uTexture: pres.read.texture,
        value: c.pressureDecay,
      }),
      pres.write
    );
    pres.swap();

    this._set(m.pressure, { uDivergence: div.texture, texelSize: simTexel });
    for (let i = 0; i < c.pressureIterations; i++) {
      m.pressure.uniforms.uPressure.value = pres.read.texture;
      this._pass(m.pressure, pres.write);
      pres.swap();
    }

    this._pass(
      this._set(m.gradientSubtract, {
        uPressure: pres.read.texture,
        uVelocity: vel.read.texture,
        texelSize: simTexel,
      }),
      vel.write
    );
    vel.swap();

    this._set(m.advection, {
      uVelocity: vel.read.texture,
      uSource: vel.read.texture,
      texelSize: simTexel,
      dt,
      dissipation: c.velocityDissipation,
    });
    this._pass(m.advection, vel.write);
    vel.swap();

    this._set(m.advection, {
      uSource: dye.read.texture,
      texelSize: new THREE.Vector2(1 / dyeSize.w, 1 / dyeSize.h),
      dissipation: c.dyeDissipation,
    });
    this._pass(m.advection, dye.write);
    dye.swap();
  }

  private _render() {
    this._pass(
      this._set(this.material.display, {
        uTexture: this.dye.read.texture,
        threshold: this.config.threshold,
        edgeSoftness: this.config.edgeSoftness,
        inkColor: this.config.inkColor,
      }),
      null
    );
  }

  private _loop() {
    let lastTime = Date.now();
    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();
      if (this.mouse.moved) {
        this._splat(
          this.mouse.x,
          this.mouse.y,
          this.mouse.velocityX,
          this.mouse.velocityY
        );
        this.mouse.moved = false;
      }
      this._simulate(dt);
      this._render();
    };
    tick();
  }
}





// import * as THREE from "three";
// import shaders from "./shaders.ts";

// export class FluidSimulation {
//   constructor(canvas, config) {
//     this.config = config;
//     this._setupRenderer(canvas);
//     this._setupScene();
//     this._setupTargets();
//     this._setupMaterials();
//     this._setupInput();
//     this._loop();
//   }

//   _setupRenderer(canvas) {
//   this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
//   this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
//   this.renderer.setSize(innerWidth, innerHeight);
//   this.dpr = this.renderer.getPixelRatio();
//   this.width = innerWidth * this.dpr;
//   this.height = innerHeight * this.dpr;
//   window.addEventListener("resize", () => {
//     this.renderer.setSize(innerWidth, innerHeight);
//     this.width = innerWidth * this.dpr;
//     this.height = innerHeight * this.dpr;
//   });
// }

// _setupScene() {
//   this.scene = new THREE.Scene();
//   this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
//   this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
//   this.scene.add(this.quad);
// }

// _setupTargets() {
//   const { simResolution: simRes, dyeResolution: dyeRes } = this.config;
//   const aspect = this.width / this.height;
//   const options = { type: THREE.HalfFloatType, depthBuffer: false };

//   const single = (w, h) => new THREE.WebGLRenderTarget(w, h, options);
//   const double = (w, h) => ({
//     read: single(w, h),
//     write: single(w, h),
//     swap() {
//       [this.read, this.write] = [this.write, this.read];
//     },
//   });

//   this.simSize = { w: simRes, h: Math.round(simRes / aspect) };
//   this.dyeSize = { w: dyeRes, h: Math.round(dyeRes / aspect) };

//   this.velocity = double(this.simSize.w, this.simSize.h);
//   this.dye = double(this.dyeSize.w, this.dyeSize.h);
//   this.divergence = single(this.simSize.w, this.simSize.h);
//   this.curl = single(this.simSize.w, this.simSize.h);
//   this.pressure = double(this.simSize.w, this.simSize.h);
// }

// _setupMaterials() {
//   const make = ([vert, frag], uniforms) =>
//     new THREE.ShaderMaterial({
//       vertexShader: vert,
//       fragmentShader: frag,
//       uniforms,
//     });
//   const tex = () => ({ value: null });
//   const num = (v = 0) => ({ value: v });
//   const vec2 = () => ({ value: new THREE.Vector2() });

//   this.material = {
//     splat: make(shaders.splat, {
//       uTarget: tex(),
//       aspectRatio: num(),
//       radius: num(),
//       color: { value: new THREE.Vector3() },
//       point: { value: new THREE.Vector2() },
//     }),
//     advection: make(shaders.advection, {
//       uVelocity: tex(),
//       uSource: tex(),
//       texelSize: vec2(),
//       dt: num(),
//       dissipation: num(),
//     }),
//     divergence: make(shaders.divergence, {
//       uVelocity: tex(),
//       texelSize: vec2(),
//     }),
//     curl: make(shaders.curl, { uVelocity: tex(), texelSize: vec2() }),
//     vorticity: make(shaders.vorticity, {
//       uVelocity: tex(),
//       uCurl: tex(),
//       texelSize: vec2(),
//       curlStrength: num(),
//       dt: num(),
//     }),
//     pressure: make(shaders.pressure, {
//       uPressure: tex(),
//       uDivergence: tex(),
//       texelSize: vec2(),
//     }),
//     gradientSubtract: make(shaders.gradientSubtract, {
//       uPressure: tex(),
//       uVelocity: tex(),
//       texelSize: vec2(),
//     }),
//     clear: make(shaders.clear, { uTexture: tex(), value: num() }),
//     display: make(shaders.display, {
//       uTexture: tex(),
//       threshold: num(),
//       edgeSoftness: num(),
//       inkColor: { value: new THREE.Color() },
//     }),
//   };
// }

// _setupInput() {
//   this.mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false };
//   const onMove = (x, y) => {
//     this.mouse.velocityX =
//       (x * this.dpr - this.mouse.x) * this.config.forceStrength;
//     this.mouse.velocityY =
//       (y * this.dpr - this.mouse.y) * this.config.forceStrength;
//     this.mouse.x = x * this.dpr;
//     this.mouse.y = y * this.dpr;
//     this.mouse.moved = true;
//   };
//   window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
//   window.addEventListener(
//     "touchmove",
//     (e) => {
//       e.preventDefault();
//       onMove(e.touches[0].clientX, e.touches[0].clientY);
//     },
//     { passive: false }
//   );
// }

//  _pass(material, target) {
//     this.quad.material = material;
//     this.renderer.setRenderTarget(target ?? null);
//     this.renderer.render(this.scene, this.camera);
//   }

//   _set(material, values) {
//     Object.entries(values).forEach(
//       ([key, val]) => (material.uniforms[key].value = val),
//     );
//     return material;
//   }

// _splat(x, y, velocityX, velocityY) {
//   const { material: m, velocity: vel, dye, width, height, config: c } =
//   this;
//   this._set(m.splat, {
//     aspectRatio: width / height,
//     point: new THREE.Vector2(x / width, 1 - y / height),
//     radius: c.splatRadius / 100,
//   });

//   this._set(m.splat, {
//     uTarget: vel.read.texture,
//     color: new THREE.Vector3(velocityX, -velocityY, 0),
//   });
//   this._pass(m.splat, vel.write);
//   vel.swap();

//   this._set(m.splat, {
//     uTarget: dye.read.texture,
//     color: new THREE.Vector3(3, 3, 3),
//   });
//   this._pass(m.splat, dye.write);
//   dye.swap();
// }

// _simulate(dt) {
//   const {
//     material: m,
//     velocity: vel,
//     dye,
//     divergence: div,
//     curl,
//     pressure: pres,
//     simSize,
//     dyeSize,
//     config: c,
//   } = this;
//   const simTexel = new THREE.Vector2(1 / simSize.w, 1 / simSize.h);

//   this._pass(
//   this._set(m.curl, { uVelocity: vel.read.texture, texelSize:
//   simTexel }),
//   curl,
// );

// this._pass(
//   this._set(m.vorticity, {
//     uVelocity: vel.read.texture,
//     uCurl: curl.texture,
//     texelSize: simTexel,
//     curlStrength: c.curl,
//     dt,
//     }),
//     vel.write,
//   );

//   vel.swap();

//   this._pass(
//     this._set(m.divergence, {
//       uVelocity: vel.read.texture,
//       texelSize: simTexel,
//     }),
//     div,
//   );

//   this._pass(
//     this._set(m.clear, {
//       uTexture: pres.read.texture,
//       value: c.pressureDecay,
//     }),
//     pres.write,
//   );
//   pres.swap();

//   this._set(m.pressure, { uDivergence: div.texture, texelSize: simTexel });
//   for (let i = 0; i < c.pressureIterations; i++) {
//     m.pressure.uniforms.uPressure.value = pres.read.texture;
//     this._pass(m.pressure, pres.write);
//     pres.swap();
//   }

//   this._pass(
//     this._set(m.gradientSubtract, {
//       uPressure: pres.read.texture,
//       uVelocity: vel.read.texture,
//       texelSize: simTexel,
//     }),
//     vel.write,
//   );vel.swap();

//   this._set(m.advection, {
//     uVelocity: vel.read.texture,
//     uSource: vel.read.texture,
//     texelSize: simTexel,
//     dt,
//     dissipation: c.velocityDissipation,
//   });
//   this._pass(m.advection, vel.write);
//   vel.swap();

//   this._set(m.advection, {
//     uSource: dye.read.texture,
//     texelSize: new THREE.Vector2(1 / dyeSize.w, 1 / dyeSize.h),
//     dissipation: c.dyeDissipation,
//   });
//   this._pass(m.advection, dye.write);
//   dye.swap();
// }

// _render() {
//   this._pass(
//     this._set(this.material.display, {
//       uTexture: this.dye.read.texture,
//       threshold: this.config.threshold,
//       edgeSoftness: this.config.edgeSoftness,
//       inkColor: this.config.inkColor,
//     }),
//     null,
//   );
// }

// _loop() {
//     let lastTime = Date.now();
//     const tick = () => {
//       const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
//       lastTime = Date.now();
//       if (this.mouse.moved) {
//         this._splat(
//           this.mouse.x,
//           this.mouse.y,
//           this.mouse.velocityX,
//           this.mouse.velocityY,
//         );
//         this.mouse.moved = false;
//       }
//       this._simulate(dt);
//       this._render();
//       requestAnimationFrame(tick);
//     };
//     tick();
//   }
// }