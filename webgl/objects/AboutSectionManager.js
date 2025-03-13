// Vendor
import gsap from 'gsap';
import { Color } from 'three';

export default {
    _goto(index, direction) {
        const previousIndex = this._currentSectionIndex;
        switch (previousIndex) {
            case 0:
                // this._hideSection0();
                break;
        }

        this._currentSectionIndex = index;
        switch (this._currentSectionIndex) {
            case 0:
                this._showSection0(direction);
                break;
            case 1:
            case 2:
                this._showSection1(direction);
                break;
            case 3:
                // case 4:
                this._showSection3(direction);
                break;
            case 4:
            case 9:
                this._showSection5(direction);
                break;
            case 10:
                this._showSection11(direction);
                break;
        }
    },

    /**
     * Section 0
     */
    _showSection0(direction) {
        this.timelineShowSection0 = new gsap.timeline();
        this.timelineShowSection0.to(
            this.position,
            1.5,
            {
                x: 1.38,
                ease: 'power2.inOut',
            },
            0
        );

        // Gradient 1
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 31 / 255, g: 22 / 255, b: 68 / 255 }, 0);
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.36 }, 0);
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 0.78, y: 0 }, 0);
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 1.06 }, 0);

        // Gradient 2
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 47 / 255, g: 15 / 255, b: 15 / 255 }, 0);
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.19 }, 0);
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 0.04, y: 1 }, 0);
        this.timelineShowSection0.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 0.81 }, 0);
    },

    /**
     * Section 1
     */
    _showSection1(direction) {
        this.timelineShowSection1 = new gsap.timeline();

        if (this._locale === 'en') {
            this.timelineShowSection1.to(
                this.position,
                1.5,
                {
                    x: -1.5,
                    ease: 'power2.inOut',
                },
                0
            );
        } else {
            this.timelineShowSection1.to(
                this.position,
                1.5,
                {
                    x: 4.5,
                    ease: 'power2.inOut',
                },
                0
            );
        }
        this.timelineShowSection1.to(
            this._camera.position,
            1.5,
            {
                z: 9.34,
                y: 1.24,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this._camera.lookAt(this._cameraTarget);
                },
            },
            0
        );

        // Gradient 1
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 31 / 255, g: 22 / 255, b: 68 / 255 }, 0);
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.3 }, 0);
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 0.35, y: 0 }, 0);
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 1.34 }, 0);

        // Gradient 2
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 47 / 255, g: 15 / 255, b: 15 / 255 }, 0);
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.15 }, 0);
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 0.93, y: 1 }, 0);
        this.timelineShowSection1.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 0.79 }, 0);
    },

    /**
     * Section 3
     */
    _showSection3(direction) {
        this.timelineShowSection3 = new gsap.timeline();

        if (this._locale === 'en') {
            this.timelineShowSection3.to(
                this.position,
                2,
                {
                    x: -3.45,
                    ease: 'power2.inOut',
                },
                0
            );
        } else {
            this.timelineShowSection3.to(
                this.position,
                2,
                {
                    x: 5.6,
                    ease: 'power2.inOut',
                },
                0
            );
        }
        this.timelineShowSection3.to(
            this._camera.position,
            2,
            {
                z: 4.63,
                y: 20,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this._camera.lookAt(this._cameraTarget);
                },
            },
            0
        );

        this.timelineShowSection3.to(this._components.spinner._sparks, 1.5, { alpha: 1 }, 0);

        // Gradient 1
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 43 / 255, g: 34 / 255, b: 97 / 255 }, 0);
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.16 }, 0);
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 0.8, y: 0.41 }, 0);
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 1 }, 0);

        // Gradient 2
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 52 / 255, g: 5 / 255, b: 5 / 255 }, 0);
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.15 }, 0);
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 1, y: 1 }, 0);
        this.timelineShowSection3.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 0.82 }, 0);
    },

    /**
     * Section 5
     */
    _showSection5(direction) {
        this.timelineShowSection5 = new gsap.timeline();

        if (this._locale === 'en') {
            this.timelineShowSection5.to(
                this.position,
                2,
                {
                    x: -13,
                    ease: 'power2.inOut',
                },
                0
            );
        } else {
            this.timelineShowSection5.to(
                this.position,
                2,
                {
                    x: 11,
                    ease: 'power2.inOut',
                },
                0
            );
        }

        this.timelineShowSection5.to(
            this._camera.position,
            1.5,
            {
                z: 9.34,
                y: 1.24,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this._camera.lookAt(this._cameraTarget);
                },
            },
            0
        );

        this.timelineShowSection5.to(this._components.spinner._sparks, 1.5, { alpha: 0.1 }, 0);

        // Gradient 1
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 2, { r: 52 / 255, g: 11 / 255, b: 11 / 255 }, 0);
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.11 }, 0);
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 2, { x: 0, y: 0.45 }, 0);
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 2, { value: 0.32 }, 0);

        // Gradient 2
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 2, { r: 43 / 255, g: 34 / 255, b: 97 / 255 }, 0);
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.11 }, 0);
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 2, { x: 1, y: 1 }, 0);
        this.timelineShowSection5.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 2, { value: 0.92 }, 0);
    },

    /**
     * Section 11
     */
    _showSection11(direction) {
        this.timelineShowSection11 = new gsap.timeline();

        if (this._locale === 'en') {
            this.timelineShowSection11.to(
                this.position,
                2,
                {
                    x: -2,
                    ease: 'power2.inOut',
                },
                0
            );
        } else {
            this.timelineShowSection11.to(
                this.position,
                2,
                {
                    x: 4.5,
                    ease: 'power2.inOut',
                },
                0
            );
        }
        this.timelineShowSection11.to(
            this._camera.position,
            2,
            {
                z: 9.34,
                y: 1.24,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this._camera.lookAt(this._cameraTarget);
                },
            },
            0
        );

        this.timelineShowSection11.to(this._components.spinner._sparks, 1.5, { alpha: 1 }, 0);

        // Gradient 1
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, 4, { r: 43 / 255, g: 34 / 255, b: 97 / 255 }, 0);
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 4, { value: 0.21 }, 0);
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, 4, { x: 0.31, y: 0 }, 0);
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, 4, { value: 1.45 }, 0);

        // Gradient 2
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, 4, { r: 52 / 255, g: 11 / 255, b: 11 / 255 }, 0);
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 4, { value: 0.11 }, 0);
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, 4, { x: 0.9, y: 1 }, 0);
        this.timelineShowSection11.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, 4, { value: 0.05 }, 0);
    },
};
