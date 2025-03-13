// Components
import Section from '@/components/Section';
import gsap from 'gsap';

export default {
    extends: Section,

    components: {},

    methods: {
        show() {
            const timeline = new gsap.timeline();

            timeline.to(this.$el, 1, { alpha: 1, ease: 'power1.inOut' });

            return timeline;
        },

        title(content) {
            return content.split('\n');
        },
    },
};
