// Vendor
import { Scene, PerspectiveCamera, Vector3 } from 'three';
import { component } from '@/vendor/bidello';

export default class Empty extends component(Scene) {
    init() {
        this._camera = this._createCamera();
    }

    /**
     * Getters
     */
    get camera() {
        return this._camera;
    }

    /**
     * Public
     */
    show() {
        return null;
    }

    hide() {
        return null;
    }

    /**
     * Private
     */
    _createCamera() {
        const camera = new PerspectiveCamera(30, 1, 0.1, 10000);
        camera.lookAt(new Vector3(0, 0, 0));
        return camera;
    }
}
