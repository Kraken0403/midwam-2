// Vendor
import { PerspectiveCamera, Vector3, AnimationMixer, CameraHelper, AnimationUtils, LoopOnce, MeshBasicMaterial, LoopPingPong } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';

export default class HomeCameras extends component() {
    init({ debugGui, renderer, scene, debug }) {
        // Props
        this._renderer = renderer;
        this._scene = scene;

        // Data
        this._currentStepIndex = 0;
        this._isAnimating = true;
        this._main = this._createMainCamera();
        this._debug = this._createDebugCamera();
        this._debugControls = this._createDebugCameraControls();
        this._active = debug ? this._debug : this._main;
        // this._active = this._main;

        // Debug
        this._debugGui = this._createDebugGui(debugGui);

        // Setup
        this._updateCameraHelpers();
    }

    /**
     * Getters & Setters
     */
    get active() {
        return this._active;
    }

    get main() {
        return this._main;
    }

    get debug() {
        return this._debug;
    }

    onUpdate() {
        // console.log(this._debug.position);
    }

    /**
     * Public
     */
    nextStep() {
        this._goto(this._currentStepIndex);
        this._currentStepIndex++;
        this._currentStepIndex %= this._steps.length;
    }

    /**
     * Private
     */
    _createMainCamera() {
        const camera = new PerspectiveCamera(38.68, 1, 0.1, 10000);
        camera.name = 'main';
        // camera.rotation.x = Math.PI * -0.5;
        camera.rotation.y = Math.PI;

        this._mainHelper = new CameraHelper(camera);
        this._mainHelper.visible = false;
        // this._scene.add(this._mainHelper);

        return camera;
    }

    _createDebugCamera() {
        const y = 2;
        const camera = new PerspectiveCamera(50, 1, 0.01, 10000);
        camera.position.set(0, y, 16);
        camera.name = 'debug';
        camera.lookAt(new Vector3(0, y, 0));
        return camera;
    }

    _createDebugCameraControls() {
        const controls = new OrbitControls(this._debug, this._renderer.domElement);
        controls.enabled = false;
        controls.target = new Vector3(0, this._debug.position.y, 0);
        controls.screenSpacePanning = true;
        controls.update();
        return controls;
    }

    _updateCameraHelpers() {
        if (this._active.name === 'main') {
            this._mainHelper.visible = false;
            this._debugControls.enabled = false;
        } else {
            this._mainHelper.visible = true;
            this._debugControls.enabled = true;
        }
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeMain();
        this._resizeDebug();
    }

    _resizeMain() {
        this._main.aspect = this._width / this._height;
        this._main.updateProjectionMatrix();
        this._mainHelper.update();
    }

    _resizeDebug() {
        this._debug.aspect = this._width / this._height;
        this._debug.updateProjectionMatrix();
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const params = {
            camera: this._active.name,
        };

        const cameras = {
            main: this._main,
            debug: this._debug,
        };

        const folder = gui.addFolder('Cameras');
        folder
            .add(params, 'camera', Object.keys(cameras))
            .name('active')
            .onChange(() => {
                this._active = cameras[params.camera];
                this._updateCameraHelpers();
            });
        folder
            .add(this._main, 'fov', 0, 180, 0.01)
            .listen()
            .onChange(() => {
                this._main.updateProjectionMatrix();
                this._mainHelper.update();
            });
        // folder.open();

        return folder;
    }
}
