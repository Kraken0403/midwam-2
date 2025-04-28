// Vendor
import gsap from 'gsap';
import CustomEase from '@/vendor/gsap/CustomEase';
import { Scene, Fog, AxesHelper } from 'three';
import * as THREE from 'three';

import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import AudioManager from '@/utils/AudioManager';
import math from '@/utils/math';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Objects
import Cameras from '@/webgl/objects/HomeCameras';
import CameraAnimation, { DEFAULT_CAMERA_FOV, TARGET_CAMERA_FOV } from '@/webgl/objects/HomeCameraAnimation';
import HomeSectionManager from '@/webgl/objects/HomeSectionManager';

// Components
// import Human from '@/webgl/components/Human';
import Spinner from '@/webgl/components/SpinnerHome';
import Shapes from '@/webgl/components/Shapes';
import Floor from '@/webgl/components/Floor';
import Landscapes from '@/webgl/components/Landscapes';
import Lights from '@/webgl/components/Lights';

export default class Home extends component(Scene) {
    init({ renderer, nuxtRoot, postProcessing, debug }) {
        // Props
        this._renderer = renderer;
        this._nuxtRoot = nuxtRoot;
        this._postProcessing = postProcessing;
        this._debug = debug;

        // Flags
        this._isActive = false;

        // Analytics
        this._maximumReachedStep = 0;
        this._clickedAndHoldSectionsId = [];

        // Data
        // this._fog = this._createFog();
        this._activeLandscapeIndex = 0;
        this._currentSectionIndex = 0;
        this._currentFocusIndex = null;
        this._tweenParams = {
            bloomStrength: 1,
            bloomStrengthIntensity: 1,
        };
        this._debugGui = this._createDebugGui();
        this._cameras = this._createCameras();
        this._reflectiveMaterial = this._createReflectiveMaterial();
        this._components = this._createComponents();
        this._cameraAnimation = this._createCameraAnimation();

        // const axesHelper = new AxesHelper(50);
        // this.add(axesHelper);

        this._bindHandlers();

        // Section functions
        Object.assign(this, HomeSectionManager);

        // setTimeout(() => {
        //     this.goto(6, 1, null);
        // }, 2000);
    }

    destroy() {
        super.destroy();
    }

    /**
     * Getters
     */
    get camera() {
        return this._cameras.active;
    }

    get cameraAnimation() {
        return this._cameraAnimation;
    }

    /**
     * Triggers
     */
    // onUpdate({ time, delta }) {
    //     if (this._isActive) this._updateComponents({ time, delta });
    // }

    onUpdate({ time, delta }) {
        if (!this._isActive) return;
      
        this._updateComponents({ time, delta });
      
        const scrollY = this._nuxtRoot.scrollManager ? this._nuxtRoot.scrollManager.position.y : 0;
        const totalHeight = this._nuxtRoot.scrollManager ? this._nuxtRoot.scrollManager.limit : 1;
        const scrollProgress = scrollY / totalHeight;
      
        if (this._scrollTimeline) {
          this._scrollTimeline.progress(scrollProgress);
        }
      }
      
      
    

    goto(index, direction, done) {
        this._isCameraAnimation = true;
        // if (this._timelineFocus) this._timelineFocus.kill();
        // if (this._timelineUnfocus) this._timelineUnfocus.kill();
        // this._goto(index, direction);
        // this._cameraAnimation.goto(index, direction, () => {
        //     this._isCameraAnimation = false;
        //     if (done) done();
        // });
        this._trackScrollEvent(index);
    }

    /**
     * Public
     */
    // show() {
    //     this._isActive = true;
    //     this._reset();
    //     this._updatePostProcessing();

    //     this.showLandscape(0);

    //     this._timelineShow = new gsap.timeline();
    //     this._timelineShow.set(this._reflectiveMaterial, { envMapIntensity: 0.22 }, 0);
    //     this._timelineShow.fromTo(this._postProcessing.passes.hidePass.material, 3, { progress: 0 }, { progress: 1, ease: 'power1.inOut' }, 0);
    //     this._timelineShow.to(this._postProcessing.passes.bloomPass, 0, { strength: 0.83, ease: 'power1.inOut' }, 0);
    //     this._timelineShow.to(this._postProcessing.passes.bloomPass, 0, { radius: 1.37, ease: 'power1.inOut' }, 0);
    //     // this._timelineShow.fromTo(this._reflectiveMaterial, 5, { envMapIntensity: 0 }, { envMapIntensity: 0.22, ease: 'sine.inOut' }, 0);
    //     return this._timelineShow;
    // }

    show() {
        this._isActive = true;
        this._reset();
        this._updatePostProcessing();
      
        if (this._nuxtRoot.scrollManager) {
          this._nuxtRoot.scrollManager.addEventListener('scroll', this._scrollHandler);
        }
      
        this._scrollTimeline = gsap.timeline({ paused: true });
      
        this._scrollTimeline.to(this._camera.position, {
          y: 1.2, // lower camera
          z: 8,   // push camera back
          ease: "power2.inOut",
          duration: 1,
          onUpdate: () => {
            this._camera.lookAt(0, 0, 0);
          },
        }, 0);
      
        return this._timelineShow;
      }      

    hide(onCompleteCallback) {
        if (this._timelineShow) this._timelineShow.kill();

        // this._timelineHide = new gsap.timeline({ onComplete: this._timelineHideCompleteHandler, onCompleteParams: [onCompleteCallback] });
        // this._timelineHide.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0, ease: 'sine.inOut' }, 0);
        // this._timelineHide.to(this._postProcessing.passes.bloomPass, 0.7, { strength: 0, ease: 'sine.inOut' }, 0);
        // this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0, ease: 'sine.inOut' }, 0);
        // this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 1, { value: 0, ease: 'sine.inOut' }, 0);
        // this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uBottomGradientStrength, 1, { value: 0, ease: 'sine.inOut' }, 0);
        return this._timelineHide;
    }

    focus(sectionIndex) {
        // if (this._isCameraAnimation) return;

        // this._currentFocusIndex = sectionIndex;

        // // if (sectionIndex <= 6) {
        // //     if (this._nuxtRoot.customCursor) {
        // //         this._nuxtRoot.customCursor.clickAndHold();
        // //     }
        // // }

        // if (this._timelineUnfocus) this._timelineUnfocus.kill();
        // if (this._timelineFocus) this._timelineFocus.kill();
        // this._timelineFocus = new gsap.timeline({ onComplete: this._timelineFocusCompleteHandler });

        // if (sectionIndex === 0) {
        //     this._timelineFocus.to(this._reflectiveMaterial, 2, { envMapRotationZSpeed: 0.015 }, 0);
        //     this._timelineFocus.to(this._reflectiveMaterial, 2, { envMapIntensity: 0.33, ease: 'sine.inOut' }, 0);
        //     // this._timelineFocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 1 }, 0);
        //     // this._timelineFocus.to(this._postProcessing.passes.bloomPass, 2, { strength: 1 }, 0);
        // }

        // if (sectionIndex === 1) {
        //     this._timelineFocus.to(this._cameraAnimation.zoomContainer.position, 2, { z: 3.24, ease: 'power1.out' }, 0);
        //     this._timelineFocus.to(this._reflectiveMaterial, 1.5, { envMapRotationZSpeed: 0.094, ease: 'power1.inOut' }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0.91 }, 0);
        //     this._timelineFocus.to(this._components.shapes, 1, { opacity: 0 }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.bloomPass, 2, { strength: 1 }, 0);
        // }

        // if (sectionIndex === 2) {
        //     this._timelineFocus.to(this._cameraAnimation.zoomContainer.position, 2, { z: 1.4 }, 0);
        //     this._timelineFocus.to(this._tweenHeartBeat, 0.8, { timeScale: 1.9 }, 0);
        //     this._timelineFocus.to(this._tweenParams, 0.8, { bloomStrengthIntensity: 1.3 }, 0);
        //     this._timelineFocus.to(this._renderer, 0.8, { toneMappingExposure: 0.15 }, 0);

        //     this._timelineFocus.to(this._reflectiveMaterial, 1.5, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0.94 }, 0);
        // }

        // // Legs
        // if (sectionIndex === 3) {
        //     this._timelineFocus.to(this._components.spinner, 2, { sparksSpeed: 2 }, 0);
        //     this._timelineFocus.to(this._cameraAnimation.zoomContainer.position, 2, { z: -1 }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.hologramPass.material.uniforms.uStrengthMinAmplitude, 2, { value: 0.5 }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.hologramPass.material.uniforms.uLineOffsetMaxAmplitude, 2, { value: 14.53 }, 0);

        //     this._timelineFocus.to(this._reflectiveMaterial, 1.5, { envMapRotationZSpeed: 0.015, ease: 'power1.inOut' }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0.93 }, 0);
        // }

        // if (sectionIndex === 4 || sectionIndex === 5) {
        //     this._timelineFocus.to(this._cameraAnimation.zoomContainer.position, 2, { z: 1 }, 0);
        //     this._timelineFocus.to(this._components.spinner, 2, { rotationSpeed: 200 }, 0);
        //     this._timelineFocus.to(this._components.spinner, 2, { sparksSpeed: 2 }, 0);
        //     this._timelineFocus.to(this._components.spinner, 4, { emissiveIntensity: 0.8 }, 0);
        //     this._timelineFocus.to(this._cameraAnimation.wiggle, 2, { progress: 1 }, 0);

        //     this._timelineFocus.to(this._reflectiveMaterial, 1.5, { envMapRotationZSpeed: 0.03, ease: 'power1.inOut' }, 0);
        //     this._timelineFocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0.86 }, 0);

        //     AudioManager.playEffect('energy');
        // }

        // if (sectionIndex === 6) {
        //     this.isHideLandscapeComplete = false;
        //     this._forceLandscapeTransition = false;
        //     this._timelineFocus.call(
        //         () => {
        //             this._forceLandscapeTransition = true;
        //         },
        //         null,
        //         0.4
        //     );
        //     this._timelineFocus.to(this._cameraAnimation.zoomContainer.position, 1.5, { z: 75, ease: 'power2.out' }, 0);
        //     this._timelineFocus.call(
        //         () => {
        //             this.hideLandscape(() => {
        //                 this.isHideLandscapeComplete = true;
        //                 this.gotoNextLandscape();
        //             });
        //         },
        //         null,
        //         0
        //     );
        //     this._timelineFocus.to(this._cameraAnimation.zoomContainer.position, 2, { z: 0, ease: 'power2.out' }, 0.77);
        // }

        // // Analytics
        // // if (this._clickedAndHoldSectionsId.includes(sectionIndex)) return;
        // // this._clickedAndHoldSectionsId.push(sectionIndex);
        // // this._nuxtRoot.$ga.event({
        // //     eventCategory: 'click and hold',
        // //     eventAction: `Click and hold on section : ${sectionIndex}`,
        // // });
    }

    unfocus() {
        // if (this._isCameraAnimation) return;

        // if (!this._forceLandscapeTransition) {
        //     if (this._timelineFocus) this._timelineFocus.kill();
        // }

        // this._timelineUnfocus = new gsap.timeline();

        // // if (this._currentFocusIndex <= 6) {
        // //     if (this._nuxtRoot.customCursor) {
        // //         this._nuxtRoot.customCursor.stopClickAndHold();
        // //     }
        // // }

        // this._timelineUnfocus.to(this._postProcessing.passes.hologramPass.material.uniforms.uStrengthMinAmplitude, 2, { value: 0.07 }, 0);
        // this._timelineUnfocus.to(this._postProcessing.passes.hologramPass.material.uniforms.uLineOffsetMaxAmplitude, 2, { value: 3.8 }, 0);

        // if (this._currentFocusIndex === 0) {
        //     this._timelineUnfocus.to(this._reflectiveMaterial, 1.3, { envMapIntensity: 0.22, ease: 'sine.inOut' }, 0);
        //     // this._timelineUnfocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 5, { value: 0, ease: 'power4.in' }, 0);
        //     this._timelineUnfocus.to(this._reflectiveMaterial, 2.2, { envMapRotationZSpeed: 0.0024, ease: 'power3.out' }, 0);
        // }

        // if (this._currentFocusIndex === 1) {
        //     this._timelineUnfocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0 }, 0);
        //     this._timelineUnfocus.to(this._reflectiveMaterial, 1.5, { envMapRotationZSpeed: 0.0024 }, 0);
        // }

        // if (this._currentFocusIndex === 1 || this._currentFocusIndex === 0) {
        //     this._timelineUnfocus.to(this._cameraAnimation.zoomContainer.position, 1.5, { z: 0, ease: 'power2.out' }, 0);
        //     this._timelineUnfocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0 }, 0);
        //     this._timelineUnfocus.to(this._components.shapes, 1, { opacity: 1 }, 0);
        //     this._timelineUnfocus.to(this._tweenParams, 0.5, { bloomStrengthIntensity: 1 }, 0);
        //     this._timelineUnfocus.to(this._postProcessing.passes.bloomPass, 2, { strength: 0.42 }, 0);
        // }

        // if (this._currentFocusIndex === 2) {
        //     this._timelineUnfocus.to(this._cameraAnimation.zoomContainer.position, 1, { z: 0 }, 0);
        //     this._timelineUnfocus.to(this._tweenHeartBeat, 0.5, { timeScale: 1 }, 0);
        //     this._timelineUnfocus.to(this._tweenParams, 0.5, { bloomStrengthIntensity: 1 }, 0);
        //     this._timelineUnfocus.to(this._renderer, 0.5, { toneMappingExposure: 0.4 }, 0);

        //     this._timelineUnfocus.to(this._reflectiveMaterial, 2.2, { envMapRotationZSpeed: 0.0024, ease: 'power3.out' }, 0);
        //     this._timelineUnfocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0 }, 0);
        // } else if (this._currentFocusIndex === 6) {
        //     if (!this._forceLandscapeTransition) {
        //         this._timelineUnfocus.to(this._cameraAnimation.zoomContainer.position, 2, { z: 0 }, 0);
        //         this._timelineUnfocus.call(
        //             () => {
        //                 if (!this.isHideLandscapeComplete) {
        //                     this.cancelHideLandscape();
        //                 }
        //             },
        //             null,
        //             0
        //         );
        //     }
        // } else {
        //     this._timelineUnfocus.to(this._cameraAnimation.zoomContainer.position, 1, { z: 0 }, 0);
        //     this._timelineUnfocus.to(this._components.spinner, 1, { rotationSpeed: 1 }, 0);
        //     this._timelineUnfocus.to(this._components.spinner, 1, { sparksSpeed: 0.5 }, 0);
        //     this._timelineUnfocus.to(this._components.spinner, 2.5, { emissiveIntensity: 0, ease: 'power4.out' }, 0);
        //     this._timelineUnfocus.to(this._cameraAnimation.wiggle, 2, { progress: 0 }, 0);

        //     this._timelineUnfocus.to(this._reflectiveMaterial, 2.2, { envMapRotationZSpeed: 0.0024, ease: 'power3.out' }, 0);
        //     this._timelineUnfocus.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0 }, 0);
        //     AudioManager.stopEffect('energy');
        // }
    }

    showLandscape(index) {
        this._components.landscapes.show(index);
        if (this._nuxtRoot.customCursor) {
            this._nuxtRoot.customCursor.updateLandscapeIcon(index);
        }
    }

    hideLandscape(completeCallback) {
        this._components.landscapes.hide(completeCallback);
    }

    cancelHideLandscape() {
        this._components.landscapes.cancelHide();
    }

    gotoNextLandscape() {
        const nextIndex = math.modulo(this._activeLandscapeIndex + 1, 3);
        this._activeLandscapeIndex = nextIndex;
        this.showLandscape(this._activeLandscapeIndex);
        // this.$refs.navigationDots.goto(this.activeLandscapeIndex);
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._timelineHideCompleteHandler = this._timelineHideCompleteHandler.bind(this);
        this._timelineFocusCompleteHandler = this._timelineFocusCompleteHandler.bind(this);
    }

    _createCameras() {
        const cameras = new Cameras({
            debugGui: this._debugGui,
            renderer: this._renderer,
            debug: this._debug,
            scene: this,
        });

      
        return cameras;
    }

    _createCameraAnimation() {
        const cameraAnimation = new CameraAnimation({
            scene: this,
            camera: this._cameras.main,
            postProcessing: this._postProcessing,
            components: this._components,
            reflectiveMaterial: this._reflectiveMaterial,
        });

      

        return cameraAnimation;
    }

    _createFog() {
        const fog = new Fog('#000000', 47, 117);
        // this._scene.fog = fog;
        return fog;
    }

    _createReflectiveMaterial() {
        const material = new ReflectiveMaterial(
            {
                renderer: this._renderer,
                debugGui: this._debugGui,
                normalNoiseStrength: 0.92,
            },
            {
                color: 0x888888,
                emissive: 0xf75c0b,
                emissiveIntensity: 0,
                roughness: 0.29,
                metalness: 1,
            }
        );
        return material;
    }

    _updatePostProcessing() {
        // Bloom
        this._postProcessing.passes.bloomPass.threshold = 0;
        this._postProcessing.passes.bloomPass.strength = 0;
        this._postProcessing.passes.bloomPass.radius = 0;

        // Gradients
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength.value = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength.value = 0;

        // Renderer
        this._renderer.toneMappingExposure = 2;

        //  Landscape settings
        // this._postProcessing.passes.bloomPass.threshold = 0.11;
        // this._postProcessing.passes.bloomPass.strength = 0.72;
        // this._postProcessing.passes.bloomPass.radius = 0.89;
    }

    _reset() {
 
        this._resetSectionTimelines();
        this._currentSectionIndex = 0;
        this._cameraAnimation.reset();
        // this._components.human.heart.material.uniforms.uAlpha.value = 0;
        this._reflectiveMaterial.envMapIntensity = 0.22;
        this._reflectiveMaterial.userData.uniforms.uNormalNoiseStrength.value = 0.92;
        this._reflectiveMaterial.blendColorStrength = 0;
        this._postProcessing.passes.hologramPass.material.progress = 0;
        // this._postProcessing.passes.landscapes.enabled = false;
        this._postProcessing.passes.hologramPass.enabled = false;
        this._postProcessing.passes.finalPass.material.uniforms.uGradientsAlpha.value = 1;
        this._postProcessing.passes.finalPass.material.uniforms.uBottomGradientStrength.value = 0;
        // this._components.floor._mesh.material.uniforms.uMipStrength.value = 0.58;
        this._components.landscapes.scanDistance = 0;
        this._components.spinner.reset();
        // this._components.human.scale.set(1, 1, 1);
        this._components.spinner.scale.set(1, 1, 1);
        this._components.shapes.visible = true;
        this._components.landscapes.visible = false;
        this._components.floor.visible = false;
        this._renderer.setClearColor(0x0f0d10);
        if (this._tweenHeartBeat) this._tweenHeartBeat.pause();
    }

    /**
     * Components
     */
    _createComponents() {
        const components = {};
        // components.human = this._createComponentHuman();
        components.spinner = this._createComponentSpinner();
        components.shapes = this._createComponentShapes();
        components.floor = this._createComponentFloor();
        components.landscapes = this._createComponentLandscapes();
        // components.lights = this._createComponentLights();
        return components;
    }

    _createComponentHuman() {
        const human = new Human({
            debugGui: this._debugGui,
            material: this._reflectiveMaterial,
        });
        human.position.x = -0.2;
        // this.add(human);
        return human;
    }

    _createComponentSpinner() {
        const spinner = new Spinner({
            debugGui: this._debugGui,
            renderer: this._renderer,
            material: this._reflectiveMaterial,
        });
        this.add(spinner);
        console.log(spinner)
        return spinner;

        // const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        // const material = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // bright pink
        // const spinner = new THREE.Mesh(geometry, material);
    
        // spinner.position.set(0, 0, 0);
        // spinner.visible = true;
        // this.add(spinner);
    
        // return spinner;
    }

    _createComponentShapes() {
        const shapes = new Shapes({
            debugGui: this._debugGui,
            camera: this._cameras.active,
            orbitControls: this._controls,
            renderer: this._renderer,
        });
        // this.add(shapes);
        return shapes;
    }

    _createComponentFloor() {
        const floor = new Floor({
            debugGui: this._debugGui,
            renderer: this._renderer,
        });
        // floor.position.z = 400;
        // floor.position.x = -800;
        this.add(floor);
        return floor;
    }

    _createComponentLandscapes() {
        const landscapes = new Landscapes({
            debugGui: this._debugGui,
            renderer: this._renderer,
            cameras: this._cameras,
        });
        this.add(landscapes);
        this._postProcessing.addLayer('landscapes', landscapes);
        return landscapes;
    }

    // _createComponentLights() {
    //     const lights = new Lights({
    //         debugGui: this._debugGui,
    //     });
    //     this.add(lights);
    //     return lights;
    // }

    _updateComponents({ time, delta }) {
        let component;
        for (const key in this._components) {
            component = this._components[key];
            if (typeof component.update === 'function') {
                component.update({ time, delta });
            }
        }
    }

    _trackScrollEvent(index) {
        const maxReachedStep = index > this._maximumReachedStep ? index : this._maximumReachedStep;
        if (this._maximumReachedStep === maxReachedStep) return;
        this._maximumReachedStep = maxReachedStep;
        this._nuxtRoot.$ga.event({
            eventCategory: 'home steps',
            eventAction: `Reached Step ${maxReachedStep}`,
        });
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const _this = this;
        const custom = {
            next() {
                _this.goto(_this._currentSectionIndex + 1, 1, null);
            },
            previous() {
                _this.goto(_this._currentSectionIndex - 1, -1, null);
            },
        };

        const folderBackground = gui.getFolder('Background');
        const folder = folderBackground.addFolder('Scene: Home');
        folder.updateTitleBackgroundColor('#0d1b2a');
        folder.open();

        folder.add(custom, 'next');
        folder.add(custom, 'previous');

        return folder;
    }

    /**
     * Handlers
     */
    _timelineHideCompleteHandler(onCompleteCallback) {
        onCompleteCallback();
        this._isActive = false;
        this._components.spinner.reset();
        this._reset();
    }

    _timelineFocusCompleteHandler() {
        this._forceLandscapeTransition = false;
    }
}
