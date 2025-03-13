// Vendor
import { Object3D, PlaneBufferGeometry, ShaderMaterial, Mesh, Color, Vector2 } from 'three';
import { component } from '@/vendor/bidello';

// Shaders
import vertexShader from '@/webgl/shaders/reveal-circle/vertex.glsl';
import fragmentShader from '@/webgl/shaders/reveal-circle/fragment.glsl';

export default class RevealCircle extends component(Object3D) {
    init({ debugGui, renderer }) {
        // Props
        this._renderer = renderer;

        // Data
        this._mesh = this._createMesh();
        this._debugGui = this._createDebugGui(debugGui);
    }

    /**
     * Getters & Setters
     */
    get scanDistance() {
        return this._mesh.material.uniforms.uScanDistance.value;
    }

    set scanDistance(value) {
        this._mesh.material.uniforms.uScanDistance.value = value;
    }

    get scanWidth() {
        return this._mesh.material.uniforms.uScanWidth.value;
    }

    set scanWidth(value) {
        this._mesh.material.uniforms.uScanWidth.value = value;
    }

    /**
     * Private
     */
    _createMesh() {
        const size = 4000;
        const geometry = new PlaneBufferGeometry(size, size);
        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uSize: { value: new Vector2(size, size) },
                uScanDistance: { value: 0 },
                uScanColor: { value: new Color(0xf9bf6a) },
                uScanWidth: { value: 0 },
                uScanGradientOffset: { value: 0.5 },
                uScanGradientSize: { value: 0.5 },
            },
        });
        const mesh = new Mesh(geometry, material);
        mesh.rotation.x = Math.PI * -0.5;
        mesh.position.x = -2.71;
        mesh.position.y = 0.12;
        mesh.position.z = 3.47;
        this.add(mesh);
        return mesh;
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Reveal circle');
        folder.add(this.position, 'x', -50, 50, 0.01);
        folder.add(this.position, 'y', -50, 50, 0.01);
        folder.add(this.position, 'z', -50, 50, 0.01);

        return folder;
    }
}
