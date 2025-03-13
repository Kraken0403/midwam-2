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

export default class Sparks extends component(Object3D) {
    init({ debugGui, alpha, lineWidth }) {
        // Params
        this._alpha = alpha === undefined ? 1 : alpha;

        // Data
        this._amount = 150;
        this._speed = 0.5;
        this._isStarted = false;
        this._lineWidth = lineWidth;
        this._sparks = this._createSparks();

        // Debug
        this._debugGui = this._createDebugGui(debugGui);
    }

    /**
     * Getters & Setters
     */
    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }

    get alpha() {
        return this._sparks.material.globalAlpha;
    }

    set alpha(value) {
        this._alpha = value;
        this._sparks.material.globalAlpha = this._alpha;
    }

    /**
     * Public
     */
    start() {
        this._isStarted = true;
    }

    update({ delta }) {
        if (this._isStarted) {
            this._sparks.material.uniforms.time.value += delta * this._speed * 0.5;
        }
    }

    reset() {
        this._isStarted = false;
        this._sparks.material.uniforms.time.value = 0;
        this.alpha = 0;
    }

    show() {
        if (this._tweenHide) this._tweenHide.kill();
        this._tweenShow = gsap.to(this._sparks.material.uniforms.globalAlpha, 2, { value: 1 });
        return this._tweenShow;
    }

    hide(duration = 2) {
        if (this._tweenShow) this._tweenShow.kill();
        this._tweenHide = gsap.to(this._sparks.material.uniforms.globalAlpha, duration, { value: 0 });
        return this._tweenHide;
    }

    /**
     * Private
     */
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

        const colorPool = [new Color(0xff3b00)];

        for (let i = 0; i < this._amount; i++) {
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
            offsets.push(Math.random());

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
            color: 0xff3b00,
            linewidth: this._lineWidth,
            resolution: new Vector2(),
            radius: 100,
            worldUnits: true,
            globalAlpha: this._alpha,
        });

        const mesh = new Line2(geometry, material);
        mesh.position.y = 0.1;
        mesh.frustumCulled = false;
        this.add(mesh);
        return mesh;
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeSparksMaterial();
    }

    _resizeSparksMaterial() {
        this._sparks.material.resolution = new Vector2(this._width, this._height);
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const custom = {
            color: new Color(this._sparks.material.color).getHex(),
            recreate: () => {
                this.remove(this._sparks);
                this._sparks = this._createSparks();
                this._resizeSparksMaterial();
            },
            reverse: () => {
                gsap.to(this, 1, { _speed: -1 });
            },
        };

        const folder = gui.addFolder('Sparks');
        folder.addColor(custom, 'color').onChange(() => {
            this._sparks.material.color = new Color(custom.color);
        });
        folder.add(this, '_speed', -10, 10, 0.001).name('sparks speed');
        folder.add(this._sparks.material, 'linewidth', 0, 50, 0.001).name('sparks line width');
        folder.add(this, '_amount').name('sparks amount');
        folder.add(custom, 'recreate').name('recreate');
        folder.add(custom, 'reverse');
        // folder.open();

        return folder;
    }
}
