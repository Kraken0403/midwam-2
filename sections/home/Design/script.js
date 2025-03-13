// Vendor
import gsap from 'gsap';

// Utils
import Breakpoints from '@/utils/Breakpoints';

// Compontents
import SectionHome from '@/components/SectionHome';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
import ButtonUnderlined from '@/components/ButtonUnderlined';

export default {
    extends: SectionHome,

    components: {
        Heading,
        Body,
        ButtonUnderlined,
    },

    mounted() {
        this.setupEventListeners();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        backgroundShow(done, direction) {
            if (this.timelineHide) this.timelineHide.kill();
            if (this.timelineShow) this.timelineShow.kill();

            // const y = Breakpoints.active('small', 'medium') ? Breakpoints.rem(40) : Breakpoints.reml(230);
            const delay = direction > 0 ? 0.4 : 0.5;
            this.timelineShow = new gsap.timeline({ delay, onComplete: done });
            this.timelineShow.set(this.$el, { alpha: 1 }, 0);
            // this.timelineShow.fromTo(this.$el, 2, { y: y * direction }, { y: 0, ease: 'power3.out' }, 0);
            this.timelineShow.add(this.$refs.heading.show(), 0);
            this.timelineShow.add(this.$refs.body.showBlock(0), 0.6);
            this.timelineShow.add(this.$refs.cta.show(), 1.4);
            return this.timelineShow;
        },

        backgroundHide(done, direction) {
            if (this.timelineShow) this.timelineShow.kill();

            // const y = Breakpoints.active('small', 'medium') ? Breakpoints.rem(40) : Breakpoints.reml(160);
            const delay = direction > 0 ? 0 : 0;
            this.timelineHide = new gsap.timeline({ delay, onComplete: done });
            this.timelineHide.to(this.$el, 0.5, { alpha: 0 }, 0.4);
            this.$refs.heading.hide();

            // this.timelineHide.to(this.$el, 1, { y: y * -direction, ease: 'power1.in' }, 0);
            return this.timelineHide;
        },

        focus() {
            if (this.timelineUnfocus) this.timelineUnfocus.kill();
            this.timelineFocus = new gsap.timeline();
            this.timelineFocus.to(this.$el, 0.55, { scale: 1.045, ease: 'power4.out' }, 0);
            this.timelineFocus.to(this.$el, 0.17, { alpha: 0, ease: 'sine.inOut' }, 0);
            return this.timelineFocus;
        },

        unfocus() {
            if (this.timelineFocus) this.timelineFocus.kill();
            this.timelineUnfocus = new gsap.timeline();
            this.timelineUnfocus.to(this.$el, 0.75, { scale: 1, ease: 'power3.out' }, 0);
            this.timelineUnfocus.to(this.$el, 0.19, { alpha: 1, ease: 'sine.inOut' }, 0);
            return this.timelineUnfocus;
        },

        setupEventListeners() {
            this.$refs.cta.$el.addEventListener('click', this.ctaClickHandler);
            this.$refs.cta.$el.addEventListener('mouseenter', this.ctaMouseenterHandler);
            this.$refs.cta.$el.addEventListener('mouseleave', this.ctaMouseleaveHandler);
        },

        removeEventListeners() {
            this.$refs.cta.$el.removeEventListener('click', this.ctaClickHandler);
            this.$refs.cta.$el.removeEventListener('mouseenter', this.ctaMouseenterHandler);
            this.$refs.cta.$el.removeEventListener('mouseleave', this.ctaMouseleaveHandler);
        },

        ctaClickHandler() {
            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click cta home text block',
            });
        },

        ctaMouseenterHandler() {
            if (this.mouseleaveTimeline) this.mouseleaveTimeline.kill();

            this.mouseenterTimeline = new gsap.timeline();
            this.mouseenterTimeline.to(this.$refs.heading.$el, 0.8, { alpha: 0.3, ease: 'power1.inOut' }, 0);
            this.mouseenterTimeline.to(this.$refs.body.$el, 0.8, { alpha: 0.3, ease: 'power1.inOut' }, 0);
        },

        ctaMouseleaveHandler() {
            if (this.mouseenterTimeline) this.mouseenterTimeline.kill();

            this.mouseleaveTimeline = new gsap.timeline();
            this.mouseleaveTimeline.to(this.$refs.heading.$el, 0.8, { alpha: 1, ease: 'power1.inOut' }, 0);
            this.mouseleaveTimeline.to(this.$refs.body.$el, 0.8, { alpha: 1, ease: 'power1.inOut' }, 0);
        },
    },
};
