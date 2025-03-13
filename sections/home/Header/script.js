// Vendor
import gsap from 'gsap';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Components
import SectionHome from '@/components/SectionHome';
import ScrollIndicator from '@/components/ScrollIndicator';
import ButtonBlock from '@/components/ButtonBlock';
import Heading from '@/components/Heading';

export default {
    extends: SectionHome,

    components: {
        ScrollIndicator,
        ButtonBlock,
        Heading,
    },

    mounted() {
        this.isTransitionInComplete = false;

        this.setupEventListeners();
        this.resize();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        transitionIn() {
            const timelineIn = new gsap.timeline({ onComplete: this.transitionInCompleteHandler });
            timelineIn.set(this.$el, { alpha: 1 }, 0);
            timelineIn.add(this.$refs.heading.show(), 0);
            timelineIn.fromTo(this.$refs.subtitle, 1.5, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.5);
            timelineIn.add(this.$refs.scrollIndicator.show(), 1);
            timelineIn.add(this.$refs.buttonBlock.show(), 2);
            return timelineIn;
        },

        backgroundShow(done, direction) {
            if (this.timelineHide) this.timelineHide.kill();

            const delay = direction > 0 ? 0 : 2.2;
            this.timelineShow = new gsap.timeline({ delay, onComplete: done });
            this.timelineShow.set(this.$el, { alpha: 1 }, 0);
            this.timelineShow.add(this.$refs.heading.show(), 0);
            this.timelineShow.fromTo(this.$refs.subtitle, 1.5, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.5);
            // this.timelineShow.add(this.$refs.scrollIndicator.show(), 1);
            this.timelineShow.add(this.$refs.buttonBlock.show(), 2);
            return this.timelineShow;
        },

        backgroundHide(done, direction) {
            if (this.timelineShow) this.timelineShow.kill();

            const delay = direction > 0 ? 0 : 0;
            this.timelineHide = new gsap.timeline({ delay, onComplete: done });
            this.timelineHide.to(this.$refs.scrollIndicator.$el, 0.3, { alpha: 0 }, 0);
            this.timelineHide.add(this.$refs.heading.hide(), 0);
            this.timelineHide.to(this.$el, 0.5, { alpha: 0 }, 0.4);
            this.timelineHide.timeScale(1.4);
            return this.timelineHide;
        },

        focus() {
            if (!this.isTransitionInComplete) return;

            if (this.timelineUnfocus) this.timelineUnfocus.kill();
            this.timelineFocus = new gsap.timeline();
            this.timelineFocus.to(this.$el, 0.55, { scale: 1.045, ease: 'power4.out' }, 0);
            this.timelineFocus.to(this.$el, 0.17, { alpha: 0, ease: 'sine.inOut' }, 0);
            return this.timelineFocus;
        },

        unfocus() {
            if (!this.isTransitionInComplete) return;

            if (this.timelineFocus) this.timelineFocus.kill();
            this.timelineUnfocus = new gsap.timeline();
            this.timelineUnfocus.to(this.$el, 0.75, { scale: 1, ease: 'power3.out' }, 0);
            this.timelineUnfocus.to(this.$el, 0.19, { alpha: 1, ease: 'sine.inOut' }, 0);
            return this.timelineUnfocus;
        },

        /**
         * Private
         */
        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        /**
         * Resize
         */
        resize() {
            this.$refs.scrollIndicator.resize(this.$refs.content);
        },

        /**
         * Handlers
         */
        resizeHandler() {
            this.resize();
        },

        transitionInCompleteHandler() {
            this.isTransitionInComplete = true;
        },
    },
};
