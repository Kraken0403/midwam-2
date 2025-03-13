// Vendor
import {
    LinearFilter,
    Scene,
    WebGLMultisampleRenderTarget,
    Matrix4,
    Vector3,
    DepthTexture,
    DepthFormat,
    UnsignedIntType,
    Color,
    PlaneGeometry,
    Texture,
    RepeatWrapping,
    WebGLRenderTarget,
    RGBFormat,
    OrthographicCamera,
    ShaderMaterial,
    PlaneBufferGeometry,
    Mesh,
    FloatType,
    Vector2,
    RGBAFormat,
    Object3D,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { WEBGL } from 'three/examples/jsm/WebGL';
import { component } from '@/vendor/bidello';
import gsap from 'gsap';

// Utils
import Debugger from '@/utils/Debugger';
import ResourceLoader from '@/utils/ResourceLoader';

// Components
import Landscape from '@/webgl/components/Landscape';

// Objects
import { Reflector } from '@/webgl/objects/Reflector';

// Data
import data from '@/webgl/configs/landscapes';

// Shaders
import revealVertexShader from '@/webgl/shaders/reveal/vertex.glsl';
import revealFragmentShader from '@/webgl/shaders/reveal/fragment.glsl';

// Constants
const FLOOR_OFFSET = 500;

export default class Landscapes extends component(Object3D) {
    init({ debugGui, renderer, cameras }) {
        // Props
        this._renderer = renderer;
        this._cameras = cameras;

        // Debug
        this._debugGui = this._createDebugGui(debugGui);

        // Data
        this._currentIndex = 0;
        this._showReveal = true;
        // this._name = 'landscapes';
        // this._scene = new Scene();
        // this._renderTarget1 = this._createRenderTarget();
        // this._renderTarget2 = this._createRenderTarget2();
        // this._setupPost();
        this._landscapes = this._createLandscapes();
        // this._floor = this._createFloor();

        this.showCurrent = this.showCurrent.bind(this);
        this.hide = this.hide.bind(this);

        this._updateDebugGui();
    }

    /**
     * Getters & Setters
     */
    // get name() {
    //     return this._name;
    // }

    get texture() {
        if (this._showReveal) {
            return this._renderTarget2.texture;
        } else {
            return this._renderTarget1.texture;
        }
    }

    get scanDistance() {
        return this._postMaterial.uniforms.uScanDistance.value;
    }

    set scanDistance(value) {
        this._postMaterial.uniforms.uScanDistance.value = value;
    }

    get scanWidth() {
        return this._postMaterial.uniforms.uScanWidth.value;
    }

    set scanWidth(value) {
        this._postMaterial.uniforms.uScanWidth.value = value;
    }

    get showReveal() {
        return this._showReveal;
    }

    set showReveal(value) {
        this._showReveal = value;
    }

    /**
     * Public
     */
    render() {
        // this._renderer.setRenderTarget(this._renderTarget1);
        // this._renderer.clear(true, true, true);
        // this._renderer.render(this._scene, this._cameras.active);
        // if (this._showReveal) {
        //     this._postMaterial.uniforms.tDiffuse.value = this._renderTarget1.texture;
        //     this._postMaterial.uniforms.uProjectionInverse.value.copy(this._cameras.active.projectionMatrixInverse);
        //     this._postMaterial.uniforms.uViewMatrixInv.value = this._cameras.active.matrixWorld;
        //     this._renderer.setRenderTarget(this._renderTarget2);
        //     this._renderer.clear(true, true, true);
        //     this._renderer.render(this._postScene, this._postCamera);
        // }
    }

    show(index) {
        this._currentIndex = index;
        this._landscapes[this._currentIndex].show();
    }

    showCurrent() {
        this._landscapes[this._currentIndex].show();
    }

    hide(completeCallback) {
        this._landscapes[this._currentIndex].hide(completeCallback);
    }

    cancelHide() {
        this._landscapes[this._currentIndex].cancelHide();
    }

    /**
     * Private
     */
    _createRenderTarget() {
        let renderTarget;

        if (WEBGL.isWebGL2Available()) {
            renderTarget = new WebGLMultisampleRenderTarget(0, 0, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false,
                generateMipmaps: false,
                anisotropy: 0,
            });
        } else {
            renderTarget = new WebGLRenderTarget(0, 0, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false,
                generateMipmaps: false,
                anisotropy: 0,
            });
        }
        renderTarget.texture.encoding = this._renderer.outputEncoding;
        renderTarget.depthBuffer = true;
        renderTarget.depthTexture = new DepthTexture();
        renderTarget.depthTexture.format = DepthFormat;
        renderTarget.depthTexture.type = FloatType;
        return renderTarget;
    }

    _createRenderTarget2() {
        let renderTarget;

        if (WEBGL.isWebGL2Available()) {
            renderTarget = new WebGLMultisampleRenderTarget(0, 0, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBFormat,
                stencilBuffer: false,
                generateMipmaps: false,
                anisotropy: 0,
            });
        } else {
            renderTarget = new WebGLRenderTarget(0, 0, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBFormat,
                stencilBuffer: false,
                generateMipmaps: false,
                anisotropy: 0,
            });
        }
        renderTarget.texture.encoding = this._renderer.outputEncoding;
        return renderTarget;
    }

    _setupPost() {
        this._postCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this._postMaterial = new ShaderMaterial({
            vertexShader: revealVertexShader,
            fragmentShader: revealFragmentShader,
            uniforms: {
                tDiffuse: { value: null },
                tDepth: { value: null },
                uProjectionInverse: { value: new Matrix4() },
                uViewMatrixInv: { value: new Matrix4() },
                uScannerPosition: { value: new Vector3(-2.846818447113037, 0, 3.394998073577881) },
                uScanDistance: { value: 0 },
                uScanColor: { value: new Color(0xf9bf6a) },
                uScanWidth: { value: 0 },
                uScanGradientOffset: { value: 0.5 },
                uScanGradientSize: { value: 0.5 },
                uNoiseScale: { value: 0 },
            },
        });
        this._postMaterial.uniforms.tDepth.value = this._renderTarget1.depthTexture;
        const postPlane = new PlaneBufferGeometry(2, 2);
        const postQuad = new Mesh(postPlane, this._postMaterial);
        this._postScene = new Scene();
        this._postScene.add(postQuad);
    }

    _createLandscapes() {
        const landscapes = [];

        let item;
        let landscape;
        for (let i = 0, len = data.length; i < len; i++) {
            item = data[i];
            landscape = new Landscape({
                data: item,
                show: i === 0,
            });
            // landscape.visible = false;
            // if (i === 0) {
            //     landscape.visible = true;
            // }
            landscapes.push(landscape);
            this.add(landscape);
        }

        return landscapes;
    }

    _createFloor() {
        const roughnessMap = new Texture(ResourceLoader.get('floor-home'));
        roughnessMap.needsUpdate = true;
        roughnessMap.wrapS = RepeatWrapping;
        roughnessMap.wrapT = RepeatWrapping;

        const size = 4000;
        const geometry = new PlaneGeometry(size, size);
        const mesh = new Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: 0,
            textureHeight: 0,
            roughnessMap,
            roughnessMapStrength: 3.85,
            roughnessMapScale: 7.46,
            roughnessMapOffset: new Vector2(4.53, 5.7),
            renderer: this._renderer,
            reflectionStrength: 0.98,
            mipStrength: 0.62,
        });
        mesh.rotation.x = Math.PI * -0.5;
        mesh.position.x = -1400;
        mesh.position.z = -1000;
        mesh.position.z = size * -0.5 + FLOOR_OFFSET;

        this.add(mesh);
        return mesh;
    }

    /**
     * Resize
     */
    onResize({ width, height, dpr }) {
        this._width = width;
        this._height = height;
        this._dpr = dpr;

        // this._resizeReflector();
        // this._resizeRenderTarget();
    }

    _resizeReflector() {
        this._floor.setSize(this._width, this._height);
    }

    _resizeRenderTarget() {
        this._renderTarget1.setSize(this._width, this._height);
        this._renderTarget2.setSize(this._width, this._height);
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Landscapes');
        folder.open();

        return folder;
    }

    _updateDebugGui() {
        if (!this._debugGui) return;

        // const params = {
        //     scanColor: this._postMaterial.uniforms.uScanColor.value.getHex(),
        // };

        // const reveal = this._debugGui.addFolder('Reveal');
        // reveal
        //     .addColor(params, 'scanColor')
        //     .name('scanColor')
        //     .onChange(() => {
        //         this._postMaterial.uniforms.uScanColor.value = new Color(params.scanColor);
        //     });
        // reveal.add(this._postMaterial.uniforms.uScanWidth, 'value', 0, 50, 0.01).name('scan width');
        // reveal.add(this._postMaterial.uniforms.uScanDistance, 'value', 0, 5000, 0.01).name('scan distance');
        // reveal.add(this._postMaterial.uniforms.uScanGradientOffset, 'value', 0, 2, 0.01).name('scan gradient offset');
        // reveal.add(this._postMaterial.uniforms.uScanGradientSize, 'value', 0, 2, 0.01).name('scan gradient size');
        // reveal.add(this._postMaterial.uniforms.uNoiseScale, 'value', 0, 30, 0.01).name('noise size');
        // reveal.add(this, '_showReveal').name('show reveal');
        // reveal.open();

        // const rougnessMap = this._debugGui.addFolder('Roughness');
        // rougnessMap.add(this._floor.material.uniforms.uRoughnessMapStrength, 'value', 0, 50, 0.01).name('roughness map strength');
        // rougnessMap.add(this._floor.material.uniforms.uRoughnessMapScale, 'value', 0, 10, 0.01).name('roughness map scale');
        // rougnessMap.add(this._floor.material.uniforms.uRoughnessMapOffset.value, 'x', 0, 10, 0.01).name('roughness map offset x');
        // rougnessMap.add(this._floor.material.uniforms.uRoughnessMapOffset.value, 'y', 0, 10, 0.01).name('roughness map offset y');
        // rougnessMap.add(this._floor.material.uniforms.uReflectionStrength, 'value', 0, 1, 0.01).name('reflection strength');
        // rougnessMap.add(this._floor.material.uniforms.uMipStrength, 'value', 0, 1, 0.01).name('mip strength');
    }
}
