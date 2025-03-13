// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';

export default {
    extends: SectionAbout,

    components: {},

    computed: {
        title() {
            const title = this.data.title;
            return title.split('\n');
        },
    },

    methods: {
        backgroundShow() {
            this._timelineBackgroundShow = new gsap.timeline();
            this._timelineBackgroundShow.fromTo(this.$el, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, 0.7);
            return this._timelineBackgroundShow;
        },
    },
};
