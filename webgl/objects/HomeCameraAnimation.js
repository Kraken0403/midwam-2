// Vendor
import { AnimationUtils, AnimationMixer, LoopOnce, Object3D, Vector3, BoxBufferGeometry, MeshBasicMaterial, Mesh, Matrix4, Vector2, Euler } from 'three';
import { component } from '@/vendor/bidello';
import gsap from 'gsap';

// Objects
import CameraWiggle from '@/webgl/objects/CameraWiggle';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import ResourceLoader from '@/utils/ResourceLoader';
import math from '@/utils/math';
import Debugger from '@/utils/Debugger';

export const DEFAULT_CAMERA_FOV = 38.68;
export const TARGET_CAMERA_FOV = 18;

// Constants
const STEPS = [
    {
        start: 0,
        end: 100,
    },
    {
        start: 101,
        end: 145,
    },
    {
        start: 146,
        end: 250,
    },
    {
        start: 251,
        end: 295,
    },
    {
        start: 296,
        end: 355,
    },
    {
        start: 356,
        end: 505,
    },
];

export default class HomeCameraAnimation extends component() {
    init({ scene, camera, postProcessing, components, reflectiveMaterial }) {
        // Props
        this._scene = scene;
        this._camera = camera;
        this._postProcessing = postProcessing;
        this._components = components;
        this._reflectiveMaterial = reflectiveMaterial;

        // Data
        this._mousePosition = { x: 0, y: 0 };
        this._mouseContainerAngle = 0;

        this._mouseRotationActivation = 0;
        this._mouseRotationXOffset = 1.99;
        this._mouseRotationYOffset = 0.17;
        this._mouseRotationDamping = 0.07;

        this._currentIndex = 0;
        this._gltf = ResourceLoader.get('camera');
        this._animation = this._gltf.animations[1];
        this._rotationAnimation = this._gltf.animations[2];
        this._targetAnimation = this._gltf.animations[0];
        this._container = this._gltf.scene.getObjectByName('camera_container');
        this._sourceRotationContainer = this._gltf.scene.getObjectByName('camera_rotation_container');
        this._targetContainer = this._gltf.scene.getObjectByName('camera_target');
        this._targetStartPosition = new Vector3();
        this._targetStartPosition.copy(this._targetContainer.position);
        this._mixer = new AnimationMixer(this._gltf.scene);
        // this._target = this._createTarget();
        this._mouseContainerPosition = new Vector3();
        this._targetOffset = new Vector3(0, 0, 0);
        this._scrollOffset = new Vector3(0, 0, 0);

        // Setup
        this._bindHandlers();
        this._setupEventListeners();

        // Debug
        this._debugGui = this._createDebugGui();

        this._addCameraToContainer();

        if (this._debugGui) {
            const folderZoomContainer = this._debugGui.addFolder('Zoom container');
            folderZoomContainer.add(this._zoomContainer.position, 'x', -500, 500, 0.01);
            folderZoomContainer.add(this._zoomContainer.position, 'y', -500, 500, 0.01);
            folderZoomContainer.add(this._zoomContainer.position, 'z', -100, 1000, 0.01);
        }
    }

    /**
     * Getters & Setters
     */
    get offset() {
        return this._offsetContainer.position;
    }

    get wiggle() {
        return this._cameraWiggle;
    }

    get zoomContainer() {
        return this._zoomContainer;
    }

    get mouseRotationXOffset() {
        return this._mouseRotationXOffset;
    }

    set mouseRotationXOffset(value) {
        this._mouseRotationXOffset = value;
    }

    get mouseRotationYOffset() {
        return this._mouseRotationYOffset;
    }

    set mouseRotationYOffset(value) {
        this._mouseRotationYOffset = value;
    }

    get fov() {
        return this._camera.fov;
    }

    set fov(value) {
        this._camera.fov = value;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Public
     */
    goto(index, direction, done) {
        this._currentIndex = index;

        if (direction > 0) {
            this._doneCallback = done;
            const newIndex = index - 1;
            this._playAction(newIndex);
            this._playTargetAction(newIndex);
            this._startCameraEffect(newIndex, direction);
        } else {
            this._doneCallback = done;
            this._playActionReverse(index);
            this._playTargetActionReverse(index);
            this._startCameraEffect(index, direction);
        }

        switch (index) {
            case 0:
                this._deactivateMouseRotation();
                this._deactivateCameraWiggle();
                if (direction < 0) {
                    this._playRotationActionReverse();
                }
                break;
            case 1:
                this._activateMouseRotation();
                this._activateCameraWiggle();
                if (direction > 0) {
                    this._playRotationAction();
                }
                break;
            case 5:
                if (direction < 0) {
                    this._animateFov(true);
                    this._animateOffset(true);
                }
                break;
            case 6:
                if (direction > 0) {
                    this._animateFov();
                    this._animateOffset();
                }
                break;
        }
    }

    onUpdate({ time, delta }) {
        this._mixer.update(delta);
        this._updateMouseContainerRotation();
        this._updateRotationContainer();
    }

    reset() {
        this._mouseRotationActivation = 0;
        this._cameraWiggle.strength = 0;
        this._mousePosition.x = 0;
        this._mousePosition.y = 0;
        this._mouseRotationXOffset = 1.99;
        this._mouseRotationYOffset = 0.17;
        this._zoomContainer.position.x = 0;
        this._zoomContainer.position.y = 0;
        this._zoomContainer.position.z = 0;
        this._offsetContainer.position.x = 0;
        this._offsetContainer.position.y = 0;
        this._offsetContainer.position.z = 0;
        this._camera.fov = DEFAULT_CAMERA_FOV;
        this._camera.updateProjectionMatrix();
        this._targetOffset.set(0, 0, 0);
        this._scrollOffset.set(0, 0, 0);

        if (this._action) this._action.stop();
        const index = 0;
        const step = STEPS[index];
        const clip = AnimationUtils.subclip(this._animation, 'step_' + index, step.start, step.end);
        this._action = this._mixer.clipAction(clip);
        this._action.time = 0;
        this._targetContainer.position.copy(this._targetStartPosition);

        if (this._rotationAction) this._rotationAction.stop();
        this._rotationAction = this._mixer.clipAction(this._rotationAnimation);
        this._rotationAction.time = 0;
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
        this._mixerFinishedHandler = this._mixerFinishedHandler.bind(this);
    }

    _setupEventListeners() {
        this._mixer.addEventListener('finished', this._mixerFinishedHandler);
        window.addEventListener('mousemove', this._mouseMoveHandler);
    }

    _removeEventListeners() {
        this._mixer.removeEventListener('finished', this._mixerFinishedHandler);
        window.removeEventListener('mousemove', this._mouseMoveHandler);
    }

    _createTarget() {
        const geometry = new BoxBufferGeometry(10, 10, 10);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        // material.depthTest = false;
        // material.depthWrite = true;
        const mesh = new Mesh(geometry, material);
        this._targetContainer.add(mesh);
        return mesh;
    }

    _addCameraToContainer() {
        this._offsetContainer = new Object3D();
        this._offsetContainer.add(this._camera);

        this._cameraWiggle = new CameraWiggle({
            debugGui: this._debugGui,
            element: this._offsetContainer,
        });

        this._zoomContainer = new Object3D();
        this._zoomContainer.add(this._cameraWiggle);

        this._rotationContainer = new Object3D();
        this._rotationContainer.add(this._zoomContainer);

        this._mouseContainer = new Object3D();
        this._mouseContainer.add(this._rotationContainer);

        this._container.add(this._mouseContainer);

        this._targetContainer.getWorldPosition(this._mouseContainerPosition);
        this._mouseContainer.lookAt(this._mouseContainerPosition);
        this._scene.add(this._gltf.scene);
        return this._container;
    }

    _playAction(index) {
        const step = STEPS[index];
        const clip = AnimationUtils.subclip(this._animation, 'step_' + index, step.start, step.end);
        const previousAction = this._action;

        this._action = this._mixer.clipAction(clip);
        this._action.setLoop(LoopOnce);
        this._action.clampWhenFinished = true;
        this._action.play();
        if (previousAction) previousAction.stop();
    }

    _playActionReverse(index) {
        const step = STEPS[index];
        const clip = AnimationUtils.subclip(this._animation, 'step_' + index, step.start, step.end);
        const previousAction = this._action;

        this._action = this._mixer.clipAction(clip);
        if (this._action.time === 0) {
            this._action.time = this._action.getClip().duration;
        }
        this._action.setLoop(LoopOnce);
        this._action.timeScale = -1;
        this._action.clampWhenFinished = true;
        this._action.play();
        if (previousAction) previousAction.stop();
    }

    _playTargetAction(index) {
        const step = STEPS[index];
        const clip = AnimationUtils.subclip(this._targetAnimation, 'step_' + index, step.start, step.end);
        const previousAction = this._targetAction;

        this._targetAction = this._mixer.clipAction(clip);
        this._targetAction.setLoop(LoopOnce);
        this._targetAction.clampWhenFinished = true;
        this._targetAction.play();
        if (previousAction) previousAction.stop();
    }

    _playTargetActionReverse(index) {
        const step = STEPS[index];
        const clip = AnimationUtils.subclip(this._targetAnimation, 'step_' + index, step.start, step.end);
        const previousAction = this._targetAction;

        this._targetAction = this._mixer.clipAction(clip);
        if (this._targetAction.time === 0) {
            this._targetAction.time = this._targetAction.getClip().duration;
        }
        this._targetAction.setLoop(LoopOnce);
        this._targetAction.timeScale = -1;
        this._targetAction.clampWhenFinished = true;
        this._targetAction.play();
        if (previousAction) previousAction.stop();
    }

    _playRotationAction() {
        if (this._rotationAction) this._rotationAction.stop();
        this._rotationAction = this._mixer.clipAction(this._rotationAnimation);
        this._rotationAction.time = 0;
        this._rotationAction.timeScale = 1;
        this._rotationAction.setLoop(LoopOnce);
        this._rotationAction.clampWhenFinished = true;
        this._rotationAction.play();
    }

    _playRotationActionReverse() {
        if (this._rotationAction) this._rotationAction.stop();
        this._rotationAction = this._mixer.clipAction(this._rotationAnimation);
        this._rotationAction.time = this._rotationAction.getClip().duration;
        this._rotationAction.setLoop(LoopOnce);
        this._rotationAction.timeScale = -1;
        this._rotationAction.clampWhenFinished = true;
        this._rotationAction.play();
    }

    _activateMouseRotation() {
        gsap.to(this, 1, { _mouseRotationActivation: 1, delay: 1 });
    }

    _deactivateMouseRotation() {
        gsap.to(this, 3, { _mouseRotationActivation: 0 });
    }

    _activateCameraWiggle() {
        gsap.to(this._cameraWiggle, 1, { strength: 1, delay: 1 });
    }

    _deactivateCameraWiggle() {
        gsap.to(this._cameraWiggle, 1, { strength: 0 });
    }

    _updateMousePosition(x, y) {
        this._mousePosition.x = -1 + (x / WindowResizeObserver.viewportWidth) * 2;
        this._mousePosition.y = -1 + (y / WindowResizeObserver.viewportHeight) * 2;
    }

    _updateMouseContainerRotation() {
        const angleTarget = Math.PI * 0.5 + this._mouseRotationYOffset * -this._mousePosition.x;
        this._mouseContainerAngle = math.lerp(this._mouseContainerAngle, angleTarget, this._mouseRotationDamping);

        const radius = this._container.position.distanceTo(this._targetContainer.position) * 1;
        const x = radius * Math.cos(this._mouseContainerAngle);
        const y = radius * Math.sin(this._mouseContainerAngle) - radius;
        const z = math.lerp(this._mouseContainer.position.z, this._mousePosition.y * this._mouseRotationXOffset, this._mouseRotationDamping);
        this._mouseContainer.position.x = x * this._mouseRotationActivation;
        this._mouseContainer.position.y = y * this._mouseRotationActivation;
        this._mouseContainer.position.z = z * this._mouseRotationActivation;

        this._targetContainer.getWorldPosition(this._mouseContainerPosition);
        this._mouseContainerPosition.add(this._targetOffset);
        this._mouseContainerPosition.add(this._scrollOffset);
        this._mouseContainer.lookAt(this._mouseContainerPosition);
    }

    _updateRotationContainer() {
        this._rotationContainer.rotation.x = this._sourceRotationContainer.rotation.x;
        this._rotationContainer.rotation.y = this._sourceRotationContainer.rotation.z;
        this._rotationContainer.rotation.z = -this._sourceRotationContainer.rotation.y;
    }

    _animateFov(reverse = false) {
        if (reverse) {
            gsap.to(this._camera, 5, {
                fov: DEFAULT_CAMERA_FOV,
                onUpdate: () => {
                    this._camera.updateProjectionMatrix();
                },
            });
        } else {
            gsap.to(this._camera, 5.1, {
                fov: TARGET_CAMERA_FOV,
                ease: 'power1.inOut',
                onUpdate: () => {
                    this._camera.updateProjectionMatrix();
                },
            });
        }
    }

    _animateOffset(reverse = false) {
        if (reverse) {
            gsap.to(this._targetOffset, 5, { y: 0 });
        } else {
            gsap.to(this._targetOffset, 5, { y: -68.38 });
        }
    }

    _startCameraEffect(index, direction) {
        gsap.killTweensOf(this._postProcessing.passes.afterImage.uniforms.damp, 'value');
        gsap.to(this._postProcessing.passes.afterImage.uniforms.damp, 1, { value: 0 });

        let delay = 0;
        switch (index) {
            case 0:
                gsap.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 0.8, { value: 2, ease: 'power1.inOut' });
                gsap.to(this._postProcessing.passes.bloomPass, 0.8, { strengthMultiplier: 2.5, delay: 0.5, ease: 'power1.inOut' });

                gsap.to(this._reflectiveMaterial, 0.8, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);
                gsap.to(this._reflectiveMaterial, 0.8, { emissiveIntensity: 0.007, ease: 'power1.inOut' }, 0);

                delay = 2.5;
                break;
            case 1:
                gsap.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 0.5, { value: 2, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);

                if (direction > 0) {
                    gsap.to(this._postProcessing.passes.bloomPass, 0.5, { strengthMultiplier: 2.5, ease: 'power1.inOut' });
                    gsap.to(this._reflectiveMaterial, 0.5, { emissiveIntensity: 0.01, ease: 'power1.inOut' }, 0);
                } else {
                    gsap.to(this._postProcessing.passes.bloomPass, 0.5, { strengthMultiplier: 1.5, ease: 'power1.inOut' });
                    gsap.to(this._reflectiveMaterial, 0.5, { emissiveIntensity: 0.007, ease: 'power1.inOut' }, 0);
                }

                delay = 0.6;
                break;
            case 2:
                gsap.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 0.5, { value: 2, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);

                gsap.to(this._postProcessing.passes.bloomPass, 0.5, { strengthMultiplier: 2.5, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { emissiveIntensity: 0.01, ease: 'power1.inOut' }, 0);

                delay = 2.8;
                break;
            case 3:
                gsap.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 0.5, { value: 2, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);

                gsap.to(this._postProcessing.passes.bloomPass, 0.5, { strengthMultiplier: 2.5, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { emissiveIntensity: 0.015, ease: 'power1.inOut' }, 0);
                gsap.to(this._components.spinner._material, 0.5, { emissiveIntensity: 0.015, ease: 'power1.inOut' }, 0);

                delay = 1;
                break;
            case 4:
                gsap.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 0.5, { value: 2, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);

                gsap.to(this._postProcessing.passes.bloomPass, 0.5, { strengthMultiplier: 2.5, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { emissiveIntensity: 0.015, ease: 'power1.inOut' }, 0);
                gsap.to(this._components.spinner._material, 0.5, { emissiveIntensity: 0.015, ease: 'power1.inOut' }, 0);

                delay = 1.4;
                break;
            case 5:
                gsap.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 0.5, { value: 0.8, ease: 'power1.inOut' });
                gsap.to(this._reflectiveMaterial, 0.5, { envMapRotationZSpeed: 0.025, ease: 'power1.inOut' }, 0);

                delay = 4.2;
                break;
        }

        const timeline = new gsap.timeline({ delay });

        if (index === 0) {
            timeline.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 1.3, { value: 0.37, ease: 'power2.out' }, 0);
            timeline.to(this._reflectiveMaterial, 1.3, { envMapRotationZSpeed: 0.0024, ease: 'power2.out' }, 0);
            timeline.to(this._postProcessing.passes.bloomPass, 1.3, { strengthMultiplier: 1, ease: 'power2.out' }, 0);
            timeline.to(this._reflectiveMaterial, 1.3, { emissiveIntensity: 0, ease: 'power2.out' }, 0);
            timeline.to(this._components.spinner._material, 1.3, { emissiveIntensity: 0, ease: 'power2.out' }, 0);
        } else {
            timeline.to(this._postProcessing.passes.finalPass.uniforms.uCASize, 1, { value: 0.37, ease: 'power2.out' }, 0);
            timeline.to(this._reflectiveMaterial, 1, { envMapRotationZSpeed: 0.0024, ease: 'power2.out' }, 0);
            timeline.to(this._postProcessing.passes.bloomPass, 1, { strengthMultiplier: 1, ease: 'power2.out' }, 0);
            timeline.to(this._reflectiveMaterial, 1, { emissiveIntensity: 0, ease: 'power2.out' }, 0);
        }

        if (index < 5) {
            timeline.to(this._reflectiveMaterial.userData.uniforms.uBlendColorStrength, 1, { value: 0, ease: 'power2.out' }, 0);
            timeline.to(this._components.spinner._material.userData.uniforms.uBlendColorStrength, 0.5, { value: 0, ease: 'power1.inOut' }, 0);
            timeline.to(this._components.spinner._material, 1, { emissiveIntensity: 0, ease: 'power2.out' }, 0);
        }
    }

    _stopCameraEffect() {
        let value = 0;
        switch (this._currentIndex) {
            case 0:
                value = 0.7;
                break;
            case 1:
                value = 0.7;
                break;
            case 2:
                value = 0.95;
                break;
            case 3:
                value = 0.7;
                break;
            case 4:
                value = 0.7;
                break;
            case 5:
                value = 0.7;
                break;
            case 6:
                value = 0;
                break;
        }
        gsap.to(this._postProcessing.passes.afterImage.uniforms.damp, 2, { value });
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const folderCameras = gui.getFolder('Cameras');
        const folderMouseRotation = folderCameras.addFolder('Mouse rotation');
        folderMouseRotation.add(this, '_mouseRotationXOffset', 0, 10, 0.01).name('offset x').listen();
        folderMouseRotation
            .add(this, '_mouseRotationYOffset', 0, Math.PI * 0.5, 0.01)
            .name('offset y')
            .listen();
        folderMouseRotation.add(this, '_mouseRotationDamping', 0, 0.2, 0.001).name('damping').listen();
        // folderMouseRotation.open();

        const folderTargetOffset = folderCameras.addFolder('Target offset');
        folderTargetOffset.add(this._targetOffset, 'x', -100, 100, 0.01).listen();
        folderTargetOffset.add(this._targetOffset, 'y', -100, 100, 0.01).listen();
        folderTargetOffset.add(this._targetOffset, 'z', -100, 100, 0.01).listen();

        return folderCameras;
    }

    /**
     * Handlers
     */
    _mixerFinishedHandler() {
        if (this._doneCallback) this._doneCallback();
        this._stopCameraEffect();
    }

    _mouseMoveHandler(e) {
        this._updateMousePosition(e.clientX, e.clientY);
    }
}
