// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import Body from '@/components/Body';

export default {
    extends: Section,

    components: {
        Body,
    },

    methods: {
        show() {
            const timeline = new gsap.timeline();
            timeline.to(this.$refs.item, 1, { alpha: 1, stagger: 0.1, ease: 'power1.inOut' });

            return timeline;
        },
    },
};
