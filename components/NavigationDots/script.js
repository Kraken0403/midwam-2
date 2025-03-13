// Vendor
import gsap from 'gsap';

export default {
    props: ['data'],

    data() {
        return {
            activeIndex: 0,
        };
    },

    methods: {
        /**
         * Public
         */
        show() {
            const timeline = new gsap.timeline();
            timeline.fromTo(this.$refs.items, 0.8, { alpha: 0 }, { alpha: 1, stagger: 0.1, ease: 'sine.inOut' }, 0);
            return timeline;
        },

        goto(index) {
            this.activeIndex = index;
        },
    },
};
