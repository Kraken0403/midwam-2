import gsap from 'gsap';
import Page from '@/components/Page';
import ScrollControl from '@/components/ScrollControlServices';
import ServicesSlider from '@/sections/services/ServicesSlider';
import SectionFooter from '@/sections/shared/Footer';


// Plugins
import axios from '@/plugins/axios';

export default {
  extends: Page,

  data() {
    return {
      isReady: false,
    };
  },
  

  components: {
    ScrollControl,
    ServicesSlider,
    SectionFooter,
  },

  asyncData({ app }) {
    const locale = app.i18n.locale;
    return axios.get(`page/contact?lang=${locale}`).then((res) => {
        return { metadata: res.data.seo, ...res.data.sections };
    });
},

created() {
    this.scrollTriggers = true;
},

methods: {
  transitionIn(done, routeInfo) {
    const delay = routeInfo.previous === null ? 1 : 0;
  
    const waitForScene = () => {
      const webgl = this.$root.webglApp;
      const sceneExists = webgl?.getScene?.('services');
  
      if (sceneExists) {
        const timeline = gsap.timeline({ onComplete: done, delay });
  
        // ⏳ Reveal WebGL scene first
        timeline.add(webgl.showScene('services'), 0);
        console.log('el: ',this.$el)
        // ✅ Fade in the page container (".page")
        timeline.to(this.$el, {
          opacity: 1,
          autoAlpha: 1,
          duration: 1.3,
          ease: 'sine.inOut',
        }, 0.5); // delay a bit to match scene load
  
        timeline.add(this.$root.theNavigation.show(), 1);
        this.isReady = true;
      } else {
        requestAnimationFrame(waitForScene);
      }
    };
  
    // Ensure DOM and scene are ready
    this.$nextTick(() => {
      requestAnimationFrame(waitForScene);
    });
  }
  
  ,
      
    

    transitionOut(done) {
        const timeline = new gsap.timeline({ onComplete: done });
        if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene(), 0);
        timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
    },
},
};
