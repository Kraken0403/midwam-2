// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
import ScrollControl from '@/components/ScrollControlHomeNew';

// Sections
import SectionHeader from '@/sections/home/Header';
// import SectionServicesPlanes from '@/sections/home/ServicesPlanes';
import SectionPartnersCustom from '@/sections/home/PartnersCustom';
import SectionSlider from '@/sections/home/Slider';
import SectionKnowledge from '@/sections/home/Knowledge';
import SectionImmersion from '@/sections/home/Immersion';
import SectionPortfolio from '@/sections/home/Portfolio';
import SectionServicesCards from '@/sections/home/ServicesCards';
import SectionNews from '@/sections/shared/News';
import SectionFooter from '@/sections/shared/Footer';
import SectionFormCta from '@/sections/home/FormCta';

import logo1 from '@/assets/images/logos/1.png'
import logo2 from '@/assets/images/logos/2.png'
import logo3 from '@/assets/images/logos/3.png'
import logo4 from '@/assets/images/logos/4.png'
import logo5 from '@/assets/images/logos/5.png'

export default {
  extends: Page,

  components: {
    ScrollControl,
    SectionHeader,
    SectionPartnersCustom,
    // SectionServicesPlanes,
    SectionSlider,
    SectionFormCta,
    SectionServicesCards,
    SectionKnowledge,
    SectionImmersion,
    SectionPortfolio,
    SectionNews,
    SectionFooter,
  },

  async asyncData({ app }) {
    const locale = app.i18n.locale;
    const res = await axios.get(`page/home?lang=${locale}`);
    return {
      metadata: res.data.seo,
      ...res.data.sections,
    };
  },

  data() {
    return {
      dataSectionPartnersCustom: {
        title: 'We Partner with Talented People From All over the world',
        logos: [
          { logo: logo1, link: 'https://partner1.com' },
          { logo: logo2, link: 'https://partner3.com' },
          { logo: logo3, link: 'https://partner3.com' },
          { logo: logo4, link: 'https://partner3.com' },
          { logo: logo5, link: 'https://partner3.com' },
        ],
      },
    };
  },

  created() {
    this.scrollTriggers = true;
  },

  mounted() {
    this.$root.scrollControl = this.$refs.scrollControl;

    if (this.$root.webglApp) {
        const scene = this.$root.webglApp.getScene('home');
      
        if (scene?.reset) {
          scene.reset(); // ✅ make sure spinner, carousel, camera reset
        }
      
        this.$root.webglApp.showScene('home');
      
        if (scene?._updatePostProcessing) {
          scene._updatePostProcessing();
        }
      }
      
  },

  methods: {
    transitionIn(done, routInfo) {
      this.$refs.scrollControl.enable();
      this.disablePageBounce();

      const delay = routInfo.previous === null ? 0 : 0;
      const timeline = gsap.timeline({ onComplete: done, delay });

      if (this.$root.webglApp) {
        const scene = this.$root.webglApp.getScene('home');
        
        if (scene?.reset) {
          scene.reset(); // ✅ make sure everything resets on route transitions
        }
      
        timeline.add(this.$root.webglApp.showScene('home'), 0);
      }

      if (this.$refs.header?.transitionIn) {
        timeline.add(this.$refs.header.transitionIn(), 0.5);
      }

      timeline.add(this.$root.theNavigation.show(), 2);

      if (this.$root.customCursor) {
        timeline.add(this.$root.customCursor.show(), 2);
        timeline.call(this.$root.customCursor.enableClickAndHold, null, 2);
        timeline.call(this.$root.customCursor.showIconA, null, 2);
      }

      return timeline;
    },

    transitionOut(done) {
      this.enablePageBounce();
      const timeline = gsap.timeline({ onComplete: done });

      if (this.$root.webglApp) {
        timeline.add(this.$root.webglApp.hideScene(), 0);
      }

      timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);

      if (this.$root.webglBackground?.$el) {
        timeline.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8);
      }

      timeline.call(() => {
        const scene = this.$root.webglApp.getScene('home');
        if (scene && scene._container) scene._container.position.y = 0;
      }, null, 0.8);

      if (this.$root.customCursor) {
        this.$root.customCursor.disableClickAndHold();
        this.$root.customCursor.hide();
      }

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
