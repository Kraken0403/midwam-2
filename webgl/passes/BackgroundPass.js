// Vendor
import { Vector2, ShaderMaterial, Color } from 'three';
import { component } from '@/vendor/bidello';

// Shaders
import vertexShader from '@/webgl/shaders/background/vertex.glsl';
import fragmentShader from '@/webgl/shaders/background/fragment.glsl';

export default class BackgroundPass extends component(ShaderMaterial) {
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
    // get progress() {
    //     return this.uniforms.uProgress.value;
    // }

    // set progress(value) {
    //     this.uniforms.uProgress.value = value;
    // }

    /**
     * Public
     */
    onUpdate({ time }) {
        // this.uniforms.uTime.value = time;
    }

    onResize({ width, height }) {
        // this.uniforms.uResolution.value = new Vector2(width, height);
    }

    /**
     * Private
     */
    _createUniforms() {
        return {};
    }
}
