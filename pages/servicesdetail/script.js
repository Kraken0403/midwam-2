// Vendor
import gsap from 'gsap';

// Components
import Page from '@/components/Page';
import ScrollControlServicesDetail from '@/components/ScrollControlServicesDetail';

// Sections
import SectionServicesDetail from '@/sections/services/SectionServicesDetail';

export default {
  extends: Page,

  components: {
    ScrollControlServicesDetail,
    SectionServicesDetail,
  },

  created() {
    this.scrollTriggers = true;
  },

  methods: {
    transitionIn(done, routeInfo) {
      const delay = routeInfo.previous === null ? 1 : 0;
      const timeline = gsap.timeline({ onComplete: done, delay });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.showScene('contact'), 0);
      }

      timeline.add(this.$root.theNavigation.show(), 1);
      // Optional: add scroll section fade in
      // timeline.from(this.$refs.section.$el, { opacity: 0, duration: 0.8 }, 0.5);
    },

    transitionOut(done) {
      const timeline = gsap.timeline({ onComplete: done });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.hideScene(), 0);
      }

      timeline.to(this.$el, { duration: 0.8, opacity: 0, ease: 'sine.inOut' }, 0);
    },
  },
};
