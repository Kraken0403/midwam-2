// Vendor
import gsap from 'gsap';
import { Object3D, Mesh, Euler, MeshBasicMaterial, ShaderMaterial, Color, Vector2 } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';
import Debugger from '@/utils/Debugger';

// Shaders
import heartVertexShader from '@/webgl/shaders/heart/vertex.glsl';
import heartFragmentShader from '@/webgl/shaders/heart/fragment.glsl';

export default class Human extends component(Object3D) {
    init({ debugGui, material }) {
        // Props
        this._material = material;

        // Data
        this._envMapRotation = new Euler(0, 4.67, 0);
        this._mesh = this._createMesh();
        this._heart = this._createHeart();
        this._debugGui = this._createDebugGui(debugGui);
    }

    /**
     * Getters & Setters
     */
    get heart() {
        return this._heart;
    }

    /**
     * Public
     */
    onUpdate({ time }) {
        this._heart.material.uniforms.uTime.value = time;
    }

    showMaskMaterial(material) {
        this._mesh.material = material;
    }

    hideMaskMaterial() {
        this._mesh.material = this._material;
    }

    /**
     * Private
     */
    _createMesh() {
        const gltf = ResourceLoader.get('human');
        const model = gltf.scene.getObjectByName('human');
        const mesh = new Mesh(model.geometry, this._material);
        this.add(mesh);
        return mesh;
    }

    _createHeart() {
        const gltf = ResourceLoader.get('heart');
        const model = gltf.scene.getObjectByName('heart');
        const material = new ShaderMaterial({
            vertexShader: heartVertexShader,
            fragmentShader: heartFragmentShader,
            uniforms: {
                uColor: { value: new Color(0xea7000) },
                uSize: { value: 3.25 },
                uAlpha: { value: 0 },
                uGradientInner: { value: 1 },
                uGradientOuter: { value: 0 },
                uNoiseStrength: { value: 0.05 },
                uPosition: { value: new Vector2(0.563, 0.503) },
                uTime: { value: 0 },
            },
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -30,
            transparent: true,
        });
        const mesh = new Mesh(model.geometry, material);
        mesh.position.z = 0.01;
        this.add(mesh);

        return mesh;
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const params = {
            heartColor: this._heart.material.uniforms.uColor.value.getHex(),
        };

        const folder = gui.addFolder('Human');
        // folder.open();

        const folderHeart = folder.addFolder('Heart');
        folderHeart.add(this._heart.material.uniforms.uSize, 'value', 0, 10, 0.01).name('size');
        folderHeart.add(this._heart.material.uniforms.uAlpha, 'value', 0, 1, 0.01).name('alpha');
        folderHeart.add(this._heart.material.uniforms.uGradientInner, 'value', 0, 1, 0.01).name('gradient inner');
        folderHeart.add(this._heart.material.uniforms.uGradientOuter, 'value', 0, 1, 0.01).name('gradient outer');
        folderHeart.add(this._heart.material.uniforms.uNoiseStrength, 'value', 0, 1, 0.01).name('noise strength');
        folderHeart.add(this._heart.material.uniforms.uPosition.value, 'x', 0, 1, 0.001).name('x');
        folderHeart.add(this._heart.material.uniforms.uPosition.value, 'y', 0, 1, 0.001).name('y');
        folderHeart
            .addColor(params, 'heartColor')
            .name('color')
            .onChange(() => {
                this._heart.material.uniforms.uColor.value = new Color(params.heartColor);
            });
        // folderHeart.open();

        return folder;
    }
}
