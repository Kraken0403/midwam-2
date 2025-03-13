// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import ProcessStep from '@/components/ProcessStep';

export default {
    extends: SectionAbout,

    components: {
        ProcessStep,
    },

    computed: {
        title() {
            const title = this.data.title;
            return title.split('\n');
        },
    },

    methods: {
        backgroundShow() {
            this._timelineBackgroundShow = new gsap.timeline();
            this._timelineBackgroundShow.fromTo([this.$refs.columnLeft, this.$refs.columnRight], 1.2, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut', stagger: 0.2 }, 0.7);
            return this._timelineBackgroundShow;
        },
    },
};
