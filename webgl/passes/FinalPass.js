// Vendor
import { Vector2, ShaderMaterial, Color } from 'three';
import { component } from '@/vendor/bidello';

// Shaders
import vertexShader from '@/webgl/shaders/final/vertex.glsl';
import fragmentShader from '@/webgl/shaders/final/fragment.glsl';

export default class FinalPass extends component(ShaderMaterial) {
    init(materialOptions, { noise, chromaticAberration, vignette, gradients, bottomGradient }) {
        // Properties
        this._noise = noise;
        this._chromaticAberration = chromaticAberration;
        this._vignette = vignette;
        this._gradients = gradients;
        this._bottomGradient = bottomGradient;

        // Shaders
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        // Uniforms
        this.uniforms = this._createUniforms();
    }

    /**
     * Public
     */
    onUpdate({ time }) {
        this.uniforms.uTime.value = time;
    }

    onResize({ width, height }) {
        this.uniforms.uResolution.value = new Vector2(width, height);
    }

    /**
     * Private
     */
    _createUniforms() {
        return {
            tDiffuse: { value: null },
            uTime: { value: 0 },
            uResolution: { value: new Vector2() },
            uNoiseStrength: { value: this._noise.strength },
            uCAMaxDistortion: { value: this._chromaticAberration.maxDistortion },
            uCAScale: { value: this._chromaticAberration.scale },
            uCASize: { value: this._chromaticAberration.size },
            uVignetteOffset: { value: this._vignette.offset },
            uVignetteDarkness: { value: this._vignette.darkness },
            uGradientsAlpha: { value: 1 },
            uGradient1Position: { value: this._gradients[0].position },
            uGradient1Color: { value: this._gradients[0].color },
            uGradient1Strength: { value: this._gradients[0].strength },
            uGradient1Scale: { value: this._gradients[0].scale },
            uGradient2Position: { value: this._gradients[1].position },
            uGradient2Color: { value: this._gradients[1].color },
            uGradient2Strength: { value: this._gradients[1].strength },
            uGradient2Scale: { value: this._gradients[1].scale },
            uBottomGradientStrength: { value: this._bottomGradient.strength },
            uBottomGradientScale: { value: this._bottomGradient.scale },
            uBottomGradientColor: { value: this._bottomGradient.color },
        };
    }
}
