// Vendor
import * as THREE from 'three';
import gsap from 'gsap';
import { Color, FontLoader } from 'three';
import { TextGeometry } from 'three';

import {
  Scene,
  PerspectiveCamera,
  Vector3,
  Group,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  AxesHelper,
  CameraHelper,
  PlaneGeometry,
  MeshStandardMaterial, Fog} from 'three';

import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import Breakpoints from '@/utils/Breakpoints';
import math from '@/utils/math';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Objects
import AboutSectionManager from '@/webgl/objects/AboutNewSectionManagerTwo';

import WaveBundle from '@/webgl/components/WaveBundle';

// import BackgroundLines from '@/webgl/components/BackgroundLines';


// Components
import Spinner from '@/webgl/components/SpinnerAbout';
import FloorAbout from '@/webgl/components/FloorAbout';

export default class About extends component(Scene) {
  init({ scrollContainer, renderer, nuxtRoot, postProcessing, debug }) {
    this._scrollContainer = scrollContainer;
    this._renderer = renderer;
    this._nuxtRoot = nuxtRoot;
    this._postProcessing = postProcessing;
    this._debug = debug;

    this._isActive = false;
    this._locale = this._nuxtRoot.$i18n.locale;
    this._scrollPosition = { x: 0, y: 0 };
    this._container = new Group();

    this._cameraTarget = new Vector3(0, 0, 0);
    this._debugGui = this._createDebugGui();
    this._camera = this._createCamera();

    this._createFog();


    this.add(this._container);
    this._components = this._createComponents();

    this._bindHandlers();
    this._setupEventListeners();
    this._position();

    Object.assign(this, AboutSectionManager);
  }

  destroy() {
    super.destroy();
    this._removeEventListeners();
  }

  get camera() {
    return this._camera;
  }


  onUpdate({ time, delta }) {
    if (!this._isActive) return;
  
    this._updateComponents({ time, delta });
  
    if (Breakpoints.active('small')) {
      const transform = `translateY(${this._scrollPosition.y * -0.7}px)`;
      this._scrollContainer.style.transform = transform;
      this._scrollContainer.style.webkitTransform = transform;
    }
  
    // ✨ Scroll-follow spinner behavior
    // if (this._processFollowActive) {
    //   console.log('activated bitch')
    //   const scrollY = this._scrollPosition?.y || 0;
    //   const spinner = this._components?.spinner;
    //   const cam = this._camera;
  
    //   if (!spinner || !cam) return;
  
    //   // Convert scroll to z-distance
    //   const progressZ = Math.min(5, scrollY * 0.01); // Stops at z = 5
  
    //   // Move spinner
    //   spinner.position.set(0, 0, progressZ);
  
    //   // Move camera directly above spinner
    //   cam.position.set(0, 20, progressZ);
    //   cam.lookAt(spinner.position);
    //   cam.updateMatrixWorld(true);
  
    //   this._cameraHelper?.update?.();
    // }
  }
  
  
  
  show() {
    this._locale = this._nuxtRoot?.$i18n?.locale || 'en';
    this._isActive = true;
  
    this._lastSection = null;
    this._lastDOMSectionIndex = null;
    this._hideAllStepTexts();
  
    this._resetSceneState(); // 🔁 FULL SCENE RESET
  
    const scrollY = this._nuxtRoot?.scrollManager?.scroll?.y || 0;
    this._scrollHandler({ y: scrollY });
    this._updatePostProcessing();
    // Postprocessing animations
    if (this._postProcessing?.passes?.finalPass?.material?.uniforms) {
      this._timelineShow = gsap.timeline();
      this._timelineShow.set(this._postProcessing.passes.hidePass.material, { progress: 1 }, 0.1);
      this._timelineShow.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.16 }, 1);
      this._timelineShow.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.19 }, 1);
    }
  
    this._components.spinner.play();
  
    if (this._nuxtRoot.scrollManager) {
      this._nuxtRoot.scrollManager.addEventListener('scroll', this._scrollHandler);
    }
  
    return this._timelineShow;
  }
  

  hide(onCompleteCallback) {
    if (this._timelineShow) this._timelineShow.kill();
  
    this._timelineHide = gsap.timeline({
      onComplete: () => {
        this._isActive = false;
        this._renderer.setClearColor(0x000000, 0);
        this._renderer.clear(true, true, true);
        this._renderer.autoClearColor = true;
        onCompleteCallback?.();
      }
    });
  
    this._timelineHide.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0 }, 0);
    this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);
    this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 1, { value: 0 }, 0);
    this._timelineHide.call(() => {
      this._postProcessing.passes.hidePass.material.progress = 0;
      this._reset();
    }, null, 1);
  
    return this._timelineHide;
  }
  

  goto(index, direction, done) {
    this._goto(index, direction);
  }


  _bindHandlers() {
    this._mouseDownHandler = this._mouseDownHandler.bind(this);
    this._mouseUpHandler = this._mouseUpHandler.bind(this);
    this._scrollHandler = this._scrollHandler.bind(this);
    this._timelineHideCompleteHandler = this._timelineHideCompleteHandler.bind(this);
  }

  _setupEventListeners() {
    window.addEventListener('mousedown', this._mouseDownHandler);
    window.addEventListener('mouseup', this._mouseUpHandler);
  }

  _removeEventListeners() {
    window.removeEventListener('mousedown', this._mouseDownHandler);
    window.removeEventListener('mouseup', this._mouseUpHandler);
    if (this._nuxtRoot.scrollManager) {
      this._nuxtRoot.scrollManager.removeEventListener('scroll', this._scrollHandler);
    }
  }

  _reset() {
    this._components.spinner.reset();
    // this.position.x = 1.38;
    this.position.x = 1.38;
  }

  _position() {
    if (Breakpoints.active('small')) {
      this.position.set(0.92, -1.11, -13.48);
    } else {
      this.position.set(1.38, -1.01, 0);
    }
  }

  _resetSceneState() {
    const spinner = this._components?.spinner;
    const cam = this._camera;
  
    if (!spinner || !cam) return;
  
    // Reset About scene offset
    this._position();
  
    // Reset spinner
    spinner.reset();
  
    // Reset spinner position
    spinner.position.set(0, 0, 0);
  
    // Reset camera
    cam.position.set(0, 1.24, 9.34);
    cam.lookAt(this._cameraTarget);
    cam.updateMatrixWorld(true);
  
    // Reset spark alpha
    if (spinner._sparks) spinner._sparks.alpha = 1;
  
    // Reset step texts
    this._hideAllStepTexts?.();


    this._updatePostProcessing(); 
  }
  
  

  _createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
  
    // Main camera
    const camera = new PerspectiveCamera(30, aspect, 0.1, 10000);
    camera.position.set(0, 1.24, 9.34);
    camera.lookAt(this._cameraTarget);
    console.log('target', this._cameraTarget)
    this._camera = camera;
  
    // Defer helpers if container exists
    if (this._container) {
      const axesHelper = new AxesHelper(5);
      // this._container.add(axesHelper);
  
      const cameraHelper = new CameraHelper(this._camera);
      // this._container.add(cameraHelper);
    }
  
    // Debug controls
    if (this._debugGui) {
      const debug = this._debugGui.addFolder('Camera');
      debug.add(camera.position, 'x', -50, 50, 0.01).onChange(() => camera.lookAt(this._cameraTarget));
      debug.add(camera.position, 'y', -50, 50, 0.01).onChange(() => camera.lookAt(this._cameraTarget));
      debug.add(camera.position, 'z', -50, 50, 0.01).onChange(() => camera.lookAt(this._cameraTarget));
    }
  
    return camera;
  }

  _createStepText() {
    const loader = new FontLoader();
  
    // ✅ Correct path — static files are served from root, no `/static` prefix
    loader.load('/regular.json', (font) => {
      const geometry = new TextGeometry('Step 1: Foundation'.toUpperCase(), {
        font: font,
        size: 0.65,
        height: 0.05,
        curveSegments: 12,
        bevelEnabled: false
      });
  
      geometry.computeBoundingBox();
      geometry.center();
  
      const material = new MeshBasicMaterial({ color: 0xff0000 });
      const textMesh = new Mesh(geometry, material);
  
      // ✅ Positioned near spinner
      textMesh.position.set(5.2, 0.1, 5);
      textMesh.rotation.x = -Math.PI / 2;

      textMesh.name = 'step1Text';
  
      this._container.add(textMesh);
      this._components.stepText = textMesh;
  
      // Optional fade-in animation
      textMesh.material.transparent = true;
      textMesh.material.opacity = 0;
      gsap.to(textMesh.material, {
        opacity: 1,
        duration: 1.5,
        delay: 0.2,
        ease: 'power2.out'
      });
    });
  }


  _revealStepText(text, position) {
    const key = `stepText-${text}`;
    const existing = this._components?.[key];
  
    if (existing) {
      // Re-add if removed
      if (!this._container.children.includes(existing)) {
        this._container.add(existing);
      }
  
      // ✅ Just fade in
      gsap.to(existing.material, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      });
  
      return;
    }
  
    // Else create new
    const loader = new FontLoader();
    loader.load('/regular.json', (font) => {
      const geometry = new TextGeometry(text.toUpperCase(), {
        font: font,
        size: 0.6,
        height: 0.05,
      });
  
      geometry.computeBoundingBox();
      geometry.center();
  
      const material = new MeshBasicMaterial({
        color: 0xffcc00,
        transparent: true,
        opacity: 0
      });
  
      const textMesh = new Mesh(geometry, material);
      textMesh.position.copy(position);
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.name = key;
  
      this._container.add(textMesh);
  
      gsap.to(material, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
  
      this._components[key] = textMesh;
    });
  }
  
  
  _hideAllStepTexts() {
    console.log('[🟡 Hiding all step texts]');
    const components = this._components || {};
  
    Object.keys(components).forEach((key) => {
      if (!key.startsWith('stepText-')) return;
  
      const mesh = components[key];
      if (!mesh || !mesh.material) return;
  
      gsap.to(mesh.material, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  }
  
  
  _createComponents() {
    const spinner = this._createComponentSpinner();
    const floor = this._createComponentFloor();
    // const backgroundLines = this._createComponentBackgroundLines();
    // const waves = this._createComponentWaves()
  
    return { spinner, floor};
  }
  _createComponentWaves() {
    const wave = new WaveBundle({
      strands: 1, // ✅ Fewer lines
      points: 3000,
      waveLength: 20,
      amplitude: 0.3,
      frequency: 1.2,
      speed: 1.0,
      strandSpacing: 1,
      colorFrom: '#ffffff',
      colorTo: '#ffffff',
      lineWidth: 2,
      texturePath: '/assets/stroke-v.png'
    });
    
    // wave.rotation.z = - Math.PI / 4;
    wave.position.set(0, 3.2, -10);
    wave.scale.set(3.5, 3.5, 3.5);
    wave.setOpacity(0)
    this._container.add(wave);

    return wave;
  }


  _createFog() {
    const col = new Color('#000000')
    const fog = new Fog(col, 15, 35); // Near & far distances
    this.fog = fog; // ✅ Apply directly to the scene
    // this.background = fog.color; 
    console.log('fog:', fog)
  }
  
  _createComponentSpinner() {
    const spinner = new Spinner({
      debugGui: this._debugGui,
      renderer: this._renderer,
    });
  
    // ✅ Make sure spinner is added to the container first
    this._container.add(spinner);
  
    // 🟣 Optional debug sphere (only useful in dev)
    const debugSphere = new Mesh(
      new SphereGeometry(0.1),
      new MeshBasicMaterial({ color: 0xff00ff })
    );
    debugSphere.position.copy(spinner.position);
    // this._container.add(debugSphere); // ✅ you can keep this uncommented for visual reference
  
    return spinner;
  }

  _createComponentFloor() {
    const floor = new FloorAbout({
      debugGui: this._debugGui,
      width: 50,
      height: 50,
      renderer: this._renderer,
    });
    this._container.add(floor);
    return floor;
  }

  _updateComponents({ time, delta }) {
    for (const key in this._components) {
      const component = this._components[key];
      if (typeof component.update === 'function') {
        component.update({ time, delta });
      }
    }
  }

  onResize({ width, height }) {
    this._width = width;
    this._height = height;
    this._resizeCamera();
  }

  _resizeCamera() {
    this._camera.aspect = this._width / this._height;
    this._camera.updateProjectionMatrix();
  }

  _createDebugGui() {
    const gui = Debugger.gui;
    if (!gui) return;

    const folderBackground = gui.getFolder('Background');
    const folder = folderBackground.addFolder('Scene: About');
    folder.updateTitleBackgroundColor('#1b263b');

    const folderPosition = folder.addFolder('Position');
    folderPosition.add(this.position, 'x', -150, 150, 0.01);
    folderPosition.add(this.position, 'y', -150, 150, 0.01);
    folderPosition.add(this.position, 'z', -1000, 1000, 0.01);

    return folder;
  }

  _mouseDownHandler() {}
  _mouseUpHandler() {}

  _scrollHandler(e) {
    this._scrollPosition.x = e.x;
    this._scrollPosition.y = e.y;
  }

  _timelineHideCompleteHandler(onCompleteCallback) {
    onCompleteCallback();
    this._isActive = false;
    this._components.spinner.reset();
  }

 
  _updatePostProcessing() {
    this._postProcessing.passes.bloomPass.threshold = 0.1;
    this._postProcessing.passes.bloomPass.strength = 0.65;
    this._postProcessing.passes.bloomPass.radius = 0.58;
    this._postProcessing.passes.afterImage.uniforms.damp.value = 0.62;
    this._renderer.toneMappingExposure = 1.6;

    // Gradient 1
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.r = 31 / 255;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.g = 22 / 255;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.b = 68 / 255;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength.value = 0;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.x = 0.78;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.y = 0;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale.value = 1.06;

    // Gradient 2
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value.r = 47 / 255;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value.g = 15 / 255;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value.b = 15 / 255;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength.value = 0;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value.x = 0.04;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value.y = 1;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale.value = 0.81;
}

  
}
