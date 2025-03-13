// Vendor
import { Object3D, Mesh, MeshBasicMaterial, PlaneBufferGeometry, SpotLight, SphereBufferGeometry } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';

export default class Lights extends component(Object3D) {
    init({ debugGui }) {
        // Props

        // Data
        this._lights = this._createLights();
        // this._debugGui = this._createDebugGui(debugGui);

        this.position.z = -15;
    }

    /**
     * Public
     */
    update({ time }) {
        this._updatePosition(time);
    }

    /**
     * Private
     */
    _createLights() {
        const lights = {};

        lights.spotLight1 = new SpotLight(0x4002fb);
        lights.spotLight1.position.y = 30;
        lights.spotLight1.add(new Mesh(new SphereBufferGeometry(0.1, 16, 16), new MeshBasicMaterial({ color: 0xff0000 })));
        // this.add(lights.spotLight1);

        lights.spotLight2 = new SpotLight(0xeb9e1c);
        lights.spotLight2.position.y = 30;
        lights.spotLight2.add(new Mesh(new SphereBufferGeometry(0.1, 16, 16), new MeshBasicMaterial({ color: 0xffff00 })));
        // this.add(lights.spotLight2);

        return lights;
    }

    _updatePosition(time) {
        {
            const radius = 10;
            const angle = time * 0.5;
            const x = radius * Math.cos(angle);
            const y = 15 + radius * Math.sin(angle);
            this._lights.spotLight1.position.x = x;
            this._lights.spotLight1.position.z = y;
        }

        {
            const radius = 10;
            const angle = Math.PI + time * 0.5;
            const x = radius * Math.cos(angle);
            const y = 15 + radius * Math.sin(angle);
            this._lights.spotLight2.position.x = x;
            this._lights.spotLight2.position.z = y;
        }
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Lights');
        // folder.open();

        return folder;
    }
}
