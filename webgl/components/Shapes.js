// Vendor
import { Object3D } from 'three';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

export default class Shapes extends Object3D {
    constructor({ debugGui, camera, orbitControls, renderer }) {
        super();

        // Props
        this._camera = camera;
        this._orbitControls = orbitControls;
        this._renderer = renderer;

        // Debug
        this._debugGui = this._createDebugGui(debugGui);

        // Data
        this._angle = 0;
        this._material = this._createMaterial();
        this._elements = this._createElements();
    }

    /**
     * Getters & Setters
     */
    get opacity() {
        return this._material.opacity;
    }

    set opacity(value) {
        this._material.opacity = value;
    }

    /**
     * Public
     */
    update() {
        let item;

        this._angle += 0.002;

        for (let i = 0, len = this._elements.length; i < len; i++) {
            item = this._elements[i];
            item.rotation.x += 0.002 * item.userData.rotationSpeed;
            item.rotation.y += 0.002 * item.userData.rotationSpeed;
            item.rotation.z += 0.002 * item.userData.rotationSpeed;

            const x = item.userData.originalPosition.x + item.userData.radius * Math.cos(item.userData.startAngle + this._angle * item.userData.speed * item.userData.direction);
            const y = item.userData.originalPosition.y + item.userData.radius * Math.sin(item.userData.startAngle + this._angle * item.userData.speed * item.userData.direction);
            item.position.x = x;
            item.position.y = y;
            item.position.z = item.userData.originalPosition.z;
        }
    }

    /**
     * Private
     */
    _createMaterial() {
        const material = new ReflectiveMaterial(
            {
                renderer: this._renderer,
                debugGui: this._debugGui,
                thickness: 0.011,
            },
            {
                color: 0x888888,
                emissive: 0xf75c0b,
                emissiveIntensity: 0,
                roughness: 0,
                metalness: 1,
            }
        );
        return material;
    }

    _createElements() {
        const elements = [];

        const gltf = ResourceLoader.get('shapes');
        const shapes = gltf.scene.children;

        this.add(gltf.scene);

        const angleStep = (Math.PI * 2) / shapes.length;

        let mesh;
        let angle = 0;
        for (let i = 0, len = shapes.length; i < len; i++) {
            mesh = shapes[i];
            mesh.material = this._material;

            mesh.userData.rotationSpeed = 0.5 + Math.random() * 0.5;
            mesh.userData.originalPosition = mesh.position.clone();

            mesh.position.x = 0;
            mesh.position.y = 0;
            mesh.position.z = 0;

            mesh.userData.startAngle = angle + (-0.25 + Math.random() * 0.5);
            mesh.userData.radius = 0.5 + 0.5 * Math.random();
            mesh.userData.speed = 1 + 1 * Math.random();
            mesh.userData.z = -5 + i * -1;
            mesh.userData.direction = Math.random() > 0.5 ? 1 : -1;

            angle += angleStep;

            elements.push(mesh);
        }
        return elements;
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Shapes');
        return folder;
    }
}
