// Vendor
import gsap from 'gsap';

// Component
import SectionAbout from '@/components/SectionAbout';
import CarouselAbout from '@/components/CarouselAbout';

export default {
    name: 'AboutCarousel',
    extends: SectionAbout,

    components: {
        CarouselAbout,
    },

    methods: {
        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            // this._timelineBackgroundShow.fromTo(this.$el, 1, { x: 300 }, { x: 0, ease: 'power1.out' }, 0.7);
            this._timelineBackgroundShow.fromTo(this.$el, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, 0.8);
            return this._timelineBackgroundShow;
        },
    },
};
