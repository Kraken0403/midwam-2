// Vendor
import { Vector2, ShaderMaterial, Color } from 'three';
import { component } from '@/vendor/bidello';

// Shaders
import vertexShader from '@/webgl/shaders/hologram/vertex.glsl';
import fragmentShader from '@/webgl/shaders/hologram/fragment.glsl';

export default class HologramPass extends component(ShaderMaterial) {
    init() {
        // Shaders
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        // Uniforms
        this.uniforms = this._createUniforms();
    }

    /**
     * Getters & Setters
     */
    get progress() {
        return this.uniforms.uProgress.value;
    }

    set progress(value) {
        this.uniforms.uProgress.value = value;
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
            uOffset: { value: 10 },
            uLineOffsetMinAmplitude: { value: 7.93 },
            uLineOffsetMaxAmplitude: { value: 3.8 },
            uLineOffsetFrequency: { value: 5.2 },
            uStrengthMinAmplitude: { value: 0.07 },
            uStrengthMaxAmplitude: { value: 0.76 },
            uStrengthFrequency: { value: 2.11 },
            uLineWidth: { value: 4 },
            uColor: { value: new Color(0x00a8ff) },
            uColorStrength: { value: 0.3 },
            uProgress: { value: 0 },
        };
    }
}
