// Vendor
import gsap from 'gsap';
import { Scene, PerspectiveCamera, Vector3, Group } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import Breakpoints from '@/utils/Breakpoints';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Objects
import AboutSectionManager from '@/webgl/objects/AboutNewSectionManager';

// Components
import Spinner from '@/webgl/components/SpinnerAbout';
import FloorAbout from '@/webgl/components/FloorAbout';
import math from '@/utils/math';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default class About extends component(Scene) {
    init({ scrollContainer, renderer, nuxtRoot, postProcessing, debug }) {
        // Props
        this._scrollContainer = scrollContainer;
        this._renderer = renderer;
        this._nuxtRoot = nuxtRoot;
        this._postProcessing = postProcessing;
        this._debug = debug;

        // Flags
        this._isActive = false;

        // Data
        this._locale = this._nuxtRoot.$i18n.locale;
        this._scrollPosition = { x: 0, y: 0 };
        this._scrollTriggersTime = 0;
        this._cameraTarget = new Vector3(0, 0, 0);
        this._debugGui = this._createDebugGui();
        this._camera = this._createCamera();
        this._container = new Group();
        this.add(this._container);
        this._components = this._createComponents();

        // Setup
        this._bindHandlers();
        this._setupEventListeners();
        this._position();

        // Section functions
        Object.assign(this, AboutSectionManager);
    }

    destroy() {
        super.destroy();
        this._removeEventListeners();
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

        this._updateComponents({ time, delta });
        if (Breakpoints.active('small')) {
            const transform = `translateY(${this._scrollPosition.y * -0.7}px)`;
            this._scrollContainer.style.transform = transform;
            this._scrollContainer.style.webkitTransform = transform;
        } else {
            // this._updateScrollTriggersTimeline();
        }
    }

    /**
     * Public
     */
    show() {
        this._locale = this._nuxtRoot.$i18n.locale;
        this._isActive = true;

        this._postProcessing.passes.finalPass.material.uniforms.uGradientsAlpha.value = 1;

        this._components.spinner._sparks.alpha = 1;
        if (this._locale === 'en') {
            this._components.spinner.position.x = -1.1;
        } else {
            this._components.spinner.position.x = -4.1;
        }
        this._components.spinner.play();
        this._updatePostProcessing();

        this._timelineShow = new gsap.timeline();
        this._timelineShow.set(this._postProcessing.passes.hidePass.material, { progress: 1 }, 0.1);
        this._timelineShow.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.36 }, 1);
        this._timelineShow.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.19 }, 1);

        // this._createScrollTriggers();
        if (this._nuxtRoot.scrollManager) {
            this._nuxtRoot.scrollManager.addEventListener('scroll', this._scrollHandler);
        }
        return this._timelineShow;
    }

    hide(onCompleteCallback) {
        if (this._timelineShow) this._timelineShow.kill();

        this._timelineHide = new gsap.timeline({ onComplete: this._timelineHideCompleteHandler, onCompleteParams: [onCompleteCallback] });
        this._timelineHide.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0 }, 0);
        this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);
        this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 1, { value: 0 }, 0);
        this._timelineHide.call(
            () => {
                this._reset();
            },
            null,
            1
        );
        this._timelineHide.call(
            () => {
                this._isActive = false;
            },
            null,
            1.1
        );

        if (this._nuxtRoot.scrollManager) {
            this._nuxtRoot.scrollManager.removeEventListener('scroll', this._scrollHandler);
        }
        return this._timelineHide;
    }

    focus() {}

    unfocus() {}

    goto(index, direction, done) {
        this._goto(index, direction);
    }

    /**
     * Private
     */
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
        this.position.x = 1.38;
    }

    _position() {
        if (Breakpoints.active('small')) {
            this.position.x = 0.92;
            this.position.y = -1.11;
            this.position.z = -13.48;
        } else {
            this.position.x = 1.38;
            this.position.y = -1.01;
        }
    }

    _createCamera() {
        const camera = new PerspectiveCamera(30, 1, 0.1, 10000);
        camera.position.z = 9.34;
        camera.position.y = 1.24;
        camera.lookAt(this._cameraTarget);

        if (this._debugGui) {
            const debug = this._debugGui.addFolder('Camera');
            debug.add(camera.position, 'x', -50, 50, 0.01).onChange(() => {
                camera.lookAt(this._cameraTarget);
            });
            debug.add(camera.position, 'z', -50, 50, 0.01).onChange(() => {
                camera.lookAt(this._cameraTarget);
            });
            debug.add(camera.position, 'y', -50, 50, 0.01).onChange(() => {
                camera.lookAt(this._cameraTarget);
            });
        }

        return camera;
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

    _createScrollTriggers() {
        if (Breakpoints.active('small') || !this._nuxtRoot.scrollManager) return;

        const sectionsInfo = this._nuxtRoot.sectionsInfo;
        const section1 = sectionsInfo[0];
        const section2 = sectionsInfo[1];
        const section3 = sectionsInfo[2];
        const section4 = sectionsInfo[3];
        const section5 = sectionsInfo[4];
        const section8 = sectionsInfo[7];

        this._scrollTriggersTimeline = new gsap.timeline({ paused: true });

        // Section 2
        this._scrollTriggersTimeline.set(
            this._scrollContainer,
            {
                alpha: 1,
            },
            0
        );

        this._scrollTriggersTimeline.fromTo(
            this.position,
            section2.dimensions.height * 2,
            {
                x: 1.38,
            },
            {
                x: -1.5,
                ease: 'power1.inOut',
            },
            section2.position.y * 1.1
        );

        // this._scrollTriggersTimeline.fromTo(
        //     this._camera.position,
        //     section2.dimensions.height * 1.7,
        //     {
        //         y: 1.24,
        //     },
        //     {
        //         y: 0.4,
        //         ease: 'power1.inOut',
        //     },
        //     section2.position.y + section2.dimensions.height * 0.7
        // );

        // this._scrollTriggersTimeline.set(
        //     this._scrollContainer,
        //     {
        //         alpha: 0,
        //     },
        //     section3.position.y + WindowResizeObserver.height
        // );

        // // Section 4
        // this._scrollTriggersTimeline.set(
        //     this.position,
        //     {
        //         x: -6,
        //     },
        //     section4.position.y
        // );

        // this._scrollTriggersTimeline.set(
        //     this._camera.position,
        //     {
        //         y: 1.24,
        //     },
        //     section4.position.y
        // );

        // this._scrollTriggersTimeline.fromTo(
        //     this._scrollContainer,
        //     500,
        //     {
        //         alpha: 0,
        //     },
        //     {
        //         alpha: 1,
        //         ease: 'sine.inOut',
        //     },
        //     section4.position.y + section4.dimensions.height * 0.1
        // );

        // this._scrollTriggersTimeline.to(
        //     this.position,
        //     600,
        //     {
        //         x: -2,
        //         ease: 'power1.inOut',
        //     },
        //     section4.position.y + section4.dimensions.height * 0.1
        // );

        // this._scrollTriggersTimeline.fromTo(
        //     this._camera.position,
        //     section4.dimensions.height + section5.dimensions.height,
        //     {
        //         y: 1.24,
        //     },
        //     {
        //         y: -2,
        //         ease: 'power1.in',
        //     },
        //     section4.position.y + section4.dimensions.height * 0.1
        // );

        // this._scrollTriggersTimeline.to(
        //     this._scrollContainer,
        //     500,
        //     {
        //         alpha: 0,
        //         ease: 'sine.inOut',
        //     },
        //     section4.position.y + section4.dimensions.height + section5.dimensions.height * 0.5
        // );

        // // Section 8
        // this._scrollTriggersTimeline.set(
        //     this.position,
        //     {
        //         x: -6,
        //     },
        //     section8.position.y
        // );

        // this._scrollTriggersTimeline.set(
        //     this._camera.position,
        //     {
        //         y: 1.24,
        //     },
        //     section8.position.y
        // );

        // this._scrollTriggersTimeline.fromTo(
        //     this._scrollContainer,
        //     500,
        //     {
        //         alpha: 0,
        //     },
        //     {
        //         alpha: 1,
        //         ease: 'sine.inOut',
        //     },
        //     section8.position.y + section8.dimensions.height * 0.3
        // );

        // this._scrollTriggersTimeline.to(
        //     this.position,
        //     600,
        //     {
        //         x: -2.3,
        //         ease: 'power1.inOut',
        //     },
        //     section8.position.y + section8.dimensions.height * 0.3
        // );

        // this._scrollTriggersTimeline.fromTo(
        //     this._camera.position,
        //     section8.dimensions.height,
        //     {
        //         y: 1.24,
        //     },
        //     {
        //         y: -1.8,
        //         ease: 'power1.in',
        //     },
        //     section8.position.y + section8.dimensions.height * 0.9
        // );
    }

    _updateScrollTriggersTimeline() {
        // if (!this._scrollTriggersTimeline) return;
        // this._scrollTriggersTime = math.lerp(this._scrollTriggersTime, this._scrollPosition.y + WindowResizeObserver.height, 0.1);
        // this._scrollTriggersTimeline.time(this._scrollTriggersTime);

        const sectionsInfo = this._nuxtRoot.sectionsInfo;
        const section1 = sectionsInfo[0];
        const section2 = sectionsInfo[1];
        const section3 = sectionsInfo[2];
        const section4 = sectionsInfo[3];
        const section5 = sectionsInfo[4];
        const section8 = sectionsInfo[7];

        const y = this._scrollPosition.y + WindowResizeObserver.height;

        // this._scrollTriggersTimeline.fromTo(
        //     this.position,
        //     section2.dimensions.height * 2,
        //     {
        //         x: 1.38,
        //     },
        //     {
        //         x: -1.5,
        //         ease: 'power1.inOut',
        //     },
        //     section2.position.y * 1.1
        // );

        if (!this._section1Trigger && y > section2.position.y + 200) {
            this._section1Trigger = true;

            gsap.to(this.position, 1, {
                x: -1.5,
                ease: 'power2.inOut',
            });
        }

        if (this._section1Trigger && y < section2.position.y + 150) {
            this._section1Trigger = false;

            gsap.to(this.position, 1, {
                x: 1.38,
                ease: 'power2.inOut',
            });
        }
    }

    /**
     * Components
     */
    _createComponents() {
        const components = {};
        components.spinner = this._createComponentSpinner();
        components.floor = this._createComponentFloor();
        return components;
    }

    _createComponentSpinner() {
        const spinner = new Spinner({
            debugGui: this._debugGui,
            renderer: this._renderer,
        });
        this._container.add(spinner);
        // console.log('spinner:', spinner)
        return spinner;
    }

    _createComponentFloor() {
        const floor = new FloorAbout({
            debugGui: this._debugGui,
            width: 200,
            height: 200,
            renderer: this._renderer,
        });
        this._container.add(floor);
        return floor;
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
        if (this._isActive && !Breakpoints.active('small')) this._createScrollTriggers();
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
        const folder = folderBackground.addFolder('Scene: About');
        folder.updateTitleBackgroundColor('#1b263b');
        // folder.open();

        const folderPosition = folder.addFolder('Position');
        folderPosition.add(this.position, 'x', -150, 150, 0.01);
        folderPosition.add(this.position, 'y', -150, 150, 0.01);
        folderPosition.add(this.position, 'z', -1000, 1000, 0.01);

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

    _scrollHandler(e) {
        this._scrollPosition.x = e.x;
        this._scrollPosition.y = e.y;
    }

    _timelineHideCompleteHandler(onCompleteCallback) {
        onCompleteCallback();
        this._isActive = false;
        this._components.spinner.reset();
    }
}
