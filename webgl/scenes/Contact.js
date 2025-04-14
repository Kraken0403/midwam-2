// Vendor
import gsap from 'gsap';
import { Scene, PerspectiveCamera, Vector3, PointLight, Color, Group } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import device from '@/utils/device';

// Components
import ContactLandscape from '@/webgl/components/ContactLandscape';
import Floor from '@/webgl/components/FloorContact';
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import math from '@/utils/math';

export default class Contact extends component(Scene) {
    init({ renderer, nuxtRoot, postProcessing, debug }) {
        // Props
        this._renderer = renderer;
        this._nuxtRoot = nuxtRoot;
        this._postProcessing = postProcessing;
        this._debug = debug;

        // Flags
        this._isActive = false;

        this._container = new Group();
        this.add(this._container);

        this._cameraTarget = new Vector3(0, 0, 0);
        this._scrollPosition = { x: 0, y: 0, deltaX: 0, deltaY: 0 };
        this._mousePosition = { x: 0, y: 0 };
        this._debugGui = this._createDebugGui();
        this._camera = this._createCamera();
        this._components = this._createComponents();
        this._skyLight = this._createSkyLight();
        this._cameraRotationContainer = this._createCameraRotationContainer();

        // Setup
        this._bindHandlers();
        this._setupEventListeners();
    }

    destroy() {
        super.destroy();
        this._removeEventListeners();
    }

    /**
     * Getters
     */
    get camera() {
        return this._camera;
    }

    /**
     * Triggers
     */
    onUpdate({ time, delta }) {
        if (this._isActive) this._updateComponents({ time, delta });
        // this._container.rotation.y += 0.001;
        this._updateCameraOffset();
        this._updateScrollOffset();
    }

    /**
     * Public
     */
    show() {
        this._isActive = true;
        this._updatePostProcessing();
        if (this._nuxtRoot.scrollManager) {
            this._nuxtRoot.scrollManager.addEventListener('scroll', this._scrollHandler);
        }

        this._timelineShow = new gsap.timeline();
        this._timelineShow.fromTo(this._postProcessing.passes.hidePass.material, 2, { progress: 0 }, { progress: 1, ease: 'sine.inOut' }, 0);
        this._timelineShow.add(this._components.landscape.show(), 0);
        this._timelineShow.fromTo(this._skyLight, 3, { intensity: 0 }, { intensity: 2.84 }, 0);
        this._timelineShow.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.52 }, 1);
        return this._timelineShow;
    }

    hide(onCompleteCallback) {
        if (this._timelineShow) this._timelineShow.kill();

        this._timelineHide = new gsap.timeline({ onComplete: this._timelineHideCompleteHandler, onCompleteParams: [onCompleteCallback] });
        this._timelineHide.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0 }, 0);
        this._timelineHide.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);

        if (this._nuxtRoot.scrollManager) {
            this._nuxtRoot.scrollManager.removeEventListener('scroll', this._scrollHandler);
        }
        return this._timelineHide;
    }

    focus() {}

    unfocus() {}

    /**
     * Private
     */
    _bindHandlers() {
        this._mouseDownHandler = this._mouseDownHandler.bind(this);
        this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
        this._mouseUpHandler = this._mouseUpHandler.bind(this);
        this._scrollHandler = this._scrollHandler.bind(this);
        this._timelineHideCompleteHandler = this._timelineHideCompleteHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('mousedown', this._mouseDownHandler);
        window.addEventListener('mousemove', this._mouseMoveHandler);
        window.addEventListener('mouseup', this._mouseUpHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('mousedown', this._mouseDownHandler);
        window.removeEventListener('mousemove', this._mouseMoveHandler);
        window.removeEventListener('mouseup', this._mouseUpHandler);
        if (this._nuxtRoot.scrollManager) {
            this._nuxtRoot.scrollManager.removeEventListener('scroll', this._scrollHandler);
        }
    }

    _createCamera() {
        const camera = new PerspectiveCamera(30, 1, 0.1, 10000);
        camera.position.x = -20;
        camera.position.z = 1248.11;
        camera.position.y = 566.39;
        // camera.position.z = 10;
        camera.lookAt(new Vector3(0, 0, 0));

        // const controls = new OrbitControls(camera, this._renderer.domElement);
        // controls.target = new Vector3(0, 0, 0);
        // controls.screenSpacePanning = true;
        // controls.update();

        if (this._debugGui) {
            const center = new Vector3(0, 0, 0);
            const debug = this._debugGui.addFolder('Camera');
            debug.add(camera.position, 'x', -20, 5000, 0.01).onChange(() => {
                camera.lookAt(center);
            });
            debug.add(camera.position, 'z', -20, 5000, 0.01).onChange(() => {
                camera.lookAt(center);
            });
            debug.add(camera.position, 'y', -20, 5000, 0.01).onChange(() => {
                camera.lookAt(center);
            });
        }

        return camera;
    }

    _createSkyLight() {
        const pointLight = new PointLight(0xc8590c, 0, 3000, 13.45); // 2.84
        pointLight.position.x = 239.5;
        pointLight.position.y = 1000;
        pointLight.position.z = 438.57;
        // const geometry = new SphereBufferGeometry(10);
        // const material = new MeshBasicMaterial({ color: pointLight.color });
        // const mesh = new Mesh(geometry, material);
        // pointLight.add(mesh);
        this.add(pointLight);

        if (this._debugGui) {
            const colors = {
                topLight: pointLight.color.getHex(),
            };

            const folder = this._debugGui.addFolder('Top light');
            folder
                .addColor(colors, 'topLight')
                .name('color')
                .onChange(() => {
                    pointLight.color = new Color(colors.topLight);
                });
            folder.add(pointLight, 'intensity', 0, 10, 0.01);
            folder.add(pointLight, 'distance', 0, 3000, 0.01);
            folder.add(pointLight, 'decay', 0, 100, 0.01);
            folder.add(pointLight.position, 'x', -1000, 1000, 0.01);
            folder.add(pointLight.position, 'y', -1000, 1000, 0.01);
            folder.add(pointLight.position, 'z', -1000, 1000, 0.01);
        }

        return pointLight;
    }

    _createCameraRotationContainer() {
        const group = new Group();
        group.add(this._camera);
        this.add(group);
        return group;
    }

    /**
     * Components
     */
    _createComponents() {
        const components = {};
        components.landscape = this._createComponentLandscape();
        components.floor = this._createComponentFloor();
        return components;
    }

    _createComponentLandscape() {
        const contactLandscape = new ContactLandscape({
            debugGui: this._debugGui,
        });
        contactLandscape.position.x = 84.6;
        contactLandscape.position.z = 219.51;
        contactLandscape.rotation.y = 5.84;
        this._container.add(contactLandscape);

        if (this._debugGui) {
            const folderPosition = this._debugGui.addFolder('Position');
            folderPosition.add(contactLandscape.position, 'x', -10, 2000, 0.01);
            folderPosition.add(contactLandscape.position, 'y', -10, 2000, 0.01);
            folderPosition.add(contactLandscape.position, 'z', -10, 2000, 0.01);

            const folderRotation = this._debugGui.addFolder('Rotation');
            folderRotation.add(contactLandscape.rotation, 'x', 0, Math.PI * 2, 0.01);
            folderRotation.add(contactLandscape.rotation, 'y', 0, Math.PI * 2, 0.01);
            folderRotation.add(contactLandscape.rotation, 'z', 0, Math.PI * 2, 0.01);
        }

        return contactLandscape;
    }

    _createComponentFloor() {
        const floor = new Floor({
            debugGui: this._debugGui,
            width: 2500,
            height: 2500,
            renderer: this._renderer,
        });
        this._container.add(floor);
        return floor;
    }

    _updateComponents({ time, delta }) {
        let component;
        for (const key in this._components) {
            component = this._components[key];
            if (typeof component.update === 'function') {
                component.update({ time, delta });
            }
        }
    }

    _updatePostProcessing() {
        this._postProcessing.passes.bloomPass.threshold = 0.09;
        this._postProcessing.passes.bloomPass.strength = 0.65;
        this._postProcessing.passes.bloomPass.radius = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradientsAlpha.value = 1;
        this._postProcessing.passes.afterImage.uniforms.damp.value = 0;
        this._renderer.toneMappingExposure = 2;

        // Gradient 1
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.r = 43 / 255;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.g = 34 / 255;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value.b = 97 / 255;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength.value = 0;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.x = 1;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.y = 1;
        this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale.value = 1.12;
    }

    _updateCameraOffset() {
        this._cameraRotationContainer.position.x = math.lerp(this._cameraRotationContainer.position.x, this._mousePosition.x * 70, 0.07);
        this._cameraRotationContainer.position.y = math.lerp(this._cameraRotationContainer.position.y, this._mousePosition.y * 70, 0.07);
    }

    _updateScrollOffset() {
        // this._camera.position.y += this._scrollPosition.deltaY * 0.7;
        // const offset = (this._scrollPosition.deltaY / WindowResizeObserver.height) * 620;
        const offset = (this._scrollPosition.deltaY / WindowResizeObserver.height) * 200;
        this._camera.position.y += offset;
        this._camera.lookAt(this._cameraTarget);
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeCamera();
    }

    _resizeCamera() {
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const folderBackground = gui.getFolder('Background');
        const folder = folderBackground.addFolder('Scene: Contact');
        folder.updateTitleBackgroundColor('#415a77');
        // folder.open();

        return folder;
    }

    /**
     * Handlers
     */
    _mouseDownHandler() {
        // this.focus();
    }

    _mouseUpHandler() {
        // this.unfocus();
    }

    _mouseMoveHandler(e) {
        this._mousePosition.x = -1 + (e.clientX / WindowResizeObserver.width) * 2;
        this._mousePosition.y = -1 + (1 - e.clientY / WindowResizeObserver.height) * 2;
    }

    _scrollHandler(e) {
        if (device.isTouch()) return; // tmp

        this._scrollPosition.x = e.x;
        this._scrollPosition.y = e.y;
        this._scrollPosition.deltaX = e.deltaX;
        this._scrollPosition.deltaY = e.deltaY;
    }

    _timelineHideCompleteHandler(onCompleteCallback) {
        onCompleteCallback();
        this._isActive = false;
    }
}
