// Vendor
import gsap from 'gsap';
import { Scene, PerspectiveCamera, Group, AxesHelper, Vector3, CameraHelper } from 'three';
import { component } from '@/vendor/bidello';
import Debugger from '@/utils/Debugger';

// Materials
import ReflectiveMaterial from '@/webgl/materials/ReflectiveMaterial';

// Components
import Spinner from '@/webgl/components/SpinnerHome';
import Floor from '@/webgl/components/Floor';

import ServicesPlanes from '@/webgl/components/ServicesPlanes';


// Manager
import HomeNewSectionManager from '@/webgl/objects/HomeNewSectionManager';

export default class HomeNew extends component(Scene) {
    init({ renderer, nuxtRoot, postProcessing, debug }) {
        this._renderer = renderer;
        this._nuxtRoot = nuxtRoot;
        this._postProcessing = postProcessing;
        this._debug = debug;
    
        this._isActive = false;
    
        this._cameraTarget = new Vector3(0, 0, 0);
        this._debugGui = this._createDebugGui();
        this._camera = this._createCameras();
        this._group = new Group();
        this.add(this._group);
    
        this._components = this._createComponents();
    
        this._setupManagerBindings(); // ✅ First bind everything
        Object.assign(this, HomeNewSectionManager); // ✅ Then mount manager
        this._currentSectionIndex = 0;

        this.visible = false;
    }
    

    get camera() {
        return this._camera;
    }

    show() {
        this.visible = true;
        this._isActive = true;
        this._reset();
    
       // Fade in
       this._group.visible = true;
       this._group.opacity = 0;
       const fadeTimeline = new gsap.timeline();
       fadeTimeline.to(this._group, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    
        gsap.delayedCall(0.05, () => {
            const w = this._renderer.domElement.clientWidth;
            const h = this._renderer.domElement.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            this._camera.aspect = w / h;
            this._postProcessing?.onResize?.({ width: w, height: h, dpr });
        });
    
        this._updatePostProcessing();
    
        const timeline = new gsap.timeline();
        timeline.set(this._postProcessing.passes.hidePass.material, { progress: 1 }, 0.1);
        timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.36 }, 1);
        timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.29 }, 1);
    
    // -   return timeline;
      return fadeTimeline.add(timeline, 0);  // ✅ Combine fade and gradient animations
    }
    hide(cb) {
        this._isActive = false;
        if (cb) cb();

        // const timeline = new gsap.timeline({ cb });
        //     timeline.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0 }, 0);
        //     timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);
        //     timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 1, { value: 0 }, 0);

        // return timeline;
    }

    onUpdate({ time, delta }) {
        if (!this._isActive) return;
        this._updateComponents({ time, delta });
    }

    _createCamera() {
        const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 10, 3);
        camera.lookAt(0,0,0);

        if (this._debugGui) {
            const camFolder = this._debugGui.addFolder('Camera');
            camFolder.add(camera.position, 'x', -50, 50, 0.01).onChange(() => camera.lookAt(0,0,0));
            camFolder.add(camera.position, 'y', -50, 50, 0.01).onChange(() => camera.lookAt(0,0,0));
            camFolder.add(camera.position, 'z', -50, 50, 0.01).onChange(() => camera.lookAt(0,0,0));
        }

        return camera;
    }

    _createCameras() {
        const aspect = window.innerWidth / window.innerHeight;
      
        // Live camera
        const camera = new PerspectiveCamera(45, aspect, 0.1, 10000);
        camera.position.set(0, 10, 3);
        camera.lookAt(0, 0, 0);
      
        this._camera = camera;
      
        // Reference Camera A — looks at origin
        this._cameraA = new PerspectiveCamera(45, aspect, 0.1, 10000);
        this._cameraA.position.set(0, 10, 3);
        this._cameraA.lookAt(0, 0, 0);
        this._cameraA.updateMatrixWorld();

      
        // Reference Camera B — looks at spinner & service planes
        this._cameraB = new PerspectiveCamera(45, aspect, 0.1, 10000);
        this._cameraB.position.set(0, 2, 0); // adjust if needed
        this._cameraB.lookAt(new Vector3(-10, 2, 10));
        this._cameraB.updateMatrixWorld();

        this._cameraC = new PerspectiveCamera(45, aspect, 0.1, 10000);
        this._cameraC.position.set(-6, 1, 13); // ✅ move closer and slightly right
        this._cameraC.lookAt(new Vector3(-13, -1, 10)); // ✅ spinner's new position
        this._cameraC.updateMatrixWorld();

        // Force recalculation

        // const helper = new CameraHelper(this._cameraB);
        // this.add(helper);
      
        if (this._debugGui) {
          const camFolder = this._debugGui.addFolder('Camera');
          camFolder.add(camera.position, 'x', -50, 50, 0.01).onChange(() => camera.lookAt(0, 0, 0));
          camFolder.add(camera.position, 'y', -50, 50, 0.01).onChange(() => camera.lookAt(0, 0, 0));
          camFolder.add(camera.position, 'z', -50, 50, 0.01).onChange(() => camera.lookAt(0, 0, 0));
        }
      
        return camera;
      }
      
      

    _createComponents() {
        const components = {};

        const material = new ReflectiveMaterial(
            { renderer: this._renderer, debugGui: this._debugGui },
            {
                color: 0x111111,
                emissive: 0x000000,
                roughness: 0.2,
                metalness: 1,
            }
        );

        const spinner = new Spinner({
            debugGui: this._debugGui,
            renderer: this._renderer,
            material,
        });
        spinner.scale.set(0.6, 0.6, 0.6);
        spinner.position.set(0,-0.95,0);
        console.log(spinner.position)
        this._group.add(spinner);

        const floor = new Floor({
            debugGui: this._debugGui,
            renderer: this._renderer,
            color: 0x000000,
            roughness: 0.05,
            metalness: 1,
        });
        floor.position.set(0, -1, 0);
        this._group.add(floor);


        // this._group.add(new AxesHelper(3));

        // ✅ NEW — services image planes
        const servicesPlanes = new ServicesPlanes({
            envMap: material.envMap,
            images: [
                require('@/assets/images/portfolio-detail/image2.png'),
                require('@/assets/images/portfolio-detail/image4.png')
            ],
            camera: this._cameraB,
        });

        servicesPlanes.position.set(-11, -1, 11);
        servicesPlanes.rotateY(3 * Math.PI/4);
        servicesPlanes.userData.opacity = 1; // ✅ Store opacity in userData

        servicesPlanes.children.forEach((child) => {
        if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0; // ✅ Initially invisible
        }
        });

        servicesPlanes.visible = true; // ✅ Hide initially, reveal in animation

        this._group.add(servicesPlanes);

        // console.log('services',servicesPlanes)

        components.spinner = spinner;
        components.floor = floor;
        components.servicesPlanes = servicesPlanes;

        return components;
    }

    _updatePostProcessing() {
        if (!this._postProcessing?.passes) return;
        this._postProcessing.passes.bloomPass.threshold = 0.1;
        this._postProcessing.passes.bloomPass.strength = 0.65;
        this._postProcessing.passes.bloomPass.radius = 0.58;
        this._postProcessing.passes.afterImage.uniforms.damp.value = 0.62;

        this._renderer.toneMappingExposure = 1.6;

        // const g1 = this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value;
        // g1.setRGB(31 / 255, 22 / 255, 68 / 255);
        // this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength.value = 0;
        // this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.set(0.78, 0);
        // this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale.value = 1.06;

        // // Gradient 2
        // const g2 = this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value;
        // g2.setRGB(47 / 255, 15 / 255, 15 / 255);
        // this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength.value = 0;
        // this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value.set(0.04, 1);
        // this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale.value = 0.81;
    }

    _reset() {
        if (this._components.spinner) {
            this._components.spinner.rotation.set(0, 0, 0);
            this._components.spinner.showSparks();
        }
    }

    _updateComponents({ time, delta }) {
        for (const key in this._components) {
            const comp = this._components[key];
            if (typeof comp.update === 'function') {
                comp.update({ time, delta });
            }
        }
    }

    _setupManagerBindings() {
        this._cameraTarget = new Vector3(0, 0, 0);
        this._locale = this._nuxtRoot?.$i18n?.locale || 'en';
        this._camera.lookAt(0,0,0);

        Object.assign(this, {
            _camera: this._camera,
            _group: this._group,
            _components: this._components,
            _postProcessing: this._postProcessing,
        });
    }

    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;
        const folder = gui.getFolder('Background').addFolder('Scene: HomeNew');
        folder.updateTitleBackgroundColor('#004d99');
        folder.open();
        return folder;
    }
}
