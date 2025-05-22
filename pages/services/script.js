import gsap from 'gsap';
import Page from '@/components/Page';
import ScrollControl from '@/components/ScrollControlServices';
import ServicesSlider from '@/sections/services/ServicesSlider';
import SectionFooter from '@/sections/shared/Footer';


// Plugins
import axios from '@/plugins/axios';

export default {
  extends: Page,

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
    transitionIn(done, routInfo) {
        const delay = routInfo.previous === null ? 1 : 0;
        const timeline = new gsap.timeline({ onComplete: done, delay });
        if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('services'), 0);
        // timeline.add(this.$refs.header.transitionIn(), 0);
        timeline.add(this.$root.theNavigation.show(), 1);
        // timeline.add(this.$root.buttonMute.show(), 1.1);

    },

    transitionOut(done) {
        const timeline = new gsap.timeline({ onComplete: done });
        if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene(), 0);
        timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
    },
},
};
