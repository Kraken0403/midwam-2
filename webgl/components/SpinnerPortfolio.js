// Vendor
import { Object3D, Group, MeshStandardMaterial, MeshBasicMaterial } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';

export default class Spinner extends component(Object3D) {
    constructor({ debugGui, envMap }) {
        super();

        // Props
        this._debugGui = debugGui;
        this._envMap = envMap;

        // Data
        this._rotationAngle = 0;
        this._rotationSpeed = 1;
        this._group = new Group();
        this.add(this._group);
        this._spinner = this._createSpinner();
    }

    destroy() {
        super.destroy();
    }

    /**
     * Getters & Setters
     */
    get rotationSpeed() {
        return this._rotationSpeed;
    }

    set rotationSpeed(value) {
        this._rotationSpeed = value;
    }

    /**
     * Public
     */
    update({ time, delta }) {
        this._updateRotation(time, delta);
    }

    /**
     * Private
     */
    _createSpinner() {
        const gltf = ResourceLoader.get('spinner-portfolio');
        const model = gltf.scene.getObjectByName('spinner');
        model.material = new MeshStandardMaterial({
            envMap: this._envMap,
            roughness: 0,
            metalness: 1,
        });
        const scale = 1.8;
        model.scale.set(scale, scale, scale);
        this._group.add(gltf.scene);
        // this._group.add(model);
        return model;
    }

    _updateRotation(time, delta) {
        this._spinner.rotation.y += 1 * this._rotationSpeed;

        const radius = 0.5;
        this._rotationAngle += delta;
        this._group.position.x = radius * Math.cos(this._rotationAngle);
        this._group.position.z = radius * Math.sin(this._rotationAngle);
    }
}
