// Vendor
import gsap from 'gsap';

// Utils
import Breakpoints from '@/utils/Breakpoints';

// Constants
const LINE_MAX_HEIGHT = 270;
const LINE_MIN_HEIGHT = 50;
const LINE_MARGIN = 50;

export default {
    props: ['label'],

    methods: {
        /**
         * Public
         */
        show() {
            const timelineShow = new gsap.timeline();

            timelineShow.fromTo(this.$refs.line, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0);
            timelineShow.fromTo(this.$refs.label, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.2);

            timelineShow.call(this.animate, null);

            return timelineShow;
        },

        hide() {
            const timelineHide = new gsap.timeline();

            timelineHide.to(this.$refs.line, 1, { alpha: 0, ease: 'sine.inOut' }, 0);
            timelineHide.to(this.$refs.label, 1, { alpha: 0, ease: 'sine.inOut' }, 0.2);

            return timelineHide;
        },

        animate() {
            if (this.infinite) this.infinite.kill();
            this.infinite = new gsap.timeline({ repeat: -1, repeatDelay: 1 });

            const duration = 1.6;
            const stagger = duration / 10;

            // this.infinite.set(this.$refs.subline, { transformOrigin: 'left top' });
            // this.infinite.fromTo(this.$refs.subline, duration, { scaleY: 0 }, { scaleY: 1, stagger, ease: 'power1.in' });
            this.infinite.set(this.$refs.subline, { transformOrigin: 'left bottom' });
            this.infinite.fromTo(this.$refs.subline, duration, { scaleY: 1 }, { scaleY: 0, stagger: -stagger, ease: 'power2.inOut' });
        },

        resize(contentElement) {
            const contentElementBoundingBox = contentElement.getBoundingClientRect();
            const contentElementBottom = contentElementBoundingBox.top + contentElementBoundingBox.height;

            const lineContainerBoundingBox = this.$refs.lineContainer.getBoundingClientRect();
            const lineContainerBottom = lineContainerBoundingBox.top + lineContainerBoundingBox.height;

            const height = Math.max(Math.min(lineContainerBottom - contentElementBottom - LINE_MARGIN, Breakpoints.reml(LINE_MAX_HEIGHT)), LINE_MIN_HEIGHT);

            // if (Breakpoints.active('small')) {
            // this.$refs.lineContainer.style.height = '50px';
            // } else {
            this.$refs.lineContainer.style.height = `${height}px`;
            // }
        },

        /**
         * Handlers
         */
        clickHandler() {
            this.$root.scrollControl.nextStep();
        },
    },
};
