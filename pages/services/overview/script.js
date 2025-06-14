// Vendor
import gsap from 'gsap';
import Page from '@/components/Page';
// import ScrollControl from '@/components/ScrollControlServices'; // This version should now handle only free scroll
import RegisterServicesImages from '@/utils/RegisterServicesImages';
// Sections
import ServicesSlider from '@/sections/services/ServicesSlider';
import SectionFooter from '@/sections/shared/Footer';

// Plugins
import axios from '@/plugins/axios';

export default {
  extends: Page,

  components: {
    ServicesSlider,
    SectionFooter,
  },

  async asyncData({ app }) {
    const locale = app.i18n.locale;
    const res = await axios.get(`page/services?lang=${locale}`);
    console.log('services data:', res.data.items[0].image.sizes['1920x0'].url); // ✅ correct
  
    return {
      metadata: res.data.seo,
      servicesData: res.data.items, // ✅ fix: use 'items' instead of 'sections'
    };
  }
  ,

  data() {
    return {
      isReady: false,
    };
  },

  created() {
    this.scrollTriggers = true;
  },

  mounted() {
    this.isReady = true; // allow rendering of slider when scene is ready
    if (this.servicesData?.length) {
      RegisterServicesImages(this.servicesData);
    }
  },

  methods: {
    transitionIn(done, routeInfo) {
      const delay = routeInfo.previous === null ? 1 : 0;

      const waitForScene = () => {
        const webgl = this.$root.webglApp;
        const sceneExists = webgl?.getScene?.('services');

        if (sceneExists) {
          const timeline = gsap.timeline({ onComplete: done, delay });

          // ✅ Show WebGL scene
          timeline.add(webgl.showScene('services'), 0);

          // ✅ Fade in the page
          timeline.to(this.$el, {
            opacity: 1,
            autoAlpha: 1,
            duration: 1.3,
            ease: 'sine.inOut',
          }, 0.5);

          // ✅ Show nav
          timeline.add(this.$root.theNavigation.show(), 1);

          this.isReady = true;
        } else {
          requestAnimationFrame(waitForScene);
        }
      };

      this.$nextTick(() => {
        requestAnimationFrame(waitForScene);
      });
    },

    transitionOut(done) {
      const timeline = gsap.timeline({ onComplete: done });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.hideScene(), 0);
      }

      timeline.to(this.$el, {
        duration: 0.8,
        alpha: 0,
        ease: 'sine.inOut',
      }, 0);
    },
  },
};
