// Vendor
import { ShaderMaterial } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import math from '@/utils/math';

// Shaders
import vertexShader from '@/webgl/shaders/hide/vertex.glsl';
import fragmentShader from '@/webgl/shaders/hide/fragment.glsl';

export default class HidePass extends component(ShaderMaterial) {
    init(materialOptions, { color }) {
        // Params
        this._color = color;

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
        // console.log('progress', value);
        this.uniforms.uProgress.value = math.clamp(value, 0, 1);
    }

    /**
     * Private
     */
    _createUniforms() {
        return {
            tDiffuse: { value: null },
            uHideColor: { value: this._color },
            uProgress: { value: 1 },
        };
    }
}
