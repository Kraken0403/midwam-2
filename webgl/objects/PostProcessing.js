// Vendor
import gsap from 'gsap';
import { Vector2, WebGLMultisampleRenderTarget, LinearFilter, RGBFormat, WebGLRenderTarget, Color, RGBAFormat } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { WEBGL } from 'three/examples/jsm/WebGL';
import { component } from '@/vendor/bidello';

// Passes
import { UnrealBloomPass } from '@/webgl/passes/UnrealBloomPass';
import { AfterimagePass } from '@/webgl/passes/AfterimagePass.js';
import FinalPass from '@/webgl/passes/FinalPass.js';
import HologramPass from '@/webgl/passes/HologramPass.js';
import HidePass from '@/webgl/passes/HidePass.js';
// import { SMAAPass } from '@/webgl/passes/SMAAPass.js';
// import { SSAARenderPass } from '@/webgl/passes/SSAARenderPass.js';
// import BackgroundPass from '@/webgl/passes/BackgroundPass.js';

// Utils
import Debugger from '@/utils/Debugger';
import WindowResizeObserver from '@/utils/WindowResizeObserver.js';

export default class PostProcessing extends component() {
    init({ renderer }) {
        // Props
        this._renderer = renderer;

        // Data
        this._layers = {};
        this._renderTarget = this._createRenderTarget();
        this._multisampleRenderTarget = this._createMultisampleRenderTarget();
        this._composer = this._createComposer();
    }

    /**
     * Getters & Setters
     */
    get passes() {
        return this._passes;
    }

    /**
     * Public
     */
    setup() {
        this._passes = this._createPasses();

        // Debug
        this._debugGui = this._createDebugGui();

        // tmp
        WindowResizeObserver.triggerResize();
    }

    addLayer(name, component) {
        this._layers[name] = component;
    }

    render(scene, camera) {
        this._passes.renderPass.scene = scene;
        this._passes.renderPass.camera = camera;
        // this._passes.ssaaRenderPass.scene = scene;
        // this._passes.ssaaRenderPass.camera = camera;

        // if (scene.name === 'home' && this._passes.landscapes.enabled) {
        //     this._passes.landscapes.map = this._layers.landscapes.texture;
        //     this._layers.landscapes.render();
        // }

        if (scene.name === 'services' && this._passes.hidePass?.material.uniforms?.progress) {
            this._passes.hidePass.material.uniforms.progress.value = 0;
          }

        this._composer.render();
        // this._renderer.render(scene, camera);
    }

    /**
     * Private
     */
    _createRenderTarget() {
        const renderTarget = new WebGLRenderTarget(0, 0, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: RGBFormat,
            stencilBuffer: false,
        });
        renderTarget.texture.encoding = this._renderer.outputEncoding;
        return renderTarget;
    }

    _createMultisampleRenderTarget() {
        let renderTarget;

        if (WEBGL.isWebGL2Available()) {
            renderTarget = new WebGLMultisampleRenderTarget(0, 0, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false,
            });
        } else {
            renderTarget = new WebGLRenderTarget(0, 0, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false,
            });
        }
        renderTarget.texture.encoding = this._renderer.outputEncoding;
        return renderTarget;
    }

    _createComposer() {
        const composer = new EffectComposer(this._renderer, this._multisampleRenderTarget);
        // const composer = new EffectComposer(this._renderer, this._renderTarget);
        return composer;
    }

    _createPasses() {
        const passes = {};

        // Clear pass
        passes.clearPass = new ClearPass();
        this._composer.addPass(passes.clearPass);

        // Background pass
        // const background = new BackgroundPass();
        // passes.background = new ShaderPass(background);
        // this._composer.addPass(passes.background);

        // Layers
        // let item;
        // for (const key in this._layers) {
        //     item = this._layers[key];
        //     passes[item.name] = new TexturePass(item.texture);
        //     passes[item.name].enabled = false;
        //     this._composer.addPass(passes[item.name]);
        // }

        // Render pass
        passes.renderPass = new RenderPass(null, null);
        passes.renderPass.clear = false;
        passes.renderPass.clearDepth = true;
        this._composer.addPass(passes.renderPass);

        // After image
        passes.afterImage = new AfterimagePass();
        passes.afterImage.uniforms.damp.value = 0;
        passes.afterImage.textureComp.texture.encoding = this._renderer.outputEncoding;
        passes.afterImage.textureOld.texture.encoding = this._renderer.outputEncoding;
        this._composer.addPass(passes.afterImage);

        const copyPass = new ShaderPass(CopyShader);
        this._composer.addPass(copyPass);

        // SMAA
        // passes.smaaPass = new SMAAPass(0, 0);
        // passes.smaaPass.enabled = true;
        // this._composer.addPass(passes.smaaPass);

        // FXAA
        passes.fxaaPass = new ShaderPass(FXAAShader);
        passes.fxaaPass.enabled = !WEBGL.isWebGL2Available();
        this._composer.addPass(passes.fxaaPass);

        // SSAA
        // passes.ssaaRenderPass = new SSAARenderPass(null, null);
        // passes.ssaaRenderPass.enabled = false;
        // passes.ssaaRenderPass.unbiased = false;
        // passes.ssaaRenderPass.sampleLevel = 2;
        // this._composer.addPass(passes.ssaaRenderPass);

        // Bloom pass
        passes.bloomPass = new UnrealBloomPass(new Vector2(), 0.65, 0.58, 0.1);
        this._composer.addPass(passes.bloomPass);

        // Hide pass
        const hidePass = new HidePass(
            {},
            {
                color: this._renderer.getClearColor(),
                // color: new Color(0xff0000),
            }
        );
        passes.hidePass = new ShaderPass(hidePass);
        this._composer.addPass(passes.hidePass);

        // Hologram pass
        const hologramPass = new HologramPass();
        passes.hologramPass = new ShaderPass(hologramPass);
        passes.hologramPass.enabled = false;
        this._composer.addPass(passes.hologramPass);

        // Final pass
        const finalPass = new FinalPass(
            {},
            {
                noise: {
                    strength: 0.03,
                },
                chromaticAberration: {
                    maxDistortion: 0.21,
                    scale: 0.9,
                    size: 0.37,
                },
                vignette: {
                    offset: 0.39,
                    darkness: 0.38,
                },
                gradients: [
                    {
                        color: new Color(0x2b2261),
                        position: new Vector2(0.8, 0.7),
                        strength: 0,
                        scale: 1,
                    },
                    {
                        color: new Color(0x000000),
                        position: new Vector2(0, 0),
                        strength: 0,
                        scale: 1,
                    },
                ],
                bottomGradient: {
                    strength: 0, // 0.48,
                    scale: 0.88,
                    color: new Color(0x000000),
                },
            }
        );
        passes.finalPass = new ShaderPass(finalPass);
        this._composer.addPass(passes.finalPass);

        return passes;
    }

    /**
     * Resize
     */
    onResize({ width, height, dpr }) {
        this._width = width;
        this._height = height;
        this._dpr = dpr;

        this._resizeComposer();
        this._resizeRenderTargets();
        if (this._passes) {
            this._resizeBloomPass();
            this._resizeFXAAPass();
            // this._resizeSMAAPass();
        }
    }

    _resizeRenderTargets() {
        this._renderTarget.setSize(this._width, this._height);
        this._multisampleRenderTarget.setSize(this._width, this._height);
    }

    _resizeComposer() {
        this._composer.setSize(this._width, this._height);
    }

    _resizeBloomPass() {
        this._passes.bloomPass.resolution = new Vector2(this._width, this._height);
    }

    _resizeFXAAPass() {
        this._passes.fxaaPass.material.uniforms.resolution.value.x = 1 / this._width;
        this._passes.fxaaPass.material.uniforms.resolution.value.y = 1 / this._height;
    }

    // _resizeSMAAPass() {
    //     this._passes.smaaPass.setSize(this._width, this._height);
    // }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const params = {
            hologramColor: this._passes.hologramPass.material.uniforms.uColor.value.getHex(),
            gradient1Color: this._passes.finalPass.material.uniforms.uGradient1Color.value.getHex(),
            gradient2Color: this._passes.finalPass.material.uniforms.uGradient2Color.value.getHex(),
            bottomGradientColor: this._passes.finalPass.material.uniforms.uBottomGradientColor.value.getHex(),
        };

        const folderBackground = gui.getFolder('Background');
        const postProcesingFolder = folderBackground.addFolder('Post-processing');
        // postProcesingFolder.open();

        const afterImage = postProcesingFolder.addFolder('After image');
        afterImage.add(this._passes.afterImage.uniforms.damp, 'value', 0, 1, 0.01).name('damping');

        const hide = postProcesingFolder.addFolder('Hide');
        hide.add(this._passes.hidePass.material, 'progress', 0, 1, 0.01).name('progress');

        const bloom = postProcesingFolder.addFolder('Bloom');
        bloom.add(this._passes.bloomPass, 'threshold', 0, 1, 0.01).name('bloomThreshold').listen();
        bloom.add(this._passes.bloomPass, 'strength', 0, 10, 0.01).name('bloomStrength').listen();
        bloom.add(this._passes.bloomPass, 'radius', 0, 10, 0.01).name('bloomRadius').listen();
        // bloom.open();

        const hologram = postProcesingFolder.addFolder('Hologram');
        hologram.add(this._passes.hologramPass.material.uniforms.uProgress, 'value', 0, 1, 0.01).name('progress').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uOffset, 'value', -100, 100, 0.01).name('offset').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uLineOffsetMinAmplitude, 'value', 0, 100, 0.01).name('line offset min amplitude').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uLineOffsetMaxAmplitude, 'value', 0, 100, 0.01).name('line offset max amplitude').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uLineOffsetFrequency, 'value', 0, 50, 0.01).name('line offset frequency').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uStrengthMinAmplitude, 'value', 0, 1, 0.01).name('strength min amplitude').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uStrengthMaxAmplitude, 'value', 0, 1, 0.01).name('strength max amplitude').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uStrengthFrequency, 'value', 0, 10, 0.01).name('strength frequency').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uLineWidth, 'value', 0, 100, 1).name('line width').listen();
        hologram.add(this._passes.hologramPass.material.uniforms.uColorStrength, 'value', 0, 1, 0.01).name('color strength').listen();
        hologram
            .addColor(params, 'hologramColor')
            .name('color')
            .onChange(() => {
                this._passes.hologramPass.material.uniforms.uColor.value = new Color(params.hologramColor);
            });

        const noise = postProcesingFolder.addFolder('Noise');
        noise.add(this._passes.finalPass.uniforms.uNoiseStrength, 'value', 0, 1, 0.01).name('strength');
        // noise.open();

        const chromaticAberration = postProcesingFolder.addFolder('Chromatic Aberration');
        chromaticAberration.add(this._passes.finalPass.uniforms.uCAMaxDistortion, 'value', 0, 30).name('maxDistortion');
        chromaticAberration.add(this._passes.finalPass.uniforms.uCAScale, 'value', 0, 1).name('scale');
        chromaticAberration.add(this._passes.finalPass.uniforms.uCASize, 'value', 0, 5).name('size');
        // chromaticAberration.open();

        const gradients = postProcesingFolder.addFolder('Gradients');
        gradients
            .addColor(params, 'gradient1Color')
            .name('gradient 1 color')
            .listen()
            .onChange(() => {
                this._passes.finalPass.material.uniforms.uGradient1Color.value = new Color(params.gradient1Color);
            });
        gradients.add(this._passes.finalPass.material.uniforms.uGradient1Strength, 'value', 0, 1, 0.01).name('gradient 1 strength').listen();
        gradients.add(this._passes.finalPass.material.uniforms.uGradient1Position.value, 'x', 0, 1, 0.01).name('gradient 1 x').listen();
        gradients.add(this._passes.finalPass.material.uniforms.uGradient1Position.value, 'y', 0, 1, 0.01).name('gradient 1 y').listen();
        gradients.add(this._passes.finalPass.material.uniforms.uGradient1Scale, 'value', 0, 10, 0.01).name('gradient 1 scale').listen();
        gradients
            .addColor(params, 'gradient2Color')
            .name('gradient 2 color')
            .listen()
            .onChange(() => {
                this._passes.finalPass.material.uniforms.uGradient2Color.value = new Color(params.gradient2Color);
            });
        gradients.add(this._passes.finalPass.material.uniforms.uGradient2Strength, 'value', 0, 1, 0.01).name('gradient 2 strength').listen();
        gradients.add(this._passes.finalPass.material.uniforms.uGradient2Position.value, 'x', 0, 1, 0.01).name('gradient 2 x').listen();
        gradients.add(this._passes.finalPass.material.uniforms.uGradient2Position.value, 'y', 0, 1, 0.01).name('gradient 2 y').listen();
        gradients.add(this._passes.finalPass.material.uniforms.uGradient2Scale, 'value', 0, 10, 0.01).name('gradient 2 scale').listen();

        const bottomGradient = postProcesingFolder.addFolder('Bottom gradient');
        bottomGradient.add(this._passes.finalPass.material.uniforms.uBottomGradientStrength, 'value', 0, 1, 0.01).name('strength');
        bottomGradient.add(this._passes.finalPass.material.uniforms.uBottomGradientScale, 'value', 0, 10, 0.01).name('scale');
        bottomGradient
            .addColor(params, 'bottomGradientColor')
            .name('color')
            .listen()
            .onChange(() => {
                this._passes.finalPass.material.uniforms.uBottomGradientColor.value = new Color(params.bottomGradientColor);
            });

        const vignette = postProcesingFolder.addFolder('Vignette');
        vignette.add(this._passes.finalPass.uniforms.uVignetteOffset, 'value', 0, 1, 0.01).name('offset');
        vignette.add(this._passes.finalPass.uniforms.uVignetteDarkness, 'value', 0, 1, 0.01).name('darkness');

        let options;
        const antiAliasingParams = {
            type: 'MSAA + FXAA',
            // sampleLevel: this._passes.ssaaRenderPass.sampleLevel,
        };
        // const antiAliasingOptions = ['NONE', 'MSAA', 'MSAA + SSAA', 'MSAA + FXAA', 'MSAA + SMAA', 'SSAA', 'FXAA', 'SMAA'];
        const antiAliasingOptions = ['NONE', 'MSAA', 'MSAA + FXAA', 'FXAA'];

        const antiAliasing = postProcesingFolder.addFolder('Anti-Aliasing');
        antiAliasing.add(antiAliasingParams, 'type', antiAliasingOptions).onChange(() => {
            if (options) {
                antiAliasing.removeFolder(options);
                options = null;
            }

            this._passes.ssaaRenderPass.enabled = false;
            this._passes.fxaaPass.enabled = false;
            this._passes.smaaPass.enabled = false;

            switch (antiAliasingParams.type) {
                case 'NONE':
                    this._composer.reset(this._renderTarget);
                    break;
                case 'MSAA':
                    this._composer.reset(this._multisampleRenderTarget);
                    break;
                // case 'MSAA + SSAA':
                //     this._passes.ssaaRenderPass.enabled = true;
                //     this._composer.reset(this._multisampleRenderTarget);
                //     options = antiAliasing.addFolder('Options');
                //     options
                //         .add(antiAliasingParams, 'sampleLevel', {
                //             'Level 0: 1 Sample': 0,
                //             'Level 1: 2 Samples': 1,
                //             'Level 2: 4 Samples': 2,
                //             'Level 3: 8 Samples': 3,
                //             'Level 4: 16 Samples': 4,
                //             'Level 5: 32 Samples': 5,
                //         })
                //         .onChange(() => {
                //             this._passes.ssaaRenderPass.sampleLevel = antiAliasingParams.sampleLevel;
                //         });
                //     options.open();
                //     break;
                case 'MSAA + FXAA':
                    this._passes.fxaaPass.enabled = true;
                    this._composer.reset(this._multisampleRenderTarget);
                    break;
                // case 'MSAA + SMAA':
                //     this._passes.smaaPass.enabled = true;
                //     this._composer.reset(this._multisampleRenderTarget);
                //     break;
                // case 'SSAA':
                //     this._composer.reset(this._renderTarget);
                //     this._passes.ssaaRenderPass.enabled = true;
                //     options = antiAliasing.addFolder('Options');
                //     options
                //         .add(antiAliasingParams, 'sampleLevel', {
                //             'Level 0: 1 Sample': 0,
                //             'Level 1: 2 Samples': 1,
                //             'Level 2: 4 Samples': 2,
                //             'Level 3: 8 Samples': 3,
                //             'Level 4: 16 Samples': 4,
                //             'Level 5: 32 Samples': 5,
                //         })
                //         .onChange(() => {
                //             this._passes.ssaaRenderPass.sampleLevel = antiAliasingParams.sampleLevel;
                //         });
                //     options.open();
                //     break;
                case 'FXAA':
                    this._passes.fxaaPass.enabled = true;
                    this._composer.reset(this._renderTarget);
                    break;
                // case 'SMAA':
                //     this._passes.smaaPass.enabled = true;
                //     this._composer.reset(this._renderTarget);
                //     break;
            }
        });
        // antiAliasing.open();
    }
}
