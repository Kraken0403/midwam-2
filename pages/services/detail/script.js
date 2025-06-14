// Vendor
import gsap from 'gsap';
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
import ScrollControlServicesDetail from '@/components/ScrollControlServicesDetail';

// Sections
import SectionServicesDetail from '@/sections/services/SectionServicesDetail';
import SectionHeaderDetail from '@/sections/services/HeaderDetail';

export default {
  extends: Page,

  components: {
    ScrollControlServicesDetail,
    SectionServicesDetail,
    SectionHeaderDetail,
  },

  asyncData({ params, app }) {
    const slug = params.slug;
    const locale = app.i18n.locale;

    return axios.get(`page/services?slug=${slug}&lang=${locale}`).then((res) => {
      return {
        metadata: res.data.seo,
        header: res.data.header,
        sectionsData: res.data.sections,
        related: res.data.related,
      };
    });
  },

  data() {
    return {
      scrollTriggers: true, // or set in created
    };
  },

  methods: {
    transitionIn(done, routeInfo) {
      const delay = routeInfo.previous === null ? 1 : 0;
      const timeline = gsap.timeline({ onComplete: done, delay });

      // ✅ Check if ref exists before calling
      if (this.$refs.header && this.$refs.header.transitionIn) {
        timeline.add(this.$refs.header.transitionIn(), 0);
      }

      if (this.$refs.servicesdetail && this.$refs.servicesdetail.backgroundShow) {
        timeline.add(this.$refs.servicesdetail.backgroundShow(), 0);
      }

      if (this.$root.theNavigation && this.$root.theNavigation.show) {
        timeline.add(this.$root.theNavigation.show(), 1);
      }

      if (this.$root.webglApp && this.$root.webglApp.showScene) {
        timeline.add(this.$root.webglApp.showScene('empty'), 0);
      }
    },

    transitionOut(done) {
      const timeline = gsap.timeline({ onComplete: done });

      if (this.$root.webglApp && this.$root.webglApp.hideScene) {
        timeline.add(this.$root.webglApp.hideScene(), 0);
      }

      timeline.to(this.$el, {
        duration: 0.8,
        opacity: 0,
        ease: 'sine.inOut',
      }, 0);
    },
  },
};
