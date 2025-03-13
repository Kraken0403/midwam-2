// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import Heading from '@/components/Heading';
import Carousel from '@/components/Carousel';
import SlideGallery from '@/components/SlideGallery';

export default {
    extends: Section,

    components: {
        Carousel,
        Heading,
    },

    data() {
        return {
            slideComponent: SlideGallery,
            lang: this.$i18n.locale,
            isInView: false,
        };
    },

    created() {
        this.direction = this.lang === 'ar' ? -1 : 1;
    },

    methods: {
        show() {
            if (this.isInView) return;
            this.isInView = true;
            const timeline = new gsap.timeline();
            timeline.to(this.$el, 1, { alpha: 1, ease: 'power1.inOut' });
            timeline.add(this.$refs.carousel.transitionIn(), 0);

            return timeline;
        },
    },
};
