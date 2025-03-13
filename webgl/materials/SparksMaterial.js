/* eslint-disable */

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

import { Color, ShaderLib, ShaderMaterial, UniformsLib, UniformsUtils, Vector2 } from 'three';

// Shaders
import vertexShader from '@/webgl/shaders/sparks/vertex.glsl';
import fragmentShader from '@/webgl/shaders/sparks/fragment.glsl';

UniformsLib.sparks = {
    linewidth: { value: 1 },
    resolution: { value: new Vector2(1, 1) },
    dashScale: { value: 1 },
    dashSize: { value: 1 },
    gapSize: { value: 1 }, // todo FIX - maybe change to totalSize
    opacity: { value: 1 },
    time: { value: 0 },
    radius: { value: 10 },
    progress: { value: 0 },
    globalAlpha: { value: 1 },
};

ShaderLib['sparks'] = {
    uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, UniformsLib.sparks]),
    vertexShader,
    fragmentShader,
};

var SparksMaterial = function (parameters) {
    ShaderMaterial.call(this, {
        type: 'SparksMaterial',
        uniforms: UniformsUtils.clone(ShaderLib['sparks'].uniforms),
        vertexShader: ShaderLib['sparks'].vertexShader,
        fragmentShader: ShaderLib['sparks'].fragmentShader,
        transparent: true,
        fog: true,
        clipping: true, // required for clipping support
    });

    this.dashed = false;

    Object.defineProperties(this, {
        color: {
            enumerable: true,

            get: function () {
                return this.uniforms.diffuse.value;
            },

            set: function (value) {
                this.uniforms.diffuse.value = value;
            },
        },

        linewidth: {
            enumerable: true,

            get: function () {
                return this.uniforms.linewidth.value;
            },

            set: function (value) {
                this.uniforms.linewidth.value = value;
            },
        },

        dashScale: {
            enumerable: true,

            get: function () {
                return this.uniforms.dashScale.value;
            },

            set: function (value) {
                this.uniforms.dashScale.value = value;
            },
        },

        dashSize: {
            enumerable: true,

            get: function () {
                return this.uniforms.dashSize.value;
            },

            set: function (value) {
                this.uniforms.dashSize.value = value;
            },
        },

        gapSize: {
            enumerable: true,

            get: function () {
                return this.uniforms.gapSize.value;
            },

            set: function (value) {
                this.uniforms.gapSize.value = value;
            },
        },

        opacity: {
            enumerable: true,

            get: function () {
                return this.uniforms.opacity.value;
            },

            set: function (value) {
                this.uniforms.opacity.value = value;
            },
        },

        resolution: {
            enumerable: true,

            get: function () {
                return this.uniforms.resolution.value;
            },

            set: function (value) {
                this.uniforms.resolution.value.copy(value);
            },
        },

        radius: {
            enumerable: true,

            get: function () {
                return this.uniforms.radius.value;
            },

            set: function (value) {
                this.uniforms.radius.value = value;
            },
        },

        globalAlpha: {
            enumerable: true,

            get: function () {
                return this.uniforms.globalAlpha.value;
            },

            set: function (value) {
                this.uniforms.globalAlpha.value = value;
            },
        },

        burst: {
            enumerable: true,

            get: function () {
                return 'IS_BURST' in this.defines;
            },

            set: function (value) {
                if (value === true) {
                    this.defines.IS_BURST = '';
                } else {
                    delete this.defines.IS_BURST;
                }
            },
        },

        worldUnits: {
            enumerable: true,

            get: function () {
                return 'WORLD_UNITS' in this.defines;
            },

            set: function (value) {
                if (value === true) {
                    this.defines.WORLD_UNITS = '';
                } else {
                    delete this.defines.WORLD_UNITS;
                }
            },
        },
    });

    this.setValues(parameters);
};

SparksMaterial.prototype = Object.create(ShaderMaterial.prototype);
SparksMaterial.prototype.constructor = SparksMaterial;

SparksMaterial.prototype.isSparksMaterial = true;

export { SparksMaterial };
