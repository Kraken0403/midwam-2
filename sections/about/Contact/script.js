// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import ButtonArrow from '@/components/ButtonArrow';
import Heading from '@/components/Heading';

export default {
    extends: SectionAbout,

    components: {
        ButtonArrow,
        Heading,
    },

    mounted() {
        this.$refs.button.$el.addEventListener('click', this.clickContactHandler);
    },

    methods: {
        backgroundShow(done, direction) {
            this._timelineBackgroundShow = new gsap.timeline({ onComplete: done });
            this._timelineBackgroundShow.add(this.$refs.heading.show(), 0.7);
            this._timelineBackgroundShow.fromTo(this.$refs.button.$el, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, 0.7);
            return this._timelineBackgroundShow;
        },

        // Analytics
        clickContactHandler() {
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click contact button on footer about',
            });
        },
    },
};
