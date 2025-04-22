// Vendor
import gsap from 'gsap';

// Utils
import AudioManager from '@/utils/AudioManager';

// Components
import Page from '@/components/Page';
import SmoothScroll from '@/components/SmoothScroll';

// Plugins
import axios from '@/plugins/axios';

// Sections
import SectionHeader from '@/sections/contact/Header';
import ButtonUnderlined from '@/components/ButtonUnderlined';
// import SectionVisit from '@/sections/contact/Visit';
// import ContactFormSection from '@/sections/contact/ContactFormSection';
// import SectionFooter from '@/sections/shared/Footer';


export default {
    extends: Page,

    components: {
        SectionHeader,
        // SectionFooter,
        ButtonUnderlined,
        SmoothScroll,
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
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('contact'), 0);
            timeline.add(this.$refs.header.transitionIn(), 0);
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
