// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Body from '@/components/Body';

export default {
    extends: SectionAbout,

    components: {
        Body,
    },

    methods: {
        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            this._timelineBackgroundShow.add(this.$refs.body.showBlock(0, direction), 0.7);
            return this._timelineBackgroundShow;
        },
    },
};
