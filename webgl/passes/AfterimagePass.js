/* eslint-disable */

import { LinearFilter, NearestFilter, RGBAFormat, ShaderMaterial, UniformsUtils, WebGLRenderTarget } from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { AfterimageShader } from 'three/examples/jsm/shaders/AfterimageShader.js';

var AfterimagePass = function (damp) {
    Pass.call(this);

    if (AfterimageShader === undefined) console.error('AfterimagePass relies on AfterimageShader');

    this.shader = AfterimageShader;

    this.uniforms = UniformsUtils.clone(this.shader.uniforms);

    this.uniforms['damp'].value = damp !== undefined ? damp : 0.96;

    this.textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
    });

    this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: LinearFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
    });

    this.shaderMaterial = new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.shader.vertexShader,
        fragmentShader: this.shader.fragmentShader,
    });

    this.compFsQuad = new Pass.FullScreenQuad(this.shaderMaterial);

    const material = new ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;

            varying vec2 vUv;

            void main() {
                gl_FragColor = texture2D(uTexture, vUv);
            }
        `,
    });

    this.copyFsQuad = new Pass.FullScreenQuad(material);
};

AfterimagePass.prototype = Object.assign(Object.create(Pass.prototype), {
    constructor: AfterimagePass,

    render: function (renderer, writeBuffer, readBuffer) {
        this.uniforms['tOld'].value = this.textureOld.texture;
        this.uniforms['tNew'].value = readBuffer.texture;

        renderer.setRenderTarget(this.textureComp);
        this.compFsQuad.render(renderer);

        this.copyFsQuad.material.uniforms.uTexture.value = this.textureComp.texture;

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.copyFsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);

            if (this.clear) renderer.clear();

            this.copyFsQuad.render(renderer);
        }

        // Swap buffers.
        var temp = this.textureOld;
        this.textureOld = this.textureComp;
        this.textureComp = temp;
        // Now textureOld contains the latest image, ready for the next frame.
    },

    setSize: function (width, height) {
        this.textureComp.setSize(width, height);
        this.textureOld.setSize(width, height);
    },
});

export { AfterimagePass };
