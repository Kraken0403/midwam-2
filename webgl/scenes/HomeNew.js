// Vendor
import { Scene } from 'three';
import * as THREE from 'three';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Objects
import Cameras from '@/webgl/objects/HomeCameras';

// Components
import Spinner from '@/webgl/components/SpinnerHome';
import Floor from '@/webgl/components/Floor';

// Managers
import HomeNewSectionManager from '@/webgl/objects/HomeNewSectionManager'; // NEW SECTION MANAGER

export default class HomeNew extends component(Scene) {
    init({ renderer, nuxtRoot, postProcessing, debug }) {
        this._renderer = renderer;
        this._nuxtRoot = nuxtRoot;
        this._postProcessing = postProcessing;
        this._debug = debug;

        this._isActive = false;

        this._debugGui = this._createDebugGui();
        this._cameras = this._createCameras();
        this._reflectiveMaterial = this._createReflectiveMaterial();
        this._components = this._createComponents();

        this._bindHandlers();

        // Section manager!
        Object.assign(this, HomeNewSectionManager);

        this._currentSectionIndex = 0; // initialize
    }

    destroy() {
        super.destroy();
    }

    get camera() {
        return this._cameras.active;
    }

    onUpdate({ time, delta }) {
        if (!this._isActive) return;
    
        this._updateComponents({ time, delta });
    
        const scrollY = this._nuxtRoot.scrollControl?.position?.y || 0;
        const scrollHeight = this._nuxtRoot.scrollControl?.$el?.scrollHeight || 1;
        const viewportHeight = window.innerHeight || 1;
        const progress = scrollY / (scrollHeight - viewportHeight);
    
        const sectionCount = 3; // 3 sections
        const sectionProgress = progress * sectionCount;
    
        if (!this._components.spinner) return;
    
        // Camera default position
        let cameraX = 0;
        let cameraY = 5;
        let cameraZ = 14; // farther back than before
    
        let spinnerX = 0;
    
        if (sectionProgress < 1) {
            // SECTION 1: Hero
            const t = sectionProgress;
            cameraY = 6 - t * 2; 
            cameraZ = 14 - t * 4;
            spinnerX = 0; // centered
        } 
        else if (sectionProgress >= 1 && sectionProgress < 2) {
            // SECTION 2: Content on Right, Spinner moves Left
            const t = sectionProgress - 1;
            cameraY = 4;
            cameraZ = 10;
            spinnerX = -2.5 * t; // spinner shifts to left gradually
        } 
        else if (sectionProgress >= 2) {
            // SECTION 3: (future sections - optional)
            cameraY = 4;
            cameraZ = 10;
            spinnerX = -2.5; // fixed left
        }
    
        this.camera.position.set(cameraX, cameraY, cameraZ);
        this._components.spinner.position.x = spinnerX;
        this.camera.lookAt(this._components.spinner.position);
    }
    

    show() {
        this._isActive = true;
        this._updatePostProcessing();
        this._reset();
    }

    hide(onCompleteCallback) {
        this._isActive = false;
        if (onCompleteCallback) onCompleteCallback();
    }

    _bindHandlers() {}

    _createCameras() {
        const cameras = new Cameras({
            debugGui: this._debugGui,
            renderer: this._renderer,
            debug: this._debug,
            scene: this,
        });
        return cameras;
    }

    _createReflectiveMaterial() {
        const material = new ReflectiveMaterial(
            {
                renderer: this._renderer,
                debugGui: this._debugGui,
                normalNoiseStrength: 0.8,
            },
            {
                color: 0x111111,
                emissive: 0x000000,
                roughness: 0.1,
                metalness: 1,
            }
        );
        return material;
    }

    _createComponents() {
        const components = {};
        components.spinner = this._createComponentSpinner();
        components.floor = this._createComponentFloor();
        return components;
    }

    _createComponentSpinner() {
        const spinner = new Spinner({
            debugGui: this._debugGui,
            renderer: this._renderer,
            material: this._reflectiveMaterial,
        });
        spinner.scale.set(0.8, 0.8, 0.8);
        spinner.position.set(0, -0.95, 0);
        this.add(spinner);
        return spinner;
    }

    _createComponentFloor() {
        const floor = new Floor({
            debugGui: this._debugGui,
            renderer: this._renderer,
            color: 0x000000,
            roughness: 0.05,
            metalness: 1,
        });
        floor.position.set(0, -1, 0);
        this.add(floor);
        return floor;
    }

    _updatePostProcessing() {
        if (!this._postProcessing?.passes) return;
        this._postProcessing.passes.bloomPass.threshold = 0;
        this._postProcessing.passes.bloomPass.strength = 0.3;
        this._postProcessing.passes.bloomPass.radius = 0.4;
        this._renderer.toneMappingExposure = 3.5;
    }

    _reset() {
        if (this._components.spinner) {
            this._components.spinner.rotation.set(0, 0, 0);
            this._components.spinner.showSparks();
        }
    }

    _updateComponents({ time, delta }) {
        for (const key in this._components) {
            const component = this._components[key];
            if (typeof component.update === 'function') {
                component.update({ time, delta });
            }
        }
    }

    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const folderBackground = gui.getFolder('Background');
        const folder = folderBackground.addFolder('Scene: HomeNew');
        folder.updateTitleBackgroundColor('#004d99');
        folder.open();

        return folder;
    }
}
