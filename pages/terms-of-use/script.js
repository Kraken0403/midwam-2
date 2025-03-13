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
import SectionLegal from '@/sections/shared/Legal';
import SectionFooter from '@/sections/shared/Footer';

export default {
    extends: Page,

    components: {
        SectionLegal,
        SectionFooter,
        SmoothScroll,
    },

    asyncData({ app }) {
        const locale = app.i18n.locale;
        return axios.get(`page/terms-of-use?lang=${locale}`).then((res) => {
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
            timeline.to(this.$el, 0.8, { alpha: 1, ease: 'sine.inOut' }, 0);
            timeline.add(this.$root.theNavigation.show(), 1);

            AudioManager.play('background-loop-1', {
                loop: true,
            });
        },

        transitionOut(done) {
            const timeline = new gsap.timeline({ onComplete: done });
            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
        },
    },
};
