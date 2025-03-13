// Vendor
import gsap from 'gsap';
import { Object3D, Vector2, Vector3, Color } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';

// Geometries
import { SparksGeometry } from '@/webgl/geometries/SparksGeometry';

// Materials
import { SparksMaterial } from '@/webgl/materials/SparksMaterial';

export default class SparksBurst extends component(Object3D) {
    init() {
        // Data
        this._sparksAmount = 50;
        this._sparksSpeed = 0.164;
        this._isPlayCompleted = false;
        this._alpha = 1;
        this._sparks = this._createSparks();

        // Debug
        // this._debugGui = this._createDebugGui();

        // Setup
        this._bindHandlers();
    }

    /**
     * Getters & Setters
     */
    get alpha() {
        return this._alpha;
    }

    set alpha(value) {
        this._alpha = value;
        this._sparks.material.globalAlpha = this._alpha;
    }

    /**
     * Public
     */
    play() {
        this.visible = true;
        this._isPlayCompleted = false;
        this._tweenPlay = gsap.fromTo(this._sparks.material.uniforms.progress, 10, { value: 0 }, { value: 1, onComplete: this._playCompleteHandler });
    }

    update({ delta }) {
        if (this._isPlayCompleted) return;

        if (this._sparks.material.uniforms.progress.value < 0.001) {
            this.visible = false;
        } else {
            this.visible = true;
        }
        // this._sparks.material.uniforms.time.value += delta * this._sparksSpeed * 0.5;
    }

    reset() {
        if (this._tweenPlay) this._tweenPlay.kill();
        this._sparks.material.uniforms.progress.value = 0;
    }

    /**
     * Triggers
     */
    onResize({ width, height }) {
        this._sparks.material.resolution = new Vector2(width, height);
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._playCompleteHandler = this._playCompleteHandler.bind(this);
    }

    _createSparks() {
        const minSize = 4;
        const maxSize = 10;

        const minSpeed = 0.6;
        const maxSpeed = 1;

        let size;
        let angle;
        let start;
        let speed;
        let color;

        const positions = [];
        const angles = [];
        const offsets = [];
        const sizes = [];
        const speeds = [];
        const colors = [];

        // const colorPool = [new Color(0xff3b00), new Color(0x6103f), new Color(0x480c51)];
        const colorPool = [new Color(0xff3b00)];

        for (let i = 0; i < this._sparksAmount; i++) {
            angle = new Vector3(-1 + Math.random() * 2, 0, -1 + Math.random() * 2);
            angle.normalize();

            start = new Vector3(0, 0, 0);

            // Position start
            positions.push(start.x);
            positions.push(start.y);
            positions.push(start.z);

            // Angles
            angles.push(angle.x);
            angles.push(angle.y);
            angles.push(angle.z);

            // Offsets
            // offsets.push(Math.random());
            offsets.push(0);

            // Offsets
            size = minSize + (maxSize - minSize) * Math.random();
            sizes.push(size);

            // Colors
            color = colorPool[Math.floor(Math.random() * colorPool.length)];
            colors.push(color.r);
            colors.push(color.g);
            colors.push(color.b);

            // Speeds
            speed = minSpeed + (maxSpeed - minSpeed) * Math.random();
            speeds.push(speed);
        }

        const geometry = new SparksGeometry();
        geometry.setPositions(positions);
        geometry.setAngles(angles);
        geometry.setOffsets(offsets);
        geometry.setSizes(sizes);
        geometry.setSpeeds(speeds);
        geometry.setColors(colors);

        const material = new SparksMaterial({
            // color: 0xff3b00,
            linewidth: 0.039,
            resolution: new Vector2(),
            radius: 100,
            burst: true,
            worldUnits: true,
        });

        const mesh = new Line2(geometry, material);
        mesh.position.y = 0.1;
        mesh.frustumCulled = false;
        this.add(mesh);
        return mesh;
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const custom = {
            // color: new Color(this._sparks.material.color).getHex(),
            recreate: () => {
                this.remove(this._sparks);
                this._sparks = this._createSparks();
                this._resize();
            },
        };

        const folder = gui.addFolder('Spinner');
        // folder.addColor(custom, 'color').onChange(() => {
        //     this._sparks.material.color = new Color(custom.color);
        // });
        folder.add(this, '_sparksSpeed', 0, 10, 0.001).name('sparks speed');
        folder.add(this._sparks.material, 'linewidth', 0, 50, 0.001).name('sparks line width');
        folder.add(this, '_sparksAmount').name('sparks amount');
        folder.add(custom, 'recreate').name('recreate');
        folder.open();

        return gui;
    }

    /**
     * Handlers
     */
    _playCompleteHandler() {
        this._isPlayCompleted = true;
        this.visible = false;
    }
}
