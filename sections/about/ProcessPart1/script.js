// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';
import ProcessStep from '@/components/ProcessStep';

export default {
    extends: SectionAbout,

    components: {
        Heading,
        ProcessStep,
    },

    methods: {
        backgroundShow() {
            this._timelineBackgroundShow = new gsap.timeline();
            this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
            this._timelineBackgroundShow.fromTo(this.$refs.columnRight, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, 1.1);
            return this._timelineBackgroundShow;
        },
    },
};
