// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';

export default {
    name: 'ProTwo',
    extends: SectionAbout,

    methods: {
        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
            this._timelineBackgroundShow.add(this.$refs.body.showBlock(0, direction), 0.7);
            
            return this._timelineBackgroundShow;
        },
    },
};
