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
            const items = [];
            if (this.$refs.item1) items.push(this.$refs.item1);
            if (this.$refs.item2) items.push(this.$refs.item2);

            const timeline = new gsap.timeline();
            timeline.to(items, 1, { alpha: 1, stagger: 0.1, ease: 'power1.inOut' });
            return timeline;
        },
    },
};
