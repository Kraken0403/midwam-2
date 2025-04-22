
import Page from '@/components/Page';
import SmoothScroll from '@/components/SmoothScroll';
import SectionHeader from '@/sections/services/Header';
import ServiceItemSection from '@/sections/services/ServiceItemSection';
import SectionFooter from '@/sections/shared/Footer';
import ScrollControl from '@/components/ScrollControlAbout';


import gsap from 'gsap';

// Utils
// import AudioManager from '@/utils/AudioManager';

export default {
    extends: Page,

    components: {
        ScrollControl,
        // SmoothScroll,
        SectionHeader,
        SectionFooter,
        ServiceItemSection
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
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('services'), 0);
            console.log(this.$root.webglApp.getScene('services'))
            // timeline.add(this.$refs.header.transitionIn(), 0.5);
            timeline.add(this.$root.theNavigation.show(), 1);
            // timeline.add(this.$root.buttonMute.show(), 1.1);

        },

        transitionOut(done) {
            this.enablePageBounce();

            const timeline = new gsap.timeline({ onComplete: done });
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene(), 0);
            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
            timeline.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8);
            timeline.call(
                () => {
                    this.$root.webglApp.getScene('services')._container.position.y = 0;
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
