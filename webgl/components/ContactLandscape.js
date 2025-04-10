// Vendor
import gsap from 'gsap';
import { Object3D, Vector2, AmbientLight, BoxBufferGeometry, MeshBasicMaterial, Mesh, MeshPhongMaterial, Color } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import ResourceLoader from '@/utils/ResourceLoader';

// Geometries
import { LineSegmentsGeometry } from '@/webgl/geometries/LineSegmentsGeometry.js';

// Materials
import { LineMaterial } from '@/webgl/materials/LineMaterial.js';

// Components
import PillarLogo from '@/webgl/components/PillarLogo';

export default class Landscape extends component(Object3D) {
    init({ debugGui }) {
        // Data
        this._material = this._createMaterial();
        this._lines = this._createLines();
        this._debugGui = this._createDebugGui(debugGui);
        this._pillarLogo = this._createPillarLogo();
        this._ambientLight = this._createAmbientLight();

        // Setup
        this._updateDebugGui();
    }

    /**
     * Public
     */
    show() {
        this._timelineShow = new gsap.timeline();
        // this._timelineShow.fromTo(this._ambientLight, 3, { intensity: 0 }, { intensity: 0.02 }, 0);
        this._timelineShow.add(this._pillarLogo.show(), 0);
        return this._timelineShow;
    }

    /**
     * Private
     */
    _createMaterial() {
        const material = new LineMaterial({
            linewidth: 0.5, // in pixels
            resolution: new Vector2(0, 0),
            dashed: false,
            worldUnits: false,
            vertexColors: false,
            emissive: new Color(0x040202),
        });
        return material;
    }

    _createLines() {
        const model = ResourceLoader.get('city-contact');
        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(model.children[0].geometry.attributes.position.array);
        geometry.setNormals(model.children[0].geometry.attributes.normal.array);
        const mesh = new Line2(geometry, this._material);
        mesh.position.y = 2;
        this.add(mesh);
        return mesh;
    }

    _createPillarLogo() {
        const pillar = new PillarLogo({
            name: 'Piller',
            debugFolder: this._debugGui,
        });
        pillar.position.x = 0;
        pillar.position.z = 0;
        this.add(pillar);
        return pillar;
    }

    _createAmbientLight() {
        const ambient = new AmbientLight(0xffb665);
        ambient.intensity = 0; // 0.02;
        this.add(ambient);
        return ambient;
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeMaterial();
    }

    _resizeMaterial() {
        this._material.resolution = new Vector2(this._width, this._height);
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Landscape');
        folder.add(this._material.uniforms.progress, 'value', 0, 1, 0.01).name('progress');
        folder.add(this._material, 'linewidth', 0, 50, 0.01);
        folder.add(this._material.uniforms.noisyLines, 'value').name('noisyLines');
        folder.open();

        return folder;
    }

    _updateDebugGui() {
        if (!this._debugGui) return;

        const props = {
            ambientLightColor: this._ambientLight.color.getHex(),
        };

        const folderAmbientLight = this._debugGui.addFolder('Ambient light');
        folderAmbientLight
            .addColor(props, 'ambientLightColor')
            .name('color')
            .onChange(() => {
                this._ambientLight.color = new Color(props.ambientLightColor);
            });
        folderAmbientLight.add(this._ambientLight, 'intensity', 0, 1, 0.01);
        folderAmbientLight.open();
    }
}
