// Vendor
import gsap from 'gsap';

// Components
import Page from '@/components/Page';
import ScrollControlServicesDetail from '@/components/ScrollControlServicesDetail';

// Sections
import SectionServicesDetail from '@/sections/services/SectionServicesDetail';

import SectionHeaderDetail from '@/sections/services/HeaderDetail'

export default {
  extends: Page,

  components: {
    ScrollControlServicesDetail,
    SectionServicesDetail,
    SectionHeaderDetail
  },

  created() {
    this.scrollTriggers = true;
  },

  methods: {
    transitionIn(done, routeInfo) {
      const delay = routeInfo.previous === null ? 1 : 0;
      const timeline = gsap.timeline({ onComplete: done, delay });

      timeline.add(this.$refs.header.transitionIn(), 0);
      timeline.add(this.$root.theNavigation.show(), 1);
      // timeline.add(this.$root.buttonMute.show(), 1.1);
      if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('empty'), 0);
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
