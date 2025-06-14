// Vendor
import gsap from 'gsap';
import Page from '@/components/Page';
// import ScrollControl from '@/components/ScrollControlServices'; // This version should now handle only free scroll
import RegisterServicesImages from '@/utils/RegisterServicesImages';
// Sections
import ServicesSlider from '@/sections/services/ServicesSlider';
import SectionFooter from '@/sections/shared/Footer';
import ResourceLoader from '@/utils/ResourceLoader';
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
      texturesReady: false,
    };
  },

  async created() {
    this.scrollTriggers = true;

    await RegisterServicesImages(this.servicesData)
    this.texturesReady = true;
  },

  mounted() {
    this.isReady = true; // allow rendering of slider when scene is ready
    // if (this.servicesData?.length) {
    //   RegisterServicesImages(this.servicesData);
    // }
  },

  methods: {
    transitionIn() {
      const timeline = new gsap.timeline();
      if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('services'), 0);
      timeline.to(this.$el, 1.3, { alpha: 1, ease: 'sine.inOut' }, 0.5);
      timeline.add(this.$root.theNavigation.show(), 1);
      // timeline.add(this.$root.buttonMute.show(), 1.1);
      this.isReady = true;           
  },

  transitionOut(done) {
      const timeline = new gsap.timeline({ onComplete: done });
      if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene('services'), 0);
      timeline.to(this.$el, 1, { alpha: 0, ease: 'sine.inOut' }, 0);
  },
  },
};
