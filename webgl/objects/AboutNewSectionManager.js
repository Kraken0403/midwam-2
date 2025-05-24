import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Color, Vector3, Box3, QuadraticBezierCurve3 } from 'three';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);
const sectionPositions = {
  ProcessNew: { x:0, y:0, z: 2 },
  Step1: {x:0, y:0, z: 8 },
  Step2: { x:8, y:0, z: 16 },
  Step3: { x:8, y:0, z: 24 },
  Step4: { x:0,y:0,z: 32 }
};


export default {
  
  _scrollHandler({ y }) {
    const sections = this._nuxtRoot?.sectionsInfo;
    if (!sections) return;

    const triggerY = window.innerHeight * 0.5;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const el = section?.component?.$el;
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      if (rect.top <= triggerY && rect.bottom >= triggerY) {
        if (this._lastDOMSectionIndex !== i) {
          const direction = i > (this._lastDOMSectionIndex || 0) ? 1 : -1;
          this._lastDOMSectionIndex = i;

          const name = section.component?.$options?.name || `Unknown_${i}`;
          console.log(`[📍 DOM] Active Section: ${name}`);

          const fn = `_show${name}`;
          if (typeof this[fn] === 'function') {
            this[fn](direction);
          }

          if (typeof section.component?.backgroundShow === 'function') {
            section.component.backgroundShow(() => {}, direction);
          }
        }
        break;
      }
    }
  },

  _showAboutIntro() {
    if (this._lastSection === 'section0') return;
    this._lastSection = 'section0';
  
    const spinner = this._components?.spinner;
    if (spinner) {
      gsap.to(spinner.position, {
        x: this._locale === 'en' ? -1.38 : -4.1, // or whatever "perfect" position you saw in Info
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut',
      });
    }
  
    const tl = gsap.timeline();
    tl.to(this.position, { x: -1.38, duration: 1.5, ease: 'power2.inOut' });
  
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Color.value, {
      r: 31 / 255, g: 22 / 255, b: 68 / 255, duration: 2
    }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Strength, { value: 0.36, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Position.value, { x: 0.78, y: 0, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient1Scale, { value: 1.06, duration: 2 }, 0);
  
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Color.value, {
      r: 47 / 255, g: 15 / 255, b: 15 / 255, duration: 2
    }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Strength, { value: 0.19, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Position.value, { x: 0.04, y: 1, duration: 2 }, 0);
    tl.to(this._postProcessing.passes.finalPass.material.uniforms.uGradient2Scale, { value: 0.81, duration: 2 }, 0);
  }
  ,

  _showAboutInfo() {
    if (this._lastSection === 'section1') return;
    this._lastSection = 'section1';
  
    const tl = gsap.timeline();
    tl.to(this.position, 
      { x: this._locale === 'en' ? -1.38 : 4.5, duration: 1.5, ease: 'power2.inOut' });
  
    tl.to(this._camera.position, {
      z: 9.34, y: 1.24,
      duration: 1.5, ease: 'power2.inOut',
      onUpdate: () => this._camera.lookAt(this._cameraTarget)
    }, 0);
  },

  _showAboutInfo2() {
    if (this._lastSection === 'section3') return;
    this._lastSection = 'section3';

    this._hideAllStepTexts?.();

    const tl = gsap.timeline();
    tl.to(this.position, { x: this._locale === 'en' ? -3.45 : 5.6, duration: 2, ease: 'power2.inOut' });

    tl.to(this._camera.position, {
      z: 4.63, y: 20,
      duration: 2, ease: 'power2.inOut',
      onUpdate: () => this._camera.lookAt(this._cameraTarget)
    }, 0);

    tl.to(this._components.spinner._sparks, { alpha: 1, duration: 1.5 }, 0);
  },



  

 _showSectionProcessNew(direction = 1) {
  if (this._lastSection === 'sectionProcessNew' && direction > 0) return;

  this._lastSection = 'sectionProcessNew';

  const spinner = this._components?.spinner;
  const cam = this._camera;
  if (!spinner || !cam) return;

  const from = sectionPositions['Step1'];
  const to = sectionPositions['ProcessNew'];

  if (direction < 0) {
    spinner.position.set(from.x, from.y, from.z);
  }

  const tl = gsap.timeline({
    onUpdate: () => {
      cam.position.set(spinner.position.x, 20, spinner.position.z);
      cam.lookAt(spinner.position);
      cam.updateMatrixWorld(true);
    },
    onComplete: () => {
  

      // ✅ Show static "OUR PROCESS" text
      this._revealStepText?.('OUR PROCESS', new Vector3(to.x - 2, 0.1, to.z));
    }
  });

  tl.to(this.position, {
    x: -1.38,
    y: 0,
    z: 0,
    duration: 1
  });

  tl.to(spinner.position, {
    x: to.x,
    y: to.y,
    z: to.z,
    duration: 1.2,
    ease: 'power2.inOut'
  });

  return tl;
}

  ,
  getSpinnerWidth() {
    const spinner = this._components?.spinner;
    if (!spinner) return 0;
  
    const box = new Box3().setFromObject(spinner);
    const size = new Vector3();
    box.getSize(size);
  
    return size.x; // Width along X-axis
  }
  ,
  _showSectionProcessStep1(direction = 1) {
    const spinner = this._components?.spinner;
    const cam = this._camera;
    if (!spinner || !cam) return;

    const from = direction > 0 ? sectionPositions['ProcessNew'] : sectionPositions['Step2'];
    const to = sectionPositions['Step1'];

    if (direction < 0) {
      spinner.position.set(from.x, from.y, from.z);
    }

    const tl = gsap.timeline({
      onUpdate: () => {
        cam.position.set(spinner.position.x, 20, spinner.position.z);
        cam.lookAt(spinner.position);
        cam.updateMatrixWorld(true);
      },
      onComplete: () => {
        this._lastSection = 'sectionProcessStep1';
        this._revealStepText?.('Step 1: Foundation', new Vector3(to.x + 5.2, 0.1, to.z));
      }
    });

    tl.to(spinner.position, {
      x: to.x,
      y: to.y,
      z: to.z,
      duration: 1.5,
      ease: 'power2.inOut'
    });

    return tl;
  }  ,

  _showSectionProcessStep2(direction = 1) {
    const spinner = this._components?.spinner;
    const cam = this._camera;
    if (!spinner || !cam) return;
  
    const from = direction > 0 ? sectionPositions['Step1'] : sectionPositions['Step3'];
    const to = sectionPositions['Step2'];
  
    if (direction < 0) {
      spinner.position.set(from.x, from.y, from.z);
    }
  
    const control = { x: 8, y: 0, z: 12 };
    const curve = new QuadraticBezierCurve3(
      new Vector3(from.x, from.y, from.z),
      new Vector3(control.x, control.y, control.z),
      new Vector3(to.x, to.y, to.z)
    );
  
    const tl = gsap.timeline({
      onUpdate: () => {
        const t = tl.progress();
        const pos = curve.getPoint(t);
        spinner.position.copy(pos);
        cam.position.set(pos.x, 20, pos.z);
        cam.lookAt(spinner.position);
      },
      onComplete: () => {
        this._lastSection = 'sectionProcessStep2';
        this._revealStepText?.('Step 2: Elevate', new Vector3(to.x + 5, 0.1, to.z));
      }
    });
  
    tl.to({}, { duration: 1.2 });
  
    return tl;
  },
  
  _showSectionProcessStep3(direction = 1) {
    const spinner = this._components?.spinner;
    const cam = this._camera;
    if (!spinner || !cam) return;
  
    const from = direction > 0 ? sectionPositions['Step2'] : sectionPositions['Step4'];
    const to = sectionPositions['Step3'];
  
    if (direction < 0) {
      spinner.position.set(from.x, from.y, from.z);
    }
  
    const tl = gsap.timeline({
      onUpdate: () => {
        cam.position.set(spinner.position.x, 20, spinner.position.z);
        cam.lookAt(spinner.position);
      },
      onComplete: () => {
        this._lastSection = 'sectionProcessStep3';
        this._revealStepText?.('Step 3: Expand', new Vector3(to.x - 2, 0.1, to.z));
      }
    });
  
    tl.to(spinner.position, {
      ...to,
      duration: 1.5,
      ease: 'power2.inOut'
    });
  
    return tl;
  }
  
  ,
  
  _showSectionProcessStep4(direction = 1) {
    const spinner = this._components?.spinner;
    const cam = this._camera;
    if (!spinner || !cam) return;
  
    const to = sectionPositions['Step4'];
    this._lastSection = 'sectionProcessStep4';
  
    if (direction > 0) {
      const from = sectionPositions['Step3'];
      const control = { x: 4, y: 0, z: 28 };
  
      const curve = new QuadraticBezierCurve3(
        new Vector3(from.x, from.y, from.z),
        new Vector3(control.x, control.y, control.z),
        new Vector3(to.x, to.y, to.z)
      );
  
      const spinnerProgress = { t: 0 };
  
      const tl = gsap.timeline({
        onUpdate: () => {
          const pos = curve.getPoint(spinnerProgress.t);
          spinner.position.copy(pos);
          cam.position.set(pos.x, 20, pos.z);
          cam.lookAt(spinner.position);
          cam.updateMatrixWorld(true);
        },
        onComplete: () => {
          this._revealStepText?.('Step 4: Conclude', new Vector3(to.x - 2, 0.1, to.z));
        }
      });
  
      tl.to(spinnerProgress, {
        t: 1,
        duration: 1.2,
        ease: 'power2.inOut'
      });
  
      return tl;
  
    } else {
      const tl = gsap.timeline({
        onUpdate: () => {
          cam.lookAt(spinner.position);
          cam.updateMatrixWorld(true);
        },
        onComplete: () => {
          this._revealStepText?.('Step 4: Conclude', new Vector3(to.x - 2, 0.1, to.z));
        }
      });
  
      tl.to(cam.position, {
        x: to.x,
        y: 20,
        z: to.z,
        duration: 1.5,
        ease: 'power2.inOut'
      });
  
      return tl;
    }
  }
  
  
,  

_showAboutPartners() {
  this._lastSection = 'section5';

  this._hideAllStepTexts();

  const spinner = this._components?.spinner;
  const cam = this._camera;
  if (!spinner || !cam) return;

  const tl = gsap.timeline({
    onUpdate: () => {
      cam.lookAt(spinner.position);
      cam.updateMatrixWorld(true);
    }
  });

  // ✅ Animate only Y position of camera
  tl.to(cam.position, {
    z: 52.34,
    y: 1.24,
    duration: 2,
    ease: 'power2.inOut'
  }, 0);

  // ✅ Fade sparks
  tl.to(this._components.spinner._sparks, {
    alpha: 0.1,
    duration: 1.5
  }, 0);

  return tl;
}

,

  _showAboutContact() {
    console.log('hey')
  }
};
