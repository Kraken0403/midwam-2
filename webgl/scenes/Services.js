// webgl/scenes/Services.js

// Vendor
import gsap from 'gsap';
import { Scene, PerspectiveCamera, Vector3, Group } from 'three';
import { component } from '@/vendor/bidello';

// Components
import Sparks      from '@/webgl/components/Sparks';
import SparksBurst from '@/webgl/components/SparksBurst';
import FloorServices from '@/webgl/components/FloorServices';

// Utils
import Debugger    from '@/utils/Debugger';
import Breakpoints from '@/utils/Breakpoints';

export default class Services extends component(Scene) {
  init({ renderer, postProcessing, debug, nuxtRoot }) {
    // Props
    this._renderer       = renderer;
    this._postProcessing = postProcessing;
    this._debug          = debug;
    this._nuxtRoot       = nuxtRoot;
    this._isActive       = false;

    // —– CAMERA —–
    this._cameraTarget = new Vector3(0, 0, 0);
    this._camera = new PerspectiveCamera(30, 1, 0.1, 10000);
    // lift camera so sparks start below center
    this._camera.position.set(0, 5.5, 9.34);
    this._camera.lookAt(this._cameraTarget);

    if (this._debug) {
      const f = Debugger
        .gui
        .getFolder('Background')
        .addFolder('Scene: Services');
      ['x','y','z'].forEach(axis => {
        const limits = axis === 'z'
          ? [0, 20]
          : axis === 'y'
            ? [0, 5]
            : [-10, 10];
        f.add(this._camera.position, axis, ...limits, 0.01)
         .onChange(() => this._camera.lookAt(this._cameraTarget));
      });
      f.open();
    }

    // —– ROOT GROUP —–
    this._container = new Group();
    this.add(this._container);

    // —– FLOOR —–
    this._floor = new FloorServices({
      debugGui: this._debug,
      renderer: this._renderer,
      width: 200,
      height: 200
    });
    this._container.add(this._floor);

    // —– SPARKS STREAM + BURSTS —–
    this._sparks  = new Sparks({
      debugGui: this._debug,
      renderer: this._renderer,
      lineWidth: 0.04,
      alpha: 1
    });
    this._burst1  = new SparksBurst();
    this._burst2  = new SparksBurst();
    this._container.add(this._sparks, this._burst1, this._burst2);

    // position the emitter block so sparks emanate from x = –4.1 on desktop
    const offsetX = Breakpoints.active('small') ? -1.2 : -4.1;
    const offsetY = Breakpoints.active('small') ? -1.0 : -2.8;
    this._container.position.set(offsetX, offsetY, 0);
  }

  // Tell the renderer which camera to use
  get camera() {
    return this._camera;
  }

  onUpdate({ time, delta }) {
    if (!this._isActive) return;
    this._sparks.update({ time, delta });
    this._burst1.update({ time, delta });
    this._burst2.update({ time, delta });
  }

  show() {
    this._isActive = true;

    // start continuous stream immediately
    this._sparks.start();

    // two initial bursts
    this._burst1.play();
    gsap.delayedCall(1.5, () => this._burst2.play());

    // then loop bursts every 3 seconds
    this._burstLoop = gsap.timeline({ repeat: -1, repeatDelay: 3 })
      .call(() => this._burst1.play(), null, 0)
      .call(() => this._burst2.play(), null, 0.5);

    // SceneManager expects a timeline
    return gsap.timeline();
  }

  hide(onComplete) {
    this._isActive = false;

    // stop all emitters
    this._sparks.reset();
    this._burst1.reset();
    this._burst2.reset();
    if (this._burstLoop) this._burstLoop.kill();

    if (typeof onComplete === 'function') onComplete();
    return gsap.timeline();
  }
}
