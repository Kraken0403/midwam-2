// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import ButtonUnderlined from '@/components/ButtonUnderlined';
import Heading from '@/components/Heading';

export default {
    extends: Section,

    components: {
        ButtonUnderlined,
        Heading,
    },

    methods: {
        show() {
            const timeline = new gsap.timeline();
            timeline.to(this.$refs.button.$el, 1, { alpha: 1, ease: 'power1.inOut' }, 0);
            // timeline.to(this.$refs.carousel, 1, { alpha: 1, ease: 'power1.inOut' }, 0);
        },
    },
};
