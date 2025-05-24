// Vendor
import gsap from 'gsap';
import { Scene, Group, PerspectiveCamera, Vector3, WebGLCubeRenderTarget, LinearMipmapLinearFilter, CubeCamera, RGBAFormat } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import lerp from '@/utils/math/lerp';

// Components
import Spinner from '@/webgl/components/SpinnerPortfolio';
import Floor from '@/webgl/components/FloorPortfolio';
import PortfolioCarousel from '@/webgl/components/PortfolioCarousel';

export default class Portfolio extends component(Scene) {
    init({ renderer, nuxtRoot, postProcessing, debug }) {
        // Props
        this._renderer = renderer;
        this._nuxtRoot = nuxtRoot;
        this._postProcessing = postProcessing;
        this._debug = debug;
        this._group = new Group();
        this.add(this._group);
        // Settings
        this.position.x = 0;
        this.position.y = 0; // 1.2;
        this.position.z = 0; // 31.4;

        this.rotation.z = Math.PI * 0.025;

        this.cameraPosition = {};
        this.cameraPosition.x = 0;
        this.cameraPosition.y = 2;
        this.cameraPosition.z = 38;

        this.cameraRotation = {};
        this.cameraRotation.x = 0;
        this.cameraRotation.y = 0;
        this.cameraRotation.z = 0;

        // Settings > Camera Animations
        this.cameraAnimationPositionFactor = {};
        this.cameraAnimationPositionFactor.x = 2;
        this.cameraAnimationPositionFactor.y = 0.4;

        this.cameraAnimationRotationFactor = {};
        this.cameraAnimationRotationFactor.x = -0.015;
        this.cameraAnimationRotationFactor.y = -0.02;
        this.cameraAnimationRotationFactor.z = 0.02;

        // Settings Carousel
        this.carouselPosition = {};
        this.carouselPosition.x = 0;
        this.carouselPosition.y = 0;
        this.carouselPosition.z = -2;

        // Mouse
        this._mousePosition = {
            x: 0,
            y: 0,
        };

        this._cameraAnimationPosition = {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
        };

        // Drag
        this._deltaX = {
            current: 0,
            target: 0,
        };

        // Flags
        this._isActive = false;

        // Data
        this._debugGui = this._createDebugGui();
        this._camera = this._createCamera();
        this._cubeRenderTarget = this._createCubeRenderTarget();
        this._cubeCamera = this._createCubeCamera();
        this._components = this._createComponents();

        // Setup
        this._bindHandlers();
        this._setupEventListeners();
    }

    _updateMouse() {
        this._cameraAnimationPosition.current.x = lerp(this._cameraAnimationPosition.current.x, this._cameraAnimationPosition.target.x, 0.05);
        this._cameraAnimationPosition.current.y = lerp(this._cameraAnimationPosition.current.y, this._cameraAnimationPosition.target.y, 0.05);

        this._deltaX.current = lerp(this._deltaX.current, this._deltaX.target, 0.01);
    }

    _animateScene() {
        this._camera.position.z = this.cameraPosition.z;
        this._camera.position.x = this.cameraPosition.x - this._cameraAnimationPosition.current.x * this.cameraAnimationPositionFactor.x;
        this._camera.position.y = this.cameraPosition.y - this._cameraAnimationPosition.current.y * this.cameraAnimationPositionFactor.y;

        this._camera.rotation.x = this._cameraAnimationPosition.current.y * this.cameraAnimationRotationFactor.x;
        this._camera.rotation.y = this._cameraAnimationPosition.current.x * this.cameraAnimationRotationFactor.y;
        this._camera.rotation.z = this._cameraAnimationPosition.current.x * this.cameraAnimationRotationFactor.z;
    }

    /**
     * Getters
     */
    get camera() {
        return this._camera;
    }

    /**
     * Triggers
     */
    onUpdate({ time, delta }) {
        if (!this._isActive) return;

        this._components.spinner.visible = false;
        this._cubeCamera.update(this._renderer, this);
        this._components.spinner.visible = true;

        this._updateMouse();
        this._animateScene();

        this._updateComponents({ time, delta });
    }

    /**
     * Public
     */
    destroy() {
        super.destroy();
        this._removeEventListeners();
    }

    show() {
        this._isActive = true;
        this._updatePostProcessing();

        this._timelineShow = new gsap.timeline();
        this._timelineShow.to(this._postProcessing.passes.hidePass.material, 2, { progress: 1, ease: 'sine.inOut' }, 0);
        this._timelineShow.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2.5, { value: 0.49 }, 0.5);
        this._timelineShow.to(this._postProcessing.passes.bloomPass, 3, { strength: 0.22, ease: 'sine.inOut' }, 0);
        return this._timelineShow;
    }

    hide(onCompleteCallback) {
        if (this._timelineShow) this._timelineShow.kill();
      
        this._timelineHide = gsap.timeline({
          onComplete: () => {
            this._isActive = false;
            this._postProcessing.resetDefaults?.();
      
            this._renderer.setClearColor(0x000000, 0); // transparent black
            this._renderer.clear(true, true, true);
            this._renderer.autoClearColor = true;
      
            onCompleteCallback?.();
          }
        });
      
        this._timelineHide.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0 }, 0);
        this._timelineHide.to(this._postProcessing.passes.bloomPass, 1, { strength: 0 }, 0);
        this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);
        this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 1, { value: 0 }, 0);
        this._timelineHide.to(this._group, { opacity: 0, duration: 1, ease: 'sine.inOut' }, 0.1);
        this._timelineHide.call(() => {
          this._postProcessing.passes.hidePass.material.progress = 0;

        }, null, 1);
      
        return this._timelineHide;
      }
      
      
    

    focus() {}

    unfocus() {}

    setupSlides(projects, direction) {
        this._components.carousel.setupDirection(direction);
        this._components.carousel.setupSlides(projects);
    }

    destroySlides() {
        this._components.carousel.destroySlides();
    }

    updateCarouselPosition(x) {
        this._components.carousel.updatePosition(x);
    }

    hideCarouselSlides() {
        const timeline = new gsap.timeline();
        timeline.add(this._components.carousel.hideSlides(), 0);

        return timeline;
    }

    showCarouselSlides() {
        const timeline = new gsap.timeline();
        timeline.add(this._components.carousel.showSlides(), 0);

        return timeline;
    }

    hoverAnimationIn() {
        if (this.hoverOutTimeline) this.hoverOutTimeline.kill();
        this.hoverInTimeline = new gsap.timeline();
        this.hoverInTimeline.to(this.position, 1, { z: 1.8, ease: 'power2.out' });

        return this.hoverInTimeline;
    }

    hoverAnimationOut() {
        if (this.hoverInTimeline) this.hoverInTimeline.kill();
        this.hoverOutTimeline = new gsap.timeline();
        this.hoverOutTimeline.to(this.position, 0.6, { z: 0, ease: 'sine.inOut' });

        return this.hoverOutTimeline;
    }

    resetCarouselPosition(x) {
        this._components.carousel.resetPosition(x);
    }

    setActive(index) {
        this._components.carousel.setActive(index);
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._mouseDownHandler = this._mouseDownHandler.bind(this);
        this._mouseUpHandler = this._mouseUpHandler.bind(this);
        this._mousemoveHandler = this._mousemoveHandler.bind(this);
        this._timelineHideCompleteHandler = this._timelineHideCompleteHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('mousedown', this._mouseDownHandler);
        window.addEventListener('mouseup', this._mouseUpHandler);
        window.addEventListener('mousemove', this._mousemoveHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('mousedown', this._mouseDownHandler);
        window.removeEventListener('mouseup', this._mouseUpHandler);
        window.removeEventListener('mousemove', this._mousemoveHandler);
    }

    _createCamera() {
        const camera = new PerspectiveCamera(30, 1, 0.1, 10000);
        camera.position.x = this.cameraPosition.x;
        camera.position.y = this.cameraPosition.y;
        camera.position.z = this.cameraPosition.z;
        camera.lookAt(new Vector3(0, 0, 0));

        const controls = new OrbitControls(camera, this._renderer.domElement);
        controls.screenSpacePanning = true;
        controls.update();

        if (this._debugGui) {
            const center = new Vector3(0, 0, 0);
            const debug = this._debugGui.addFolder('Camera');
            debug.add(this.cameraPosition, 'x', -20, 20, 0.1).onChange(() => {
                camera.lookAt(center);
            });
            debug.add(this.cameraPosition, 'z', -100, 100, 0.1).onChange(() => {
                camera.lookAt(center);
            });
            debug.add(this.cameraPosition, 'y', -20, 20, 0.1).onChange(() => {
                camera.lookAt(center);
            });
        }

        return camera;
    }

    _createCubeRenderTarget() {
        const cubeRenderTarget = new WebGLCubeRenderTarget(128, {
            format: RGBAFormat,
            generateMipmaps: true,
            minFilter: LinearMipmapLinearFilter,
            encoding: this._renderer.outputEncoding,
        });
        // cubeRenderTarget.texture.encoding = this._renderer.outputEncoding;
        return cubeRenderTarget;
    }

    _createCubeCamera() {
        const cubeCamera = new CubeCamera(0.01, 500, this._cubeRenderTarget);
        // cubeCamera.position.y = 2;
        // this.add(cubeCamera);
        return cubeCamera;
    }

    _updatePostProcessing() {
        this._postProcessing.passes.bloomPass.threshold = 0;
        this._postProcessing.passes.bloomPass.strength = 0;
        this._postProcessing.passes.bloomPass.radius = 1.09;
        this._renderer.toneMappingExposure = 0.55;

        this._postProcessing.passes.finalPass.material.uniforms.uGradientsAlpha.value = 1;
        this._postProcessing.passes.afterImage.uniforms.damp.value = 0;

        // Gradient 1
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.r = 22 / 255;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.g = 18 / 255;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.b = 93 / 255;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength.value = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.x = 0.49;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.y = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale.value = 1.16;

        // Gradient 2
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value.r = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value.g = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value.b = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength.value = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value.x = 0.04;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value.y = 1;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale.value = 0.81;
    }

    /**
     * Components
     */
    _createComponents() {
        const components = {};
        components.spinner = this._createComponentSpinner();
        components.floor = this._createComponentFloor();
        components.carousel = this._createCarousel();

        this._group.add(components.spinner);
        this._group.add(components.floor);
        this._group.add(components.carousel);

        return components;
    }

    _createComponentSpinner() {
        const spinner = new Spinner({
            debugGui: this._debugGui,
            envMap: this._cubeRenderTarget.texture,
        });
        spinner.scale.multiplyScalar(0.5);
        spinner.position.x = 1.5;
        spinner.position.y = 0;
        spinner.position.z = 5;

        spinner.add(this._cubeCamera);

        this.add(spinner);
        return spinner;
    }

    _createComponentFloor() {
        const floor = new Floor({
            debugGui: this._debugGui,
            width: 500,
            height: 500,
            renderer: this._renderer,
        });
        this.add(floor);
        return floor;
    }

    _createCarousel() {
        const carousel = new PortfolioCarousel({
            debugGui: this._debugGui,
            camera: this._camera,
        });

        carousel.position.x = this.carouselPosition.x;
        carousel.position.y = this.carouselPosition.y;
        carousel.position.z = this.carouselPosition.z;

        this.add(carousel);
        return carousel;
    }

    _updateCarousel() {
        this._components.carousel.position.x = this.carouselPosition.x;
        this._components.carousel.position.y = this.carouselPosition.y;
        this._components.carousel.position.z = this.carouselPosition.z;
    }

    _updateComponents({ time, delta }) {
        let component;
        for (const key in this._components) {
            component = this._components[key];
            if (typeof component.update === 'function') {
                component.update({ time, delta });
            }
        }
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeCamera();
        this._components.carousel.resize({ width, height });
    }

    _resizeCamera() {
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const folderBackground = gui.getFolder('Background');
        const folder = folderBackground.addFolder('Scene: Portfolio');
        folder.updateTitleBackgroundColor('#778da9');

        const folderPosition = folder.addFolder('Position');
        folderPosition.add(this.position, 'x', -10, 50, 0.01);
        folderPosition.add(this.position, 'y', -10, 50, 0.01);
        folderPosition.add(this.position, 'z', -10, 50, 0.01);

        const folderCameraAnimationPosition = folder.addFolder('Camera Animation Position');
        folderCameraAnimationPosition.add(this.cameraAnimationPositionFactor, 'x', -5, 5, 0.0001);
        folderCameraAnimationPosition.add(this.cameraAnimationPositionFactor, 'y', -5, 5, 0.0001);

        const folderCameraAnimationRotation = folder.addFolder('Camera Animation Rotation');
        folderCameraAnimationRotation.add(this.cameraAnimationRotationFactor, 'x', -5, 5, 0.0001);
        folderCameraAnimationRotation.add(this.cameraAnimationRotationFactor, 'y', -5, 5, 0.0001);
        folderCameraAnimationRotation.add(this.cameraAnimationRotationFactor, 'z', -5, 5, 0.0001);

        const folderCarouselPosition = folder.addFolder('Carousel Position');

        folderCarouselPosition.add(this.carouselPosition, 'x', -50, 50, 0.0001).onChange(() => {
            this._updateCarousel();
        });
        folderCarouselPosition.add(this.carouselPosition, 'y', -50, 50, 0.0001).onChange(() => {
            this._updateCarousel();
        });
        folderCarouselPosition.add(this.carouselPosition, 'z', -50, 50, 0.0001).onChange(() => {
            this._updateCarousel();
        });

        return folder;
    }

    /**
     * Handlers
     */
    _mouseDownHandler() {
        // this.focus();
    }

    _mouseUpHandler() {
        // this.unfocus();
    }

    _mousemoveHandler(e) {
        const x = e.clientX;
        const y = e.clientY;

        const normalizedX = (x - window.innerWidth / 2) / (window.innerWidth / 2);
        const normalizedY = (y - window.innerHeight / 2) / (window.innerHeight / 2);

        this._mousePosition.x = normalizedX * 0.5;
        this._mousePosition.y = normalizedY * -0.5;

        this._cameraAnimationPosition.target = {
            x: this._mousePosition.x,
            y: this._mousePosition.y,
        };
    }

    dragHandler(deltaX) {
        this._isDraging = true;
        this._deltaX.target = deltaX;
    }

    dragEndHandler(deltaX) {
        this._isDraging = false;
        this._deltaX.target = deltaX;
    }

    _timelineHideCompleteHandler(onCompleteCallback) {
        onCompleteCallback();
        this._isActive = false;
    }
}
