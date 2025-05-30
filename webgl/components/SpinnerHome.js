// Vendor
import { Object3D, Euler, Group, Color, Vector3 } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Components
import Sparks from '@/webgl/components/Sparks';
import RevealCircle from '@/webgl/components/RevealCircle';

export default class Spinner extends component(Object3D) {
    init({ debugGui, renderer, material }) {
        // Props
        this._renderer = renderer;

        // Debug
        this._debugGui = this._createDebugGui(debugGui);

        // Data
        this._rotationAngle = 0;
        this._rotationSpeed = 1;

        this._group = new Group();
        this.add(this._group);

        this._envMapRotation = new Euler(0, 4.67, 0);
        this._gltf = ResourceLoader.get('spinner-home');
        this._group.add(this._gltf.scene);

        this._material = this._createMaterial();
        this._mesh = this._createMesh();
        this._sparks = this._createSparks();
        this._revealCircle = this._createRevealCircle();
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

    get sparksSpeed() {
        return this._sparks.speed;
    }

    set sparksSpeed(value) {
        this._sparks.speed = value;
    }

    get emissiveIntensity() {
        return this._material.emissiveIntensity;
    }

    set emissiveIntensity(value) {
        this._material.emissiveIntensity = value;
    }

    get revealCircle() {
        return this._revealCircle;
    }

    /**
     * Public
     */
    update({ time, delta }) {
        this._sparks.update({ time, delta });
        this._updateRotation(time, delta);
    }

    reset() {
        this._material.emissiveIntensity = 0;
        this._sparks.reset();
        this._sparks.start();
    }

    showSparks() {
        return this._sparks.show();
    }

    hideSparks(duration) {
        return this._sparks.hide(duration);
    }

    /**
     * Private
     */
    _createMaterial() {
        const material = new ReflectiveMaterial(
            {
                renderer: this._renderer,
                debugGui: this._debugGui,
            },
            {
                color: 0x888888,
                emissive: 0xf75c0b,
                emissiveIntensity: 0,
                roughness: 0.29,
                metalness: 1,
            }
        );
        return material;
    }

    _createMesh() {
        const model = this._gltf.scene.getObjectByName('spinner');
        model.material = this._material;

        if (model) {
            model.position.set(0,0,0) // ✅ this line
            console.log(model)
        }
    
        return model;
    }

    _createSparks() {
        const sparks = new Sparks({
            debugGui: this._debugGui,
            alpha: 0,
            lineWidth: 0.032,
            amount: 55
        });
        sparks.position.copy(this._mesh.position);
        sparks.start();
        this._group.add(sparks);
        return sparks;
    }

    _createRevealCircle() {
        const revealCircle = new RevealCircle({
            debugGui: this._debugGui,
        });
        this._group.add(revealCircle);
        return revealCircle;
    }

    _updateRotation(time, delta) {
        this._mesh.rotation.y += 1 * this._rotationSpeed;

        const radius = 0.5;
        this._rotationAngle += delta;
        this._group.position.x = radius * Math.cos(this._rotationAngle);
        this._group.position.z = radius * Math.sin(this._rotationAngle);
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Spinner');
        return folder;
    }
}
