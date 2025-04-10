
import Page from '@/components/Page';
import SmoothScroll from '@/components/SmoothScroll';
import SectionHeader from '@/sections/services/Header';
import ServiceItemSection from '@/sections/services/ServiceItemSection';
import SectionFooter from '@/sections/shared/Footer';

import gsap from 'gsap';

// Utils
// import AudioManager from '@/utils/AudioManager';

export default {
    extends: Page,

    components: {
        SmoothScroll,
        SectionHeader,
        SectionFooter,
        ServiceItemSection
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

            // AudioManager.play('background-loop-1', {
            //     loop: true,
            // });
        },

        transitionOut(done) {
            const timeline = new gsap.timeline({ onComplete: done });
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene(), 0);
            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
        },
    },
   
};
