// Vendor
import gsap from 'gsap';
import {
    Object3D,
    Vector2,
    Color,
    AmbientLight,
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
    PointLight,
    Mesh,
    BoxBufferGeometry,
    MeshBasicMaterial,
    CubeTextureLoader,
    sRGBEncoding,
} from 'three';
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
import Pillar from '@/webgl/components/Pillar';

export default class Landscape extends component(Object3D) {
    init({ data, show }) {
        // Props
        this._data = data;
        this._show = show;

        // Data
        this._lines = this._createLines();
        // this._ambientLight = this._createAmbientLight();
        this._debug = this._createDebugGui();
        this._pillars = this._createPillars();
        this._lights = this._createLights();

        if (!this._show) this.position.x = 5000;

        this._bindHandlers();
    }

    /**
     * Public
     */
    show() {
        this.position.x = 0;

        if (this._timelineHide) this._timelineHide.kill();
        this._timelineShow = new gsap.timeline();
        // this._timelineShow.set(this, { visible: true }, 0);

        // let item;
        // for (let i = 0, len = this._lines.length; i < len; i++) {
        //     item = this._lines[i];
        //     this._timelineShow.fromTo(item.material.uniforms.alpha, 3, { value: 0 }, { value: item.material.userData.originalAlpha }, 0.5);
        // }

        let item;
        for (let i = 0, len = this._pillars.length; i < len; i++) {
            item = this._pillars[i];
            this._timelineShow.add(item.show(), 0);
        }

        for (let i = 0, len = this._lights.length; i < len; i++) {
            item = this._lights[i];
            this._timelineShow.to(item, 0.25, { distance: this._data.lights[i].distance, ease: 'power3.out' }, 0);
        }

        this._timelineShow.timeScale(0.35);

        return this._timelineShow;
    }

    hide(completeCallback) {
        if (this._timelineShow) this._timelineShow.kill();
        this._timelineHide = new gsap.timeline({ onComplete: this._timelineHideCompleteHandler, onCompleteParams: [completeCallback] });

        // let item;
        // for (let i = 0, len = this._lines.length; i < len; i++) {
        //     item = this._lines[i];
        //     this._timelineHide.to(item.material.uniforms.alpha, 1, { value: 0 }, 0.5);
        // }

        let item;
        for (let i = 0, len = this._pillars.length; i < len; i++) {
            item = this._pillars[i];
            this._timelineHide.add(item.hide(), 0);
        }

        for (let i = 0, len = this._lights.length; i < len; i++) {
            item = this._lights[i];
            this._timelineHide.to(item, 0.652, { distance: 0.001, ease: 'power3.out' }, 0.25);
        }

        this._timelineHide.timeScale(1.1);

        // this._timelineHide.call(completeCallback, null, 0.85);

        return this._timelineHide;
    }

    cancelHide() {
        if (this._timelineHide) this._timelineHide.reverse();
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._timelineHideCompleteHandler = this._timelineHideCompleteHandler.bind(this);
    }

    _createMaterial() {
        const material = new LineMaterial({
            linewidth: 1.27, // in pixels
            resolution: new Vector2(0, 0),
            dashed: false,
            worldUnits: false,
            vertexColors: false,
            specular: new Color(0x666600),
            emissive: new Color(0x3a1c01),
            specularStrength: 0.47,
            shininess: 30,
        });
        return material;
    }

    _createLines() {
        const model = ResourceLoader.get(this._data.name);
        const children = model.children;
        const elements = [];

        let item;
        for (let i = 0, len = children.length; i < len; i++) {
            item = children[i];
            const geometry = new LineSegmentsGeometry();
            geometry.setPositions(item.geometry.attributes.position.array);
            const material = new LineMaterial({
                linewidth: this._data.lines[i].lineWidth, // in pixels
                resolution: new Vector2(0, 0),
                dashed: false,
                worldUnits: false,
                vertexColors: false,
                specular: new Color(0x666600),
                emissive: new Color(this._data.lines[i].emissive),
                specularStrength: 0.47,
                shininess: 30,
            });
            material.uniforms.noisyLines.value = this._data.lines[i].noisyLines;
            // material.uniforms.alpha.value = 0;
            // material.userData.originalAlpha = this._data.lines[i].alpha;
            const mesh = new Line2(geometry, material);
            this.add(mesh);
            elements.push(mesh);
        }

        return elements;
    }

    _createPillars() {
        const pillars = [];

        let item;
        for (let i = 0, len = this._data.pillars.length; i < len; i++) {
            item = this._data.pillars[i];
            const pillar = new Pillar({
                data: item,
                name: 'Piller ' + (i + 1),
                show: this._show,
                debugFolder: this._debug,
            });
            pillar.position.x = item.position.x;
            pillar.position.z = item.position.z;
            this.add(pillar);
            pillars.push(pillar);
        }

        return pillars;
    }

    _createLights() {
        if (!this._data.lights) return;

        const lights = [];

        let item;
        for (let i = 0, len = this._data.lights.length; i < len; i++) {
            item = this._data.lights[i];
            const distance = this._show ? item.distance : 0.001;
            const light = new PointLight(item.color, item.intensity, distance, item.decay);
            light.position.x = item.position.x;
            light.position.y = item.position.y;
            light.position.z = item.position.z;
            this.add(light);
            lights.push(light);

            if (this._debug) {
                const custom = {
                    color: light.color.getHex(),
                };

                const debug = this._debug.addFolder('Pointlight ' + (i + 1));
                debug.add(light.position, 'x', -5000, 5000, 0.01).listen();
                debug.add(light.position, 'y', -5000, 5000, 0.01).listen();
                debug.add(light.position, 'z', -5000, 5000, 0.01).listen();
                debug
                    .addColor(custom, 'color')
                    .name('color')
                    .onChange(() => {
                        light.color = new Color(custom.color);
                    });
                debug.add(light, 'intensity', 0, 10, 0.01);
                debug.add(light, 'distance', 0, 5000, 0.01);
                debug.add(light, 'decay', 0, 100, 0.01);

                const debugMesh = new Mesh(new BoxBufferGeometry(5, 5, 5), new MeshBasicMaterial({ color: 0x0000ff }));
                light.add(debugMesh);
            }
        }

        return lights;
    }

    _createAmbientLight() {
        const ambientLight = new AmbientLight(0x9e765f);
        // ambientLight.intensity = this._show ? 0.02 : 0;
        ambientLight.intensity = 0; // 0.07;
        // this.add(ambientLight);
        return ambientLight;
    }

    _createTimelineShow() {}

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeMaterial();
    }

    _resizeMaterial() {
        let item;
        for (let i = 0, len = this._lines.length; i < len; i++) {
            item = this._lines[i];
            item.material.resolution = new Vector2(this._width, this._height);
        }
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        // const custom = {
        //     ambientLight: this._ambientLight.color.getHex(),
        // };

        const folderLandscapes = gui.getFolder('Landscapes');
        const folder = folderLandscapes.addFolder('Landscape: ' + this._data.name);

        folder.add(this, 'show');
        folder.add(this, 'hide');
        folder.add(this, '_export').name('export');

        let item;
        for (let i = 0, len = this._lines.length; i < len; i++) {
            item = this._lines[i];

            const custom = {
                specular: item.material.uniforms.specular.value.getHex(),
                emissive: item.material.uniforms.emissive.value.getHex(),
            };

            const folderMaterial = folder.addFolder('Material ' + (i + 1));
            folderMaterial.add(item.material.uniforms.progress, 'value', 0, 1, 0.01).name('progress');
            folderMaterial.add(item.material, 'linewidth', 0, 50, 0.01);
            folderMaterial.add(item.material.uniforms.noisyLines, 'value').name('noisyLines');
            folderMaterial.add(item.material.uniforms.alpha, 'value', 0, 1, 0.01).name('alpha');
            folderMaterial
                .addColor(custom, 'specular')
                .name('specular')
                .onChange(() => {
                    this._lines[i].material.uniforms.specular.value = new Color(custom.specular);
                });
            folderMaterial.add(item.material.uniforms.specularStrength, 'value', 0, 1, 0.01).name('specular strength');
            folderMaterial
                .addColor(custom, 'emissive')
                .name('emissive')
                .onChange(() => {
                    this._lines[i].material.uniforms.emissive.value = new Color(custom.emissive);
                });

            folderMaterial.add(item.material.uniforms.shininess, 'value', 0, 1000, 0.01).name('shininess');

            // folderMaterial.add(item.material, 'blending', blends).onChange(() => {
            //     item.material.needsUpdate = true;
            // });
        }

        // folder.open();

        // const folderAmbientLight = folder.addFolder('Ambient light');
        // folderAmbientLight
        //     .addColor(custom, 'ambientLight')
        //     .name('color')
        //     .onChange(() => {
        //         this._ambientLight.color = new Color(custom.ambientLight);
        //     });
        // folderAmbientLight.add(this._ambientLight, 'intensity', 0, 10, 0.01);
        // folderAmbientLight.open();

        return folder;
    }

    _export() {
        const data = {};

        const pillars = [];
        let item;
        let itemData;
        for (let i = 0, len = this._pillars.length; i < len; i++) {
            item = this._pillars[i];

            itemData = {
                noisyLines: item._lines.material.uniforms.noisyLines.value,
                lineWidth: item._lines.material.linewidth,
                emissive: '#' + item._lines.material.uniforms.emissive.value.getHexString(),
                alpha: item._lines.material.uniforms.alpha.value,
                position: {
                    x: item.position.x,
                    y: item.position.y,
                    z: item.position.z,
                },
                pointLight: {
                    color: '#' + item._pointLight.color.getHexString(),
                    intensity: item._pointLight.intensity,
                    distance: item._pointLight.distance,
                    decay: item._pointLight.decay,
                },
                particles: {
                    color: '#' + item._particles.material.uniforms.uColor.value.getHexString(),
                    rotationSpeed: item._particlesRotationSpeed,
                    movementSpeed: item._particlesMovementSpeed,
                },
                coreLines: {
                    lineWidth: item._coreLines.material.linewidth,
                    color: '#' + item._coreLines.material.color.getHexString(),
                },
            };

            pillars.push(itemData);
        }
        data.pillars = pillars;

        const lines = [];
        for (let i = 0, len = this._lines.length; i < len; i++) {
            const item = this._lines[i];
            itemData = {
                noisyLines: item.material.uniforms.noisyLines.value,
                lineWidth: item.material.linewidth,
                emissive: '#' + item.material.uniforms.emissive.value.getHexString(),
                alpha: item.material.uniforms.alpha.value,
            };
            lines.push(itemData);
        }
        data.lines = lines;

        const lights = [];
        for (let i = 0, len = this._lights.length; i < len; i++) {
            const item = this._lights[i];
            itemData = {
                position: {
                    x: item.position.x,
                    y: item.position.y,
                    z: item.position.z,
                },
                color: '#' + item.color.getHexString(),
                intensity: item.intensity,
                distance: item.distance,
                decay: item.decay,
            };
            lights.push(itemData);
        }
        data.lights = lights;

        const output = JSON.stringify(data, null, 4);
        console.log(output);
        // window.prompt('Landscape', JSON.stringify(data));
    }

    /**
     * Handlers
     */
    _timelineHideCompleteHandler(completeCallback) {
        this.position.x = 5000;
        // this.visible = false;
        if (completeCallback) completeCallback();
    }
}
