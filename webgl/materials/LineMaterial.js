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

import { Color, ShaderLib, ShaderMaterial, UniformsLib, UniformsUtils, Vector2, Vector3, AdditiveBlending, NoBlending, SubtractiveBlending, MultiplyBlending } from 'three';

// Shaders
import vertexShader from '@/webgl/shaders/lines/vertex.glsl';
import fragmentShader from '@/webgl/shaders/lines/fragment.glsl';

UniformsLib.line = {
    worldUnits: { value: 1 },
    linewidth: { value: 1 },
    resolution: { value: new Vector2(1, 1) },
    dashScale: { value: 1 },
    dashSize: { value: 1 },
    gapSize: { value: 1 }, // todo FIX - maybe change to totalSize
    progress: { value: 1 },
    noisyLines: { value: false },
    revealProgress: { value: 1 },
    specular: { value: new Vector3() },
    emissive: { value: new Color() },
    specularStrength: { value: 1 },
    shininess: { value: 30 },
    alpha: { value: 1 },
};

ShaderLib['lineCustom'] = {
    uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, UniformsLib.line, UniformsLib.lights]),
    vertexShader,
    fragmentShader,
};

var LineMaterial = function (parameters) {
    ShaderMaterial.call(this, {
        type: 'LineMaterial',

        uniforms: UniformsUtils.clone(ShaderLib['lineCustom'].uniforms),
        lights: true,
        // transparent: true,
        blending: AdditiveBlending,

        vertexShader: ShaderLib['lineCustom'].vertexShader,
        fragmentShader: ShaderLib['lineCustom'].fragmentShader,
    });

    this.dashed = false;
    this.defines.SHOW_LIGHTS = '';

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

        alpha: {
            enumerable: true,

            get: function () {
                return this.uniforms.alpha.value;
            },

            set: function (value) {
                this.uniforms.alpha.value = value;
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

        resolution: {
            enumerable: true,

            get: function () {
                return this.uniforms.resolution.value;
            },

            set: function (value) {
                this.uniforms.resolution.value.copy(value);
            },
        },

        revealProgress: {
            enumerable: true,

            get: function () {
                return this.uniforms.revealProgress.value;
            },

            set: function (value) {
                this.uniforms.revealProgress.value = value;
            },
        },

        showLights: {
            enumerable: true,

            get: function () {
                return 'SHOW_LIGHTS' in this.defines;
            },

            set: function (value) {
                if (value === true) {
                    this.defines.SHOW_LIGHTS = '';
                } else {
                    delete this.defines.SHOW_LIGHTS;
                }
            },
        },

        specular: {
            enumerable: true,

            get: function () {
                return this.uniforms.specular.value;
            },

            set: function (value) {
                this.uniforms.specular.value = value;
            },
        },

        emissive: {
            enumerable: true,

            get: function () {
                return this.uniforms.emissive.value;
            },

            set: function (value) {
                this.uniforms.emissive.value = value;
            },
        },

        specularStrength: {
            enumerable: true,

            get: function () {
                return this.uniforms.specularStrength.value;
            },

            set: function (value) {
                this.uniforms.specularStrength.value = value;
            },
        },

        shininess: {
            enumerable: true,

            get: function () {
                return this.uniforms.shininess.value;
            },

            set: function (value) {
                this.uniforms.shininess.value = value;
            },
        },
    });

    this.setValues(parameters);
};

LineMaterial.prototype = Object.create(ShaderMaterial.prototype);
LineMaterial.prototype.constructor = LineMaterial;

LineMaterial.prototype.isLineMaterial = true;

LineMaterial.prototype.copy = function (source) {
    ShaderMaterial.prototype.copy.call(this, source);

    this.color.copy(source.color);

    this.linewidth = source.linewidth;

    this.resolution = source.resolution;

    // todo

    return this;
};

export { LineMaterial };
