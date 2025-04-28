// Vendor
import gsap from 'gsap';
import { Scene } from 'three';
import * as THREE from 'three';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import math from '@/utils/math';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Objects
import Cameras from '@/webgl/objects/HomeCameras';

// Components
import Spinner from '@/webgl/components/SpinnerHome';
import Floor from '@/webgl/components/Floor';

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
        this._setupScrollTimeline();
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
    
        // Access scroll position directly from ScrollControl
        const scrollY = this._nuxtRoot.scrollControl?.position?.y || 0;
        const totalHeight = this._nuxtRoot.scrollControl?.$el?.scrollHeight || 1;
        const scrollProgress = scrollY / totalHeight;

        console.log(scrollProgress)
    
        const radius = 4;
        const angle = scrollProgress * Math.PI * 2;
    
        this.camera.position.x = radius * Math.cos(angle);
        this.camera.position.z = radius * Math.sin(angle);
        this.camera.position.y = 2 + Math.sin(scrollProgress * Math.PI) * 1.5;
    
        this.camera.lookAt(0, 0, 0);
    }

    show() {
        this._isActive = true;
        // this._renderer.setClearColor(0x000000, 1)

        this._updatePostProcessing();
        this._reset();
    }

    hide(onCompleteCallback) {
        this._isActive = false;
        if (onCompleteCallback) onCompleteCallback();
    }

    /**
     * Private
     */
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
                color: 0x111111, // Darker
                emissive: 0x000000,
                roughness: 0.1,  // Shinier
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
        spinner.position.set(0, -0.95, 0); // Moved almost touching floor
        this.add(spinner);
        return spinner;
    }

    _createComponentFloor() {
        const floor = new Floor({
            debugGui: this._debugGui,
            renderer: this._renderer,
            color: 0x000000,  // Very dark grey, almost black
            roughness: 0.05,   // Super shiny
            metalness: 1,  
        });
        floor.position.set(0, -1, 0);
        this.add(floor);
        console.log(floor)
        return floor;
    }

    _setupScrollTimeline() {
        this._scrollTimeline = gsap.timeline({ paused: true });

        // Scroll-based camera movement
        this.camera.position.set(0, 6, 12); // Pull camera a little further back at start
        this.camera.lookAt(0, 0, 0);

        // Timeline stages based on scroll
        this._scrollTimeline.to(this.camera.position, {
            duration: 1,
            x: 4,
            z: 10,
            y: 4,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            },
        }, 0);

        this._scrollTimeline.to(this.camera.position, {
            duration: 1,
            x: -4,
            z: 8,
            y: 2.5,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            },
        }, 0.5);

        this._scrollTimeline.to(this.camera.position, {
            duration: 1,
            x: 0,
            z: 6,
            y: 3,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            },
        }, 1.0);
    }

    _updatePostProcessing() {
        if (!this._postProcessing?.passes) return;

        this._postProcessing.passes.bloomPass.threshold = 0;
        this._postProcessing.passes.bloomPass.strength = 0.3;
        this._postProcessing.passes.bloomPass.radius = 0.4;
        this._renderer.toneMappingExposure = 4;
    }

    _reset() {
        if (this._components.spinner) {
            this._components.spinner.rotation.set(0, 0, 0);
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
        folder.updateTitleBackgroundColor('#ff0000');
        folder.open();

        return folder;
    }
}
