/* eslint-disable */

/**
 * @author Slayvin / http://slayvin.net
 */

import {
    LinearFilter,
    Matrix4,
    Mesh,
    PerspectiveCamera,
    Plane,
    RGBFormat,
    ShaderMaterial,
    UniformsUtils,
    Vector3,
    Vector4,
    WebGLRenderTarget,
    WebGLMultisampleRenderTarget,
    LinearMipmapLinearFilter,
    CustomBlending,
    AddEquation,
    OneFactor,
    OneMinusSrcAlphaFactor,
    RGBAFormat,
    Vector2,
    AdditiveBlending,
} from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';

// Shaders
import vertexShader from '@/webgl/shaders/reflector/vertex.glsl';
import fragmentShader from '@/webgl/shaders/reflector/fragment.glsl';

var Reflector = function (geometry, options) {
    Mesh.call(this, geometry);

    this.type = 'Reflector';

    var scope = this;

    options = options || {};

    var textureWidth = options.textureWidth || 512;
    var textureHeight = options.textureHeight || 512;
    var clipBias = options.clipBias || 0;
    var shader = options.shader || Reflector.ReflectorShader;
    var roughnessMap = options.roughnessMap;
    var roughnessMapStrength = options.roughnessMapStrength;
    var roughnessMapScale = options.roughnessMapScale;
    var roughnessMapOffset = options.roughnessMapOffset || new Vector2();
    var renderer = options.renderer;
    var reflectionStrength = options.reflectionStrength || 0.75;
    var forceNormalRenderTarget = options.forceNormalRenderTarget || false;
    var mipStrength = options.mipStrength || 1;
    var noiseStrength = options.noiseStrength || 0.1;

    var reflectorPlane = new Plane();
    var normal = new Vector3();
    var reflectorWorldPosition = new Vector3();
    var cameraWorldPosition = new Vector3();
    var rotationMatrix = new Matrix4();
    var lookAtPosition = new Vector3(0, 0, -1);
    var clipPlane = new Vector4();

    var view = new Vector3();
    var target = new Vector3();
    var q = new Vector4();

    var textureMatrix = new Matrix4();
    var virtualCamera = new PerspectiveCamera();
    this.virtualCamera = virtualCamera;

    var parameters = {
        minFilter: LinearMipmapLinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        stencilBuffer: false,
        generateMipmaps: true,
    };

    var renderTarget;
    if (WEBGL.isWebGL2Available() && !forceNormalRenderTarget) {
        renderTarget = new WebGLMultisampleRenderTarget(textureWidth, textureHeight, parameters);
    } else {
        renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, parameters);
    }

    // if (!MathUtils.isPowerOfTwo(textureWidth) || !MathUtils.isPowerOfTwo(textureHeight)) {
    //     renderTarget.texture.generateMipmaps = false;
    // }
    const materialOptions = {
        uniforms: UniformsUtils.clone(shader.uniforms),
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        transparent: true,
        extensions: {
            shaderTextureLOD: true,
        },
    };

    // arameters.rendererExtensionShaderTextureLod ) ? '#define TEXTURE_LOD_EXT' : '',

    var material = new ShaderMaterial(materialOptions);
    material.uniforms['tDiffuse'].value = renderTarget.texture;
    material.uniforms['textureMatrix'].value = textureMatrix;
    material.uniforms['tRoughnessMap'].value = roughnessMap;
    material.uniforms['uRoughnessMapStrength'].value = roughnessMapStrength;
    material.uniforms['uRoughnessMapScale'].value = roughnessMapScale;
    material.uniforms['uRoughnessMapOffset'].value = roughnessMapOffset;
    material.uniforms['uReflectionStrength'].value = reflectionStrength;
    material.uniforms['uMipStrength'].value = mipStrength;
    material.uniforms['uNoiseStrength'].value = noiseStrength;
    material.uniforms['uRoughnessMapResolution'].value = new Vector2(roughnessMap.image.width, roughnessMap.image.height);

    this.material = material;

    this.onBeforeRender = function (renderer, scene, camera) {
        reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
        cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

        rotationMatrix.extractRotation(scope.matrixWorld);

        normal.set(0, 0, 1);
        normal.applyMatrix4(rotationMatrix);

        view.subVectors(reflectorWorldPosition, cameraWorldPosition);

        // Avoid rendering when reflector is facing away

        if (view.dot(normal) > 0) return;

        view.reflect(normal).negate();
        view.add(reflectorWorldPosition);

        rotationMatrix.extractRotation(camera.matrixWorld);

        lookAtPosition.set(0, 0, -1);
        lookAtPosition.applyMatrix4(rotationMatrix);
        lookAtPosition.add(cameraWorldPosition);

        target.subVectors(reflectorWorldPosition, lookAtPosition);
        target.reflect(normal).negate();
        target.add(reflectorWorldPosition);

        virtualCamera.position.copy(view);
        virtualCamera.up.set(0, 1, 0);
        virtualCamera.up.applyMatrix4(rotationMatrix);
        virtualCamera.up.reflect(normal);
        virtualCamera.lookAt(target);

        virtualCamera.far = camera.far; // Used in WebGLBackground

        virtualCamera.updateMatrixWorld();
        virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

        // Update the texture matrix
        textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
        textureMatrix.multiply(virtualCamera.projectionMatrix);
        textureMatrix.multiply(virtualCamera.matrixWorldInverse);
        textureMatrix.multiply(scope.matrixWorld);

        // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
        // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
        reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
        reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);

        clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);

        var projectionMatrix = virtualCamera.projectionMatrix;

        q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
        q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
        q.z = -1.0;
        q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

        // Calculate the scaled plane vector
        clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[2] = clipPlane.x;
        projectionMatrix.elements[6] = clipPlane.y;
        projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
        projectionMatrix.elements[14] = clipPlane.w;

        // Render

        renderTarget.texture.encoding = renderer.outputEncoding;

        scope.visible = false;

        var currentRenderTarget = renderer.getRenderTarget();

        var currentXrEnabled = renderer.xr.enabled;
        var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

        renderer.xr.enabled = false; // Avoid camera modification
        renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

        renderer.setRenderTarget(renderTarget);

        // const currentClearCOlor = renderer.getClearColor().getHex();
        // renderer.setClearColor(0xff0000);

        // const currentClearAlpha = renderer.getClearAlpha();
        // renderer.setClearAlpha(1);

        renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897

        if (renderer.autoClear === false) renderer.clear();
        renderer.render(scene, virtualCamera);

        renderer.xr.enabled = currentXrEnabled;
        renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

        renderer.setRenderTarget(currentRenderTarget);
        // renderer.setClearAlpha(currentClearAlpha);

        // renderer.setClearColor(currentClearCOlor);

        // Restore viewport

        var viewport = camera.viewport;

        if (viewport !== undefined) {
            renderer.state.viewport(viewport);
        }

        scope.visible = true;
    };

    this.getRenderTarget = function () {
        return renderTarget;
    };

    this.setSize = function (width, height) {
        const size = 1024;
        // const size = Math.max(width, height);
        renderTarget.setSize(size, size);
    };
};

Reflector.prototype = Object.create(Mesh.prototype);
Reflector.prototype.constructor = Reflector;

Reflector.ReflectorShader = {
    uniforms: {
        tDiffuse: {
            value: null,
        },

        textureMatrix: {
            value: null,
        },

        tRoughnessMap: {
            value: null,
        },
        uRoughnessMapStrength: {
            value: null,
        },
        uRoughnessMapScale: {
            value: null,
        },
        uRoughnessMapOffset: {
            value: new Vector2(),
        },
        uReflectionStrength: {
            value: null,
        },
        uMipStrength: {
            value: 1,
        },
        uRoughnessMapResolution: {
            value: new Vector2(),
        },
        uNoiseStrength: {
            value: null,
        },
    },

    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
};

export { Reflector };
