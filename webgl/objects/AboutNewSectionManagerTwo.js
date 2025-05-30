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

  _showAboutHeader() {
    if (this._lastSection === 'AboutHeader') return;
    this._lastSection = 'AboutHeader';
  
    const tl = gsap.timeline();
    tl.to(this.position, 
      { x: this._locale === 'en' ? 1.38 : 4.5, duration: 1.5, ease: 'power2.inOut' });

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
    const wave = this._components?.waves;

    this._hideAllStepTexts?.();

    const tl = gsap.timeline();
    tl.to(this.position, { x: this._locale === 'en' ? -3.45 : 5.6, duration: 2, ease: 'power2.inOut' });

    tl.to(this._camera.position, {
      z: 4.63, y: 20,
      duration: 2, ease: 'power2.inOut',
      onUpdate: () => this._camera.lookAt(this._cameraTarget)
    }, 0);

    tl.to(this._components.spinner._sparks, { alpha: 1, duration: 1.5 }, 0);

    wave.setOpacity(0)

  },

  _showProOne() {
      this._lastSection = 'ProOne'
      const wave = this._components?.waves;
      const tl = gsap.timeline();

      tl.to(this.position, 
        { x: this._locale === 'en' ? -1.38 : 4.5, duration: 1.5, ease: 'power2.inOut' });

      tl.to(this._camera.position, {
        z: 9.34, y: 1.24,
        duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => this._camera.lookAt(this._cameraTarget)
      }, 0);

      wave.setOpacity(0.25)

  },

  _showProTwo() {
    this._lastSection = 'ProTwo'

    const tl = gsap.timeline();

    tl.to(this.position, 
      { x: this._locale === 'en' ? 1.38 : 5.6, duration: 1.5, ease: 'power2.inOut' });

},

_showProThree() {
  this._lastSection = 'ProThree'

  const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? -1.38 : 4.5, duration: 1.5, ease: 'power2.inOut' });

  tl.to(this._camera.position, {
    z: 9.34, y: 1.24,
    duration: 1.5, ease: 'power2.inOut',
    onUpdate: () => this._camera.lookAt(this._cameraTarget)
  }, 0);

},

_showProFour() {
  this._lastSection = 'ProFour'

  const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? 1.38 : 5.6, duration: 1.5, ease: 'power2.inOut' });
},

  
_showSectionAboutPartners() {
  this._lastSection = 'SectionAboutPartners';
  const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? -15.38 : 5.6, duration: 1.5, ease: 'power2.inOut' });
  
    return tl;
}

,

  _showAboutContact() {
    this._lastSection = 'AboutContact';
    const tl = gsap.timeline();

  tl.to(this.position, 
    { x: this._locale === 'en' ? -1.5 : 5.6, duration: 1.5, ease: 'power2.inOut' });
  
    return tl;
  }
};
