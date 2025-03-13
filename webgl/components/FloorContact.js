// Vendor
import { Object3D, Mesh, MeshBasicMaterial, PlaneBufferGeometry, PlaneGeometry, Color, RepeatWrapping, Texture, Vector3, Vector2 } from 'three';
import { component } from '@/vendor/bidello';

// Objects
import { Reflector } from '@/webgl/objects/Reflector';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';
import Debugger from '@/utils/Debugger';

export default class FloorContact extends component(Object3D) {
    init({ debugGui, width, height, renderer }) {
        // Props
        this._width = width;
        this._height = height;
        this._renderer = renderer;

        // Data
        this._mesh = this._createMesh();
        this._debugGui = this._createDebugGui(debugGui);
    }

    /**
     * Private
     */
    _createMesh() {
        const roughnessMap = new Texture(ResourceLoader.get('floor'));
        roughnessMap.needsUpdate = true;
        roughnessMap.wrapS = RepeatWrapping;
        roughnessMap.wrapT = RepeatWrapping;

        const geometry = new PlaneGeometry(this._width, this._height);
        // const material = new MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: 0,
            textureHeight: 0,
            roughnessMap,
            roughnessMapStrength: 7.85,
            roughnessMapScale: 4.22,
            roughnessMapOffset: new Vector2(4.47, 6.86),
            renderer: this._renderer,
            reflectionStrength: 1,
            mipStrength: 1,
        });
        // const mesh = new Mesh(geometry, material);
        mesh.rotation.x = Math.PI * -0.5;
        // mesh.position.z = size * -0.5 + 40;
        this.add(mesh);
        return mesh;
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._resizeReflector(width, height);
    }

    _resizeReflector(width, height) {
        this._mesh.setSize(width, height);
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Floor');
        folder.add(this._mesh.material.uniforms.uRoughnessMapStrength, 'value', 0, 10, 0.01).name('roughness map strength');
        folder.add(this._mesh.material.uniforms.uRoughnessMapScale, 'value', 0, 10, 0.01).name('roughness map scale');
        folder.add(this._mesh.material.uniforms.uRoughnessMapOffset.value, 'x', 0, 10, 0.01).name('roughness map offset x');
        folder.add(this._mesh.material.uniforms.uRoughnessMapOffset.value, 'y', 0, 10, 0.01).name('roughness map offset y');
        folder.add(this._mesh.material.uniforms.uReflectionStrength, 'value', 0, 1, 0.01).name('reflection strength');
        folder.add(this._mesh.material.uniforms.uMipStrength, 'value', 0, 1, 0.01).name('mip strength');
        // folder.open();

        return folder;
    }
}
