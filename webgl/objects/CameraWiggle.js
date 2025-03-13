// Vendor
import { Object3D } from 'three';
import { component } from '@/vendor/bidello';
import SimplexNoise from 'simplex-noise';

// Utils
import math from '@/utils/math';
import easing from '@/utils/easing';

export default class CameraWiggle extends component(Object3D) {
    init({ debugGui, element }) {
        // Data
        this._smoothParams = {
            time: 0,
            positionStrength: 0.05,
            rotationStrength: 0.002,
            speed: 0.496,
        };
        this._roughParams = {
            progress: 0,
            speed: 0.34,
            radius: 0.03,
        };
        this._roughParams.start = this._getRougePoint();
        this._roughParams.end = this._getRougePoint();
        this._progress = 0;
        this._totalStrength = 0;
        this._simplex = new SimplexNoise();

        // Setup
        this._smoothContainer = this._createSmoothContainer();
        this._smoothContainer.add(element);
        this._roughContainer = this._createRoughContainer();
        this._roughContainer.add(this._smoothContainer);
        this._debugGui = this._createDebugGui(debugGui);
    }

    /**
     * Getters & Setters
     */
    get progress() {
        return this._progress;
    }

    set progress(value) {
        this._progress = value;
    }

    get strength() {
        return this._totalStrength;
    }

    set strength(value) {
        this._totalStrength = value;
    }

    /**
     * Update cycle
     */
    onUpdate({ delta }) {
        this._updateSmoothWiggle(delta);
        this._updateRoughWiggle();
    }

    _updateSmoothWiggle(delta) {
        this._smoothParams.time += delta * this._smoothParams.speed;

        const x = this._simplex.noise2D(this._smoothParams.time, this._smoothParams.time) * this._smoothParams.positionStrength;
        const y = this._simplex.noise2D(this._smoothParams.time, -this._smoothParams.time) * this._smoothParams.positionStrength;
        const z = this._simplex.noise2D(-this._smoothParams.time, -this._smoothParams.time) * this._smoothParams.positionStrength * 0.5;
        const rotation = this._simplex.noise2D(-this._smoothParams.time, this._smoothParams.time) * this._smoothParams.rotationStrength;

        this._smoothContainer.position.x = x * (1 - this._progress) * this._totalStrength;
        this._smoothContainer.position.y = y * (1 - this._progress) * this._totalStrength;
        this._smoothContainer.position.z = z * (1 - this._progress) * this._totalStrength;
        this._smoothContainer.rotation.z = rotation * (1 - this._progress) * this._totalStrength;
    }

    _updateRoughWiggle() {
        this._roughParams.progress += this._roughParams.speed;

        const progress = easing.easeInOutQuad(this._roughParams.progress);
        const x = math.lerp(this._roughParams.start.x, this._roughParams.end.x, progress);
        const y = math.lerp(this._roughParams.start.y, this._roughParams.end.y, progress);
        const z = math.lerp(this._roughParams.start.z, this._roughParams.end.z, progress);

        if (this._roughParams.progress > 1) {
            this._roughParams.progress = 0;
            this._roughParams.start = this._roughParams.end;
            this._roughParams.end = this._getRougePoint();
        }

        this._roughContainer.rotation.x = x * this._progress * this._totalStrength * 0.2;
        this._roughContainer.rotation.y = y * this._progress * this._totalStrength * 0.2;
        this._roughContainer.rotation.z = z * this._progress * this._totalStrength * 0.2;

        this._roughContainer.position.x = x * this._progress * this._totalStrength;
        this._roughContainer.position.y = y * this._progress * this._totalStrength;
        this._roughContainer.position.z = z * this._progress * this._totalStrength;
    }

    /**
     * Private
     */
    _createSmoothContainer() {
        const container = new Object3D();
        this.add(container);
        return container;
    }

    _createRoughContainer() {
        const container = new Object3D();
        this.add(container);
        return container;
    }

    _getRougePoint() {
        const theta = Math.PI * 2 * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        const x = this._roughParams.radius * Math.sin(phi) * Math.cos(theta);
        const y = this._roughParams.radius * Math.sin(phi) * Math.sin(theta);
        const z = this._roughParams.radius * Math.cos(phi);
        return { x, y, z };
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Wiggle');
        folder.add(this, '_progress', 0, 1, 0.01).name('progress');

        const folderSmooth = folder.addFolder('Smooth');
        folderSmooth.add(this._smoothParams, 'positionStrength', 0, 1, 0.001);
        folderSmooth.add(this._smoothParams, 'rotationStrength', 0, 1, 0.001);
        folderSmooth.add(this._smoothParams, 'speed', 0, 1, 0.001);

        const folderRough = folder.addFolder('Rough');
        folderRough.add(this._roughParams, 'speed', 0, 2, 0.01);
        folderRough.add(this._roughParams, 'radius', 0, 1, 0.001);

        return folder;
    }
}
