// Vendor
import gsap from 'gsap';
import { Object3D, Euler, AnimationMixer, LoopOnce, Group, AnimationUtils } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Components
import Sparks from '@/webgl/components/Sparks';
import SparksBurst from '@/webgl/components/SparksBurst';

export default class Spinner extends component(Object3D) {
    constructor({ debugGui, material }) {
        super();

        // Props
        this._debugGui = debugGui;

        // Data
        this._rotationAngle = 0;
        this._rotationSpeed = 0.9;
        this._envMapRotation = new Euler(0, 4.67, 0);
        this._alpha = 1;

        this._material = this._createMaterial();

        this._container = new Group();
        this.add(this._container);

        this._gltf = ResourceLoader.get('spinner-services');
        this._gltf.animations[0].tracks.splice(1, 1); // Remove rotation

        this._container.add(this._gltf.scene);

        this._mesh = this._createMesh();
        this._mixer = new AnimationMixer(this._gltf.scene);

        this._action = this._createAction();

        this._sparksGroup = new Group();
        this._container.add(this._sparksGroup);

        this._sparks = this._createSparks();
        this._sparksBurst1 = this._createSparksBurst();
        this._sparksBurst2 = this._createSparksBurst();
    }

    destroy() {
        super.destroy();
        if (this._timelinePlay) this._timelinePlay.kill();
    }

    /**
     * Getters & Setters
     */
    get alpha() {
        return this._alpha;
    }

    set alpha(value) {
        this._alpha = value;
        this._material.opacity = this._alpha;
        this._sparks.alpha = this._alpha;
        this._sparksBurst1.alpha = this._alpha;
        this._sparksBurst2.alpha = this._alpha;
    }

    /**
     * Public
     */
    update({ time, delta }) {
        this._mixer.update(delta);
        this._sparks.update({ time, delta });
        this._sparksBurst1.update({ time, delta });
        this._sparksBurst2.update({ time, delta });
        this._updateSparksPosition();
        this._updateRotation(time, delta);
    }

    play() {
        this._timelinePlay = new gsap.timeline();
        this._timelinePlay.call(() => this._action.play(), null, 0);
        this._timelinePlay.call(() => this._sparksBurst1.play(), null, 1.58);
        this._timelinePlay.call(() => this._sparksBurst2.play(), null, 2.22);
        this._timelinePlay.call(() => this._sparks.start(), null, 2.22);
        return this._timelinePlay;
    }

    reset() {
        this._action.stop();
        this._sparksBurst1.reset();
        this._sparksBurst2.reset();
        this._sparks.reset();
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
                roughness: 0.29, // 0,
                metalness: 1,
                opacity: this._alpha,
            }
        );
        return material;
    }

    _createMesh() {
        const model = this._gltf.scene.getObjectByName('spinner');
        model.material = this._material;
        model.rotation.x = 0;
        model.rotation.y = 0;
        model.rotation.z = 0;
        return model;
    }

    _createAction() {
        // const action = this._mixer.clipAction(this._gltf.animations[0]);
        const clip = AnimationUtils.subclip(this._gltf.animations[0], 'drop', 0, 80);
        const action = this._mixer.clipAction(clip);
        action.setLoop(LoopOnce);
        action.clampWhenFinished = true;
        return action;
    }

    _createSparks() {
        const sparks = new Sparks({
            debugGui: this._debugGui,
            lineWidth: 0.039,
            alpha: 0,
        });
        this._sparksGroup.add(sparks);
        return sparks;
    }

    _createSparksBurst() {
        const burst = new SparksBurst();
        this._sparksGroup.add(burst);
        return burst;
    }

    _updateSparksPosition() {
        this._sparksGroup.position.x = this._mesh.position.x;
        this._sparksGroup.position.z = this._mesh.position.z;
    }

    _updateRotation(time, delta) {
        this._mesh.rotation.y += 1 * this._rotationSpeed;

        const radius = 0.2;
        this._rotationAngle += delta;
        this._container.position.x = radius * Math.cos(this._rotationAngle);
        this._container.position.z = radius * Math.sin(this._rotationAngle);
    }
}
