// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';

export default {
    extends: SectionAbout,

    components: {
        Heading,
    },

    methods: {
        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
            this._timelineBackgroundShow.fromTo(this.$refs.item, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut', stagger: 0.1 }, 1);
            return this._timelineBackgroundShow;
        },
    },
};
