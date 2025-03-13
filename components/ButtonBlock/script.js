// Vendor
import gsap from 'gsap';

// Assets
import Arrow from '@/assets/images/icons/arrow-right.svg?inline';

export default {
    props: ['data'],

    components: {
        Arrow,
    },

    methods: {
        /**
         * Public
         */
        show() {
            const timelineShow = new gsap.timeline();
            timelineShow.fromTo(this.$el, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0);
            return timelineShow;
        },

        // Analytics
        clickHandler(e) {
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'home header CTA click',
                eventLabel: e.currentTarget.href,
            });
        },
    },
};
