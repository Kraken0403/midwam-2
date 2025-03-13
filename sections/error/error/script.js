// Vendor
import gsap from 'gsap';

// Components
import Heading from '@/components/Heading';
import ButtonArrow from '@/components/ButtonArrow';

export default {
    props: ['error'],

    data() {
        return {
            environment: this.$root.environment,
        };
    },

    components: {
        Heading,
        ButtonArrow,
    },

    methods: {
        show() {
            const timeline = new gsap.timeline();
            timeline.to(this.$refs.button, 1, { alpha: 1, ease: 'power1.inOut' }, 0);
        },
    },
};
