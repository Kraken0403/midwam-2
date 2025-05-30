// Vendor
import gsap from 'gsap';

// Compontents
import SectionHome from '@/components/SectionHome';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
// import ButtonUnderlined from '@/components/ButtonUnderlined';

export default {
    extends: SectionHome,

    components: {
        Heading,
        Body,
        // ButtonUnderlined,
    },

    mounted() {
        // this.setupEventListeners();
        this._setupIntersectionObserver();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        _setupIntersectionObserver() {
            this._io = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting) {
                  this._io.disconnect()
                  // direction = 1 to mimic “forward” scroll
                  this.backgroundShow(/* done */ () => {}, /* direction */ 1)
                }
              },
              { threshold: 0.25 }
            )
            this._io.observe(this.$el)
          },
        /**
         * Public
         */
        backgroundShow(done, direction) {
            if (this.timelineHide) this.timelineHide.kill();

            const delay = direction > 0 ? 0.6 : 0.8;
            this.timelineShow = new gsap.timeline({ delay, onComplete: done });
            this.timelineShow.set(this.$el, { alpha: 1 }, 0);
            this.timelineShow.add(this.$refs.heading.show(), 0);
            this.timelineShow.add(this.$refs.body.showBlock(0), 0.6);
            // this.timelineShow.add(this.$refs.cta.show(), 1.4);
            return this.timelineShow;
        },

        backgroundHide(done, direction) {
            if (this.timelineShow) this.timelineShow.kill();

            const delay = direction > 0 ? 0 : 0;
            this.timelineHide = new gsap.timeline({ delay, onComplete: done });
            this.timelineHide.to(this.$el, 0.5, { alpha: 0 }, 0.4);
            this.$refs.heading.hide();
            return this.timelineHide;
        },
        setupEventListeners() {
            // this.$refs.cta.$el.addEventListener('click', this.ctaClickHandler);
            // this.$refs.cta.$el.addEventListener('mouseenter', this.ctaMouseenterHandler);
            // this.$refs.cta.$el.addEventListener('mouseleave', this.ctaMouseleaveHandler);
        },

        removeEventListeners() {
            // this.$refs.cta.$el.removeEventListener('click', this.ctaClickHandler);
            // this.$refs.cta.$el.removeEventListener('mouseenter', this.ctaMouseenterHandler);
            // this.$refs.cta.$el.removeEventListener('mouseleave', this.ctaMouseleaveHandler);
        },

    
    },
};
