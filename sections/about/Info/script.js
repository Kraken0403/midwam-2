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
            return this._timelineBackgroundShow;
        },
    },
};
