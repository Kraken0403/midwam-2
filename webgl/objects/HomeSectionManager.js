// Vendor
import gsap from 'gsap';

// Utils
// import AudioManager from '@/utils/AudioManager';
import { Color } from 'three';

export default {
    _goto(index, direction) {
        const previousIndex = this._currentSectionIndex;
        switch (previousIndex) {
            case 0:
                this._hideSection0(direction);
                break;
            case 1:
                this._hideSection1(direction);
                break;
            case 2:
                this._hideSection2(direction);
                break;
            case 3:
                this._hideSection3(direction);
                break;
            case 4:
                this._hideSection4(direction);
                break;
            case 6:
                this._hideSection6(direction);
                break;
        }

        this._currentSectionIndex = index;
        switch (this._currentSectionIndex) {
            case 0:
                this._showSection0(direction);
                break;
            case 1:
                this._showSection1(direction);
                break;
            case 2:
                this._showSection2(direction);
                break;
            case 3:
                this._showSection3(direction);
                break;
            case 4:
                this._showSection4(direction);
                break;
            case 5:
                this._showSection5(direction);
                break;
            case 6:
                this._showSection6(direction);
                break;
        }
    },

    _resetSectionTimelines() {
        if (this._timelineSection0Show) this._timelineSection0Show.kill();
        if (this._timelineSection0Hide) this._timelineSection0Hide.kill();
        if (this._timelineSection1Show) this._timelineSection1Show.kill();
        if (this._timelineSection1Hide) this._timelineSection1Hide.kill();
        if (this._timelineSection2Show) this._timelineSection2Show.kill();
        if (this._timelineSection2Hide) this._timelineSection2Hide.kill();
        if (this._timelineSection3Show) this._timelineSection3Show.kill();
        if (this._timelineSection3Hide) this._timelineSection3Hide.kill();
        if (this._timelineSection4Show) this._timelineSection4Show.kill();
        if (this._timelineSection4Hide) this._timelineSection4Hide.kill();
        if (this._timelineSection5Show) this._timelineSection5Show.kill();
        if (this._timelineSection5Hide) this._timelineSection5Hide.kill();
        if (this._timelineSection6Show) this._timelineSection6Show.kill();
        if (this._timelineSection6Hide) this._timelineSection6Hide.kill();
    },

    /**
     * Section 0
     */
    _showSection0() {
        // Audio
        // AudioManager.play('background-loop-1', {
        //     loop: true,
        // });

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animation
        this._timelineSection0Show = new gsap.timeline();
        this._timelineSection0Show.to(this._reflectiveMaterial, 2, { envMapIntensity: 0.22, ease: 'sine.inOut' }, 1.2);
        this._timelineSection0Show.to(this._reflectiveMaterial.userData.uniforms.uNormalNoiseStrength, 2, { value: 0.92, ease: 'sine.inOut' }, 1.8);
        this._timelineSection0Show.to(this._postProcessing.passes.bloomPass, 2, { threshold: 0, ease: 'sine.inOut' }, 1.5);
        this._timelineSection0Show.to(this._postProcessing.passes.bloomPass, 2, { strength: 0.83, ease: 'sine.inOut' }, 1.5);
        this._timelineSection0Show.to(this._postProcessing.passes.bloomPass, 2, { radius: 1.37, ease: 'sine.inOut' }, 1.5);
        this._timelineSection0Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0 }, 1);
        if (this._nuxtRoot.customCursor) this._timelineSection0Show.call(this._nuxtRoot.customCursor.showIconA, null, 2.5);
    },

    _hideSection0() {
        // Animation
        this._timelineSection0Hide = new gsap.timeline();
        this._timelineSection0Hide.to(this._reflectiveMaterial, 2, { envMapIntensity: 1, ease: 'sine.inOut' }, 0);
        this._timelineSection0Hide.to(this._reflectiveMaterial.userData.uniforms.uNormalNoiseStrength, 2, { value: 0, ease: 'sine.inOut' }, 1);
        this._timelineSection0Hide.to(this._postProcessing.passes.bloomPass, 1.3, { threshold: 0.1, ease: 'sine.inOut' }, 0);
        this._timelineSection0Hide.to(this._postProcessing.passes.bloomPass, 1.3, { strength: 0.42, ease: 'sine.inOut' }, 0);
        this._timelineSection0Hide.to(this._postProcessing.passes.bloomPass, 1.3, { radius: 0.58, ease: 'sine.inOut' }, 0);
    },

    /**
     * Section 1
     */
    _showSection1(direction) {
        // Audio
        // if (direction > 0) {
        //     AudioManager.playEffect('transition');
        // }

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animation
        this._timelineSection1Show = new gsap.timeline();
        this._timelineSection1Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 48 / 255, g: 33 / 255, b: 97 / 255 }, 0);
        this._timelineSection1Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 0.79, y: 0.94 }, 0);
        this._timelineSection1Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 1.29 }, 0);
        this._timelineSection1Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.24 }, 0);
        this._timelineSection1Show.to(this._renderer, 2, { toneMappingExposure: 2 }, 0);

        if (this._nuxtRoot.customCursor) this._timelineSection1Show.call(this._nuxtRoot.customCursor.showIconB, null, direction > 0 ? 2.8 : 0.8);
    },

    _hideSection1() {
        // this._timelineSection1Hide = new gsap.timeline();
    },

    /**
     * Section 2
     */
    _showSection2(direction) {
        // Audio
        // AudioManager.play('background-loop-1', {
        //     loop: true,
        // });

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animations
        if (this._tweenHeartBeat) this._tweenHeartBeat.kill();
        this._tweenHeartBeat = gsap.fromTo(
            this._tweenParams,
            1.5,
            { bloomStrength: 0.42 },
            {
                bloomStrength: 0.75,
                paused: true,
                repeat: -1,
                yoyo: true,
                onUpdate: () => {
                    this._postProcessing.passes.bloomPass.strength = this._tweenParams.bloomStrength * this._tweenParams.bloomStrengthIntensity;
                },
            },
            1
        );

        const params = {
            clearColor: this._renderer.getClearColor().getHex(),
            clearAlpha: 1,
        };

        if (this._timelineSection0Show) this._timelineSection0Show.kill();
        if (this._timelineSection1Show) this._timelineSection1Show.kill();
        if (this._timelineSection2Show) this._timelineSection2Show.kill();
        if (this._timelineSection0Hide) this._timelineSection0Hide.kill();
        if (this._timelineSection2Hide) this._timelineSection2Hide.kill();

        this._timelineSection2Show = new gsap.timeline();

        // this._timelineSection2Show.to(this._components.human.heart.material.uniforms.uAlpha, 2, { value: 0.52, ease: 'sine.inOut' }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.bloomPass, 1, { threshold: 0, ease: 'sine.inOut' }, 0);
        this._timelineSection2Show.to(this._postProcessing.passes.bloomPass, 1, { radius: 0.16, ease: 'sine.inOut' }, 0);
        this._timelineSection2Show.to(
            params,
            1,
            {
                clearAlpha: 0,
                ease: 'sine.inOut',
                onUpdate: () => {
                    this._renderer.setClearAlpha(params.clearAlpha);
                },
            },
            0
        );
        this._timelineSection2Show.call(() => this._tweenHeartBeat.play(), null, 0.5);
        this._timelineSection2Show.to(this._renderer, 1, { toneMappingExposure: 0.4, ease: 'sine.inOut' }, 0);

        // Gradient 1
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 106 / 255, g: 54 / 255, b: 23 / 255 }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.15 }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 1, y: 0.74 }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 0.87 }, 0.5);

        // Gradient 2
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 22 / 255, g: 46 / 255, b: 143 / 255 }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.11 }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 0, y: 0 }, 0.5);
        this._timelineSection2Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 1 }, 0.5);

        // Camera
        this._timelineSection2Show.to(this._cameraAnimation, 2, { mouseRotationXOffset: 1.99 }, 0);
        this._timelineSection2Show.to(this._cameraAnimation, 2, { mouseRotationYOffset: 0.17 }, 0);

        if (this._nuxtRoot.customCursor) this._timelineSection2Show.call(this._nuxtRoot.customCursor.showIconD, null, direction > 0 ? 0.8 : 3);
    },

    _hideSection2(direction) {
        // Animations
        const params = {
            clearAlpha: this._renderer.getClearAlpha(),
        };

        if (this._tweenHeartBeat) this._tweenHeartBeat.kill();
        if (this._timelineSection2Show) this._timelineSection2Show.kill();
        this._timelineSection2Hide = new gsap.timeline();
        // this._timelineSection2Hide.to(this._components.human.heart.material.uniforms.uAlpha, 1, { value: 0, ease: 'sine.inOut' }, 0);
        this._timelineSection2Hide.to(this._postProcessing.passes.bloomPass, 1, { threshold: 0.1, ease: 'sine.inOut' }, 0.1);
        this._timelineSection2Hide.to(this._postProcessing.passes.bloomPass, 1.5, { strength: 0.42, ease: 'sine.inOut' }, 0);
        this._timelineSection2Hide.to(this._postProcessing.passes.bloomPass, 1.5, { radius: 0.58, ease: 'sine.inOut' }, 0);
        this._timelineSection2Hide.to(
            params,
            2,
            {
                clearAlpha: 1,
                ease: 'sine.inOut',
                onUpdate: () => {
                    this._renderer.setClearAlpha(params.clearAlpha);
                },
            },
            0
        );
    },

    /**
     * Section 3
     */
    _showSection3(direction) {
        // Audio
        // AudioManager.play('background-loop-1', {
        //     loop: true,
        // });

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animations
        const roughEase = "rough({ template: none.out, strength: 3, points: 20, taper: 'none', randomize: true, clamp: true})";
        this._timelineSection3Show = new gsap.timeline();
        this._timelineSection3Show.to(this._postProcessing.passes.hologramPass.material, 0.6, { ease: roughEase, progress: 1 }, 1);
        this._timelineSection3Show.add(this._components.spinner.showSparks(), 1);
        this._timelineSection3Show.to(this._renderer, 2, { toneMappingExposure: 1 }, 0);

        // Gradient 1
        this._timelineSection3Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0 }, 0.5);

        // Gradient 2
        this._timelineSection3Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0 }, 0.5);

        // Camera
        this._timelineSection3Show.to(this._cameraAnimation, 2, { mouseRotationXOffset: 0.78 }, 0);
        this._timelineSection3Show.to(this._cameraAnimation, 2, { mouseRotationYOffset: 0.11 }, 0);

        if (this._nuxtRoot.customCursor) this._timelineSection3Show.call(this._nuxtRoot.customCursor.showIconC, null, direction > 0 ? 2.8 : 1.1);

        this._postProcessing.passes.hologramPass.enabled = true;
        this._components.shapes.visible = true;
    },

    _hideSection3(direction) {
        // Animations
        const roughEase = "rough({ template: none.out, strength: 3, points: 20, taper: 'none', randomize: true, clamp: true})";
        this._timelineSection3Hide = new gsap.timeline({
            onComplete: () => {
                this._postProcessing.passes.hologramPass.enabled = false;
            },
        });
        if (direction > 0) {
            this._timelineSection3Hide.to(this._postProcessing.passes.hologramPass.material, 0.6, { ease: roughEase, progress: 0 }, 0.1);
        } else {
            this._timelineSection3Hide.to(this._postProcessing.passes.hologramPass.material, 0.6, { ease: roughEase, progress: 0 }, 0.7);
        }

        this._timelineSection3Hide.add(this._components.spinner.hideSparks(), 1);
    },

    /**
     * Section 4
     */
    _showSection4(direction) {
        // Audio
        // AudioManager.play('background-loop-2', {
        //     loop: true,
        // });

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animations
        this._components.shapes.visible = false;
        // this._postProcessing.passes.landscapes.enabled = false;

        this._timelineSection4Show = new gsap.timeline();
        this._timelineSection4Show.to(this._renderer, 2, { toneMappingExposure: 2 }, 0);
        // this._timelineSection4Show.to(this._postProcessing.passes.bloomPass, 2, { threshold: 0.15 }, 0);
        // this._timelineSection4Show.to(this._postProcessing.passes.bloomPass, 2, { strength: 0.71 }, 0);
        // this._timelineSection4Show.to(this._postProcessing.passes.bloomPass, 2, { radius: 0.05 }, 0);
        // this._timelineSection4Show.to(this._renderer, 2, { toneMappingExposure: 0.55 }, 0);

        // Gradient 2
        this._timelineSection4Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 46 / 255, g: 28 / 255, b: 129 / 255 }, 0.5);
        this._timelineSection4Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.16 }, 0.5);
        this._timelineSection4Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 0, y: 0.9 }, 0.5);
        this._timelineSection4Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 0.81 }, 0.5);

        this._timelineSection4Show.add(this._components.spinner.showSparks(), 3);

        // Camera
        this._timelineSection4Show.to(this._cameraAnimation, 2, { mouseRotationXOffset: 0.53 }, 0);
        this._timelineSection4Show.to(this._cameraAnimation, 2, { mouseRotationYOffset: 0.07 }, 0);

        if (this._nuxtRoot.customCursor) this._timelineSection4Show.call(this._nuxtRoot.customCursor.showIconE, null, direction > 0 ? 0.4 : 1.1);
    },

    _hideSection4() {
        this._timelineSection4Hide = new gsap.timeline();
        this._timelineSection4Hide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);
        //     this._timelineSection4Hide.to(this._postProcessing.passes.bloomPass, 2, { threshold: 0.1 }, 0);
        //     this._timelineSection4Hide.to(this._postProcessing.passes.bloomPass, 2, { strength: 0.67 }, 0);
        //     this._timelineSection4Hide.to(this._postProcessing.passes.bloomPass, 2, { radius: 0.58 }, 0);
        //     this._timelineSection4Hide.to(this._renderer, 2, { toneMappingExposure: 2 }, 0);
    },

    /**
     * Section 5
     */
    _showSection5(direction) {
        // Audio
        // AudioManager.play('background-loop-2', {
        //     loop: true,
        // });

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animations
        this._components.spinner.showSparks();
        // this._postProcessing.passes.landscapes.enabled = true;
        this._timelineSection5Show = new gsap.timeline();
        // this._timelineSection5Show.to(this._components.spinner.revealCircle, 4.5, { scanDistance: 0 }, 0);
        // this._timelineSection5Show.to(this._components.spinner.revealCircle, 4.5, { scanWidth: 0 }, 0);
        // this._timelineSection5Show.set(this._components.landscapes, { showReveal: true }, 0);

        // Gradient 1
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 46 / 255, g: 28 / 255, b: 129 / 255 }, 0);
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.15 }, 0);
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 1, y: 1 }, 0);
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 1.16 }, 0);

        // Gradient 2
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 143 / 255, g: 70 / 255, b: 22 / 255 }, 0);
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.09 }, 0);
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 0, y: 0 }, 0);
        this._timelineSection5Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 1 }, 0);

        // Camera
        this._timelineSection5Show.to(this._cameraAnimation, 2, { mouseRotationXOffset: 0.61 }, 0);
        this._timelineSection5Show.to(this._cameraAnimation, 2, { mouseRotationYOffset: 0.04 }, 0);

        this._timelineSection5Show.set(this._components.landscapes, { visible: true }, 2.1);

        if (this._nuxtRoot.customCursor) this._timelineSection5Show.call(this._nuxtRoot.customCursor.showIconF, null, direction > 0 ? 1.1 : 4.4);
    },

    /**
     * Section 6
     */
    _showSection6(direction) {
        // Audio
        // AudioManager.play('background-loop-3', {
        //     loop: true,
        // });

        // Cursor
        // if (this._nuxtRoot.customCursor) {
        //     this._nuxtRoot.customCursor.enableClickAndHold();
        // }

        // Animations
        // this._postProcessing.passes.landscapes.enabled = true;

        this._timelineSection6Show = new gsap.timeline();
        this._timelineSection6Show.to(this._components.spinner, 4, { emissiveIntensity: 0.8 }, 0);
        this._timelineSection6Show.to(this._reflectiveMaterial, 4, { blendColorStrength: 1 }, 0);
        this._timelineSection6Show.fromTo(this._components.spinner.revealCircle, 1.8, { scanDistance: 0 }, { scanDistance: 3000, ease: 'power3.in' }, 0);
        this._timelineSection6Show.fromTo(this._components.spinner.revealCircle, 1.8, { scanWidth: 4 }, { scanWidth: 100, ease: 'power3.in' }, 0);
        // this._timelineSection6Show.set(this._components.landscapes, { showReveal: false }, 1.8);
        this._timelineSection6Show.add(this._components.spinner.hideSparks(0.2), 0.3);

        this._timelineSection6Show.call(this._components.landscapes.showCurrent, null, 0);

        this._timelineSection6Show.set(this._components.landscapes, { visible: true }, 0);

        // Gradient 1
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 5, { r: 43 / 255, g: 34 / 255, b: 117 / 255 }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 5, { value: 0.52 }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 5, { x: 1, y: 1 }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 5, { value: 0.96 }, 0);

        // Gradient 2
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 5, { r: 0 / 255, g: 0 / 255, b: 0 / 255 }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 5, { value: 0.19 }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 5, { x: 0, y: 0.66 }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 5, { value: 0.69 }, 0);

        // Bottom gradient
        this._timelineSection6Show.to(this._postProcessing.passes.finalPass.material.uniforms.uBottomGradientStrength, 5, { value: 0.48 }, 0);

        // Bloom
        this._timelineSection6Show.to(this._postProcessing.passes.bloomPass, 5, { threshold: 0.02, ease: 'sine.inOut' }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.bloomPass, 3, { strength: 1.04, ease: 'sine.inOut' }, 0);
        this._timelineSection6Show.to(this._postProcessing.passes.bloomPass, 3, { radius: 0, ease: 'sine.inOut' }, 0);

        // Camera
        this._timelineSection6Show.to(this._cameraAnimation, 5, { mouseRotationXOffset: 10 }, 0);
        this._timelineSection6Show.to(this._cameraAnimation, 5, { mouseRotationYOffset: 0.005 }, 0);

        // this._timelineSection6Show.to(this._components.floor._mesh.material.uniforms.uMipStrength, 3, { value: 0 }, 0);

        // this._timelineSection6Show.to(this._components.human.scale, 5, { x: 2, y: 2, z: 2, ease: 'power1.inOut' }, 0);
        this._timelineSection6Show.to(this._components.spinner.scale, 5, { x: 2, y: 2, z: 2, ease: 'power1.inOut' }, 0);

        this._timelineSection6Show.to(this._renderer, 2, { toneMappingExposure: 1 }, 0);

        if (this._nuxtRoot.customCursor) this._timelineSection6Show.call(this._nuxtRoot.customCursor.showIconG, null, 3.5);

        const params = {
            clearColor: this._renderer.getClearColor(),
        };

        this._timelineSection6Show.to(
            params.clearColor,
            1,
            {
                r: 7 / 255,
                g: 6 / 255,
                b: 7 / 255,
                ease: 'sine.inOut',
                onUpdate: () => {
                    this._renderer.setClearColor(new Color(params.clearColor.r, params.clearColor.g, params.clearColor.b));
                },
            },
            0
        );
    },

    _hideSection6() {
        this._timelineSection6Hide = new gsap.timeline();
        this._timelineSection6Hide.to(this._components.spinner, 4, { emissiveIntensity: 0 }, 0);
        this._timelineSection6Hide.to(this._reflectiveMaterial, 4, { blendColorStrength: 0 }, 0);

        this._timelineSection6Hide.call(this._components.landscapes.hide, null, 4);
        this._timelineSection6Hide.set(this._components.landscapes, { visible: false }, 5);

        // Bottom gradient
        this._timelineSection6Hide.to(this._postProcessing.passes.finalPass.material.uniforms.uBottomGradientStrength, 5, { value: 0 }, 0);

        // Bloom
        this._timelineSection6Hide.to(this._postProcessing.passes.bloomPass, 4, { threshold: 0.1, ease: 'sine.inOut' }, 0);
        this._timelineSection6Hide.to(this._postProcessing.passes.bloomPass, 4, { strength: 0.42, ease: 'sine.inOut' }, 0);
        this._timelineSection6Hide.to(this._postProcessing.passes.bloomPass, 4, { radius: 0.58, ease: 'sine.inOut' }, 0);

        // this._timelineSection6Hide.to(this._components.floor._mesh.material.uniforms.uMipStrength, 3, { value: 0.58 }, 0);

        // this._timelineSection6Hide.to(this._components.human.scale, 7, { x: 1, y: 1, z: 1 }, 0);
        this._timelineSection6Hide.to(this._components.spinner.scale, 7, { x: 1, y: 1, z: 1 }, 0);

        this._timelineSection6Hide.to(this._renderer, 2, { toneMappingExposure: 2 }, 0);

        const params = {
            clearColor: this._renderer.getClearColor(),
        };

        this._timelineSection6Hide.to(
            params.clearColor,
            1,
            {
                r: 15 / 255,
                g: 13 / 255,
                b: 16 / 255,
                ease: 'sine.inOut',
                onUpdate: () => {
                    this._renderer.setClearColor(new Color(params.clearColor.r, params.clearColor.g, params.clearColor.b));
                },
            },
            4.1
        );

        // this._timelineSection6Hide.call(
        //     () => {
        //         this._components.landscapes.hide(null);
        //     },
        //     null,
        //     3
        // );
    },
};
