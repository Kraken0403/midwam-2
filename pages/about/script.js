// Vendor
import gsap from 'gsap';

// Utils
import AudioManager from '@/utils/AudioManager';

// Components
import Page from '@/components/Page';
// import SmoothScroll from '@/components/SmoothScroll';
import ScrollControl from '@/components/ScrollControlAboutNew';

// Plugins
import axios from '@/plugins/axios';

// Sections
import SectionHeader from '@/sections/about/Header';
import SectionIntro from '@/sections/about/Intro';
import SectionVideo from '@/sections/about/Video';
import SectionInfo from '@/sections/about/Info';
import SectionInfo2 from '@/sections/about/Info2';
import SectionCarousel from '@/sections/about/Carousel';
import SectionValues from '@/sections/about/Values';
import SectionServices from '@/sections/about/Services';
import SectionPartners from '@/sections/about/Partners';
import SectionProcessPart1 from '@/sections/about/ProcessPart1';
import SectionProcessPart2 from '@/sections/about/ProcessPart2';
import SectionContact from '@/sections/about/Contact';
import SectionFooter from '@/sections/shared/Footer';
// import ProcessNew from '@/sections/about/ProcessNew';
// import SectionProcessStep1 from '@/sections/about/ProcessStep1';
// import SectionProcessStep2 from '@/sections/about/ProcessStep2';
// import SectionProcessStep3 from '@/sections/about/ProcessStep3';
// import SectionProcessStep4 from '@/sections/about/ProcessStep4';
import ProOne from '@/sections/about/ProOne';
import ProTwo from '@/sections/about/ProTwo';
import ProThree from '@/sections/about/ProThree';
import ProFour from '@/sections/about/ProFour';

export default {
    extends: Page,

    components: {
        // SectionProcessStep1,
        // SectionProcessStep2,
        // SectionProcessStep3,
        // SectionProcessStep4,
        // ProcessNew,
        SectionHeader,
        SectionIntro,
        SectionVideo,
        SectionInfo,
        ProOne,
        ProTwo,
        ProThree,
        ProFour,
        SectionInfo2,
        SectionCarousel,
        SectionValues,
        SectionServices,
        SectionPartners,
        SectionProcessPart1,
        SectionProcessPart2,
        SectionContact,
        SectionFooter,
        ScrollControl,
    },

    asyncData({ app }) {
        const locale = app.i18n.locale;
        return axios.get(`page/about?lang=${locale}`).then((res) => {
            // console.log('data', res.data.sections)
            return { metadata: res.data.seo, ...res.data.sections };
            
        });
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
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('about'), 0);
            timeline.add(this.$refs.header.transitionIn(), 0.5);
            timeline.add(this.$root.theNavigation.show(), 1);

         
        },

        transitionOut(done) {
            this.enablePageBounce();

            const timeline = new gsap.timeline({ onComplete: done });
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene(), 0);
            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
            timeline.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8);
            timeline.call(
                () => {
                    this.$root.webglApp.getScene('about')._container.position.y = 0;
                },
                null,
                0.8
            );
        },

        /**
         * Private
         */
        enablePageBounce() {
            document.documentElement.classList.remove('prevent-bounce');
        },

        disablePageBounce() {
            document.documentElement.classList.add('prevent-bounce');
        },
    },
};
