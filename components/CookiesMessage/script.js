// Vendor
import gsap from 'gsap';

export default {
    methods: {
        show() {
            const timeline = new gsap.timeline();

            timeline.to(this.$el, 1, { alpha: 1, ease: 'sine.inOut' });

            return timeline;
        },

        hide() {
            const timeline = new gsap.timeline();

            timeline.to(this.$el, 1, { alpha: 0, ease: 'sine.inOut' });

            return timeline;
        },
    },
};
