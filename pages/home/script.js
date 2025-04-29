// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
// import ScrollControl from '@/components/ScrollControlHome';
import ScrollControl from '@/components/ScrollControlHomeNew';


// import SmoothScroll from '@/components/SmoothScroll';

// Sections
import SectionHeader from '@/sections/home/Header';
import SectionDesign from '@/sections/home/Design';
import SectionEmotion from '@/sections/home/Emotion';
import SectionReality from '@/sections/home/Reality';
import SectionDimension from '@/sections/home/Dimension';
import SectionKnowledge from '@/sections/home/Knowledge';
import SectionImmersion from '@/sections/home/Immersion';
import SectionPortfolio from '@/sections/home/Portfolio';
import SectionNews from '@/sections/shared/News';
import SectionFooter from '@/sections/shared/Footer';

export default {
    extends: Page,

    components: {
        ScrollControl,
        SectionHeader,
        SectionDesign,
        SectionEmotion,
        SectionReality,
        SectionDimension,
        SectionKnowledge,
        SectionImmersion,
        SectionPortfolio,
        SectionNews,
        SectionFooter,
    },

    asyncData({ app }) {
        const locale = app.i18n.locale;
        return axios.get(`page/home?lang=${locale}`).then((res) => {
            return { metadata: res.data.seo, ...res.data.sections };
        });
    },

    created() {
        this.scrollTriggers = true;
    },

    mounted() {
        this.$root.scrollControl = this.$refs.scrollControl;

        if (this.$root.webglApp) {
            this.$root.webglApp.showScene('home');
    
            // 🔥 VERY IMPORTANT: Manually update the postprocessing when returning
            const scene = this.$root.webglApp.getScene('home');
            if (scene && scene._updatePostProcessing) {
                scene._updatePostProcessing();
            }
        }
    },

    methods: {
        /**
         * Public
         */
        transitionIn(done, routInfo) {
            this.$refs.scrollControl.enable();
            this.disablePageBounce();

            const delay = routInfo.previous === null ? 0 : 0;
            const timeline = new gsap.timeline({ onComplete: done, delay });

            if (this.$root.webglApp) {
                timeline.add(this.$root.webglApp.showScene('home'), 0);
            }

             if (this.$refs.header?.transitionIn) {
                timeline.add(this.$refs.header.transitionIn(), 0.5);
                }
            timeline.add(this.$root.theNavigation.show(), 2);
            // timeline.add(this.$root.buttonMute.show(), 2.1);

            if (this.$root.customCursor) {
                timeline.add(this.$root.customCursor.show(), 2);
                timeline.call(this.$root.customCursor.enableClickAndHold, null, 2);
                timeline.call(this.$root.customCursor.showIconA, null, 2);
            }

            return timeline
        },

        transitionOut(done) {
            this.enablePageBounce();
            const timeline = new gsap.timeline({ onComplete: done });

            if (this.$root.webglApp) {
                timeline.add(this.$root.webglApp.hideScene(), 0);
            }

            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);

            if (this.$root.webglBackground?.$el) {
                timeline.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8);
              }

              timeline.call(
                () => {
                  const scene = this.$root.webglApp.getScene('home');
                  if (scene && scene._container) scene._container.position.y = 0;
                },
                null,
                0.8
              );
        
            if (this.$root.customCursor) {
                this.$root.customCursor.disableClickAndHold();
                this.$root.customCursor.hide();
            }

            return timeline
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
