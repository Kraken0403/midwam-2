import gsap from 'gsap';
import {
  Scene,
  PerspectiveCamera,
  Vector3,
  Group
} from 'three';
import { component } from '@/vendor/bidello';

import Sparks from '@/webgl/components/Sparks';
import SparksBurst from '@/webgl/components/SparksBurst';
import FloorServices from '@/webgl/components/FloorServices';

export default class Services extends component(Scene) {
  init({ renderer, nuxtRoot, postProcessing, debug }) {
    this._renderer = renderer;
    this._postProcessing = postProcessing;
    this._debug = debug;
    this._nuxtRoot = nuxtRoot;
    this._isActive = false;

    this._cameraTarget = new Vector3(0, 0, 0);
    this._camera = new PerspectiveCamera(45, 1, 0.1, 1000);
    this._camera.position.set(0, 5.5, 9.34);
    this._camera.lookAt(this._cameraTarget);

    this._container = new Group();
    this.add(this._container);

    this._floor = new FloorServices({
      debugGui: this._debug,
      renderer: this._renderer,
      width: 200,
      height: 200,
    });
    this._container.add(this._floor);

    this._sparks = new Sparks({
      debugGui: this._debug,
      renderer: this._renderer,
      lineWidth: 0.04,
      alpha: 1,
    });

    this._burst1 = new SparksBurst();
    this._burst2 = new SparksBurst();

    this._container.add(this._sparks, this._burst1, this._burst2);

    this._container.position.set(-4.1, -2.8, 0);
  }

  get camera() {
    return this._camera;
  }

  onUpdate({ time, delta }) {
    if (!this._isActive) return;

    this._sparks.update({ time, delta });
    this._burst1.update({ time, delta });
    this._burst2.update({ time, delta });
  }

  onResize({ width, height, dpr = 1 }) {
    if (this._camera) {
      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();
    }

    this._sparks?.onResize({ width, height, dpr });
    this._burst1?.onResize({ width, height, dpr });
    this._burst2?.onResize({ width, height, dpr });
  }

  show() {
    this._isActive = true;

    gsap.delayedCall(0.05, () => {
      const w = this._renderer.domElement.clientWidth;
      const h = this._renderer.domElement.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      this._camera.aspect = w / h;
      this._camera.updateProjectionMatrix();

      this._postProcessing?.onResize?.({ width: w, height: h, dpr });

      this._sparks?.onResize({ width: w, height: h, dpr });
      this._burst1?.onResize({ width: w, height: h, dpr });
      this._burst2?.onResize({ width: w, height: h, dpr });
    });

    this._sparks.start();
    this._burst1.play();
    gsap.delayedCall(1.5, () => this._burst2.play());

    this._burstLoop = gsap.timeline({ repeat: -1, repeatDelay: 3 })
      .call(() => this._burst1.play(), null, 0)
      .call(() => this._burst2.play(), null, 0.5);

    // POSTPROCESSING
    this._postProcessing.passes.finalPass.material.uniforms.uGradientsAlpha.value = 1;
    this._updatePostProcessing();

    const timeline = new gsap.timeline();
    timeline.set(this._postProcessing.passes.hidePass.material, { progress: 1 }, 0.1);
    timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 2, { value: 0.36 }, 1);
    timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 2, { value: 0.19 }, 1);

    return timeline;
  }

  hide(onComplete) {
    this._isActive = false;

    this._sparks.reset();
    this._burst1.reset();
    this._burst2.reset();
    if (this._burstLoop) this._burstLoop.kill();

    const timeline = new gsap.timeline({ onComplete });
    timeline.to(this._postProcessing.passes.hidePass.material, 1, { progress: 0 }, 0);
    timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, 1, { value: 0 }, 0);
    timeline.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, 1, { value: 0 }, 0);

    return timeline;
  }

  _updatePostProcessing() {
    if (!this._postProcessing) return;

    this._postProcessing.passes.bloomPass.threshold = 0.1;
    this._postProcessing.passes.bloomPass.strength = 0.65;
    this._postProcessing.passes.bloomPass.radius = 0.58;
    this._postProcessing.passes.afterImage.uniforms.damp.value = 0.62;
    this._renderer.toneMappingExposure = 1.6;

    // Gradient 1
    const g1 = this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value;
    g1.setRGB(31 / 255, 22 / 255, 68 / 255);
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength.value = 0;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value.set(0.78, 0);
    this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale.value = 1.06;

    // Gradient 2
    const g2 = this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value;
    g2.setRGB(47 / 255, 15 / 255, 15 / 255);
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength.value = 0;
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value.set(0.04, 1);
    this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale.value = 0.81;
  }
}
