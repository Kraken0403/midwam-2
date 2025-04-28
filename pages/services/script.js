// pages/services.js

import gsap from 'gsap';
import Page from '@/components/Page';
import ScrollControl from '@/components/ScrollControlServices';
import SectionHeader from '@/sections/services/Header';
import ServiceItemSection from '@/sections/services/ServiceItemSection';
import SectionFooter from '@/sections/shared/Footer';

export default {
  extends: Page,

  components: {
    ScrollControl,
    SectionHeader,
    ServiceItemSection,
    SectionFooter,
  },

  created() {
    this.scrollTriggers = true;
  },

  methods: {
    transitionIn(done, routInfo) {
        this.$refs.scrollControl.enable();
        this.disablePageBounce();
      
        const delay = routInfo.previous === null ? 0 : 0;
        const timeline = new gsap.timeline({ onComplete: done, delay });
      
        // ✅ Show WebGL scene
        if (this.$root.webglApp) {
          timeline.add(this.$root.webglApp.showScene('services'), 0);
        }
      
        // ✅ Optional: Header animation
        if (this.$refs.header?.transitionIn) {
          timeline.add(this.$refs.header.transitionIn(), 0.5);
        }
      
        // ✅ Navigation
        timeline.add(this.$root.theNavigation.show(), 1);
      
        // ✅ Service section fade-in AFTER scene
        if (this.$refs.servicesitem?.$el) {
          timeline.fromTo(
            this.$refs.servicesitem.$el,
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' },
            1.2 // start after nav appears
          );
        }
      
        return timeline;
      },
      

    transitionOut(done) {
      this.enablePageBounce();

      const timeline = new gsap.timeline({ onComplete: done });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.hideScene(), 0);
      }

      timeline.to(this.$el, { duration: 0.8, autoAlpha: 0, ease: 'sine.inOut' }, 0);

      if (this.$root.webglBackground?.$el) {
        timeline.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8);
      }

      timeline.call(
        () => {
          const scene = this.$root.webglApp.getScene('services');
          if (scene && scene._container) scene._container.position.y = 0;
        },
        null,
        0.8
      );

      return timeline;
    },

    enablePageBounce() {
      document.documentElement.classList.remove('prevent-bounce');
    },

    disablePageBounce() {
      document.documentElement.classList.add('prevent-bounce');
    },
  },
};
