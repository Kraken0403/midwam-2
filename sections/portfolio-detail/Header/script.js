// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import ResponsiveImage from '@/components/ResponsiveImage';
import Body from '@/components/Body';
import Heading from '@/components/Heading';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    extends: Section,

    components: {
        ResponsiveImage,
        Body,
        Heading,
    },

    mounted() {
        this.setupTween();
        this.setupIntersectionObserver();
    },

    methods: {
        /**
         * Public
         */
        transitionIn() {
            const timelineIn = new gsap.timeline();
            timelineIn.set(this.$el, { alpha: 1 }, 0);
            timelineIn.fromTo(this.$refs.background, 1.5, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0);
            timelineIn.add(this.$refs.heading.show(), 0.2);
            timelineIn.fromTo(this.$refs.line, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.5);
            timelineIn.fromTo(this.$refs.line, 2, { y: '30%' }, { y: '0%', ease: 'power3.out' }, 0.5);
            timelineIn.fromTo(this.$refs.intro, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.6);
            timelineIn.fromTo(this.$refs.intro, 2, { y: '30%' }, { y: '0%', ease: 'power3.out' }, 0.6);
            return timelineIn;
        },

        parallax(position, sectionInfo) {
            const offsetTop = sectionInfo.position.y;
            const offsetImage = (offsetTop - position.y) * -0.2;
            const progress = position.y / sectionInfo.dimensions.height;

            if (position.y + WindowResizeObserver.height - offsetImage > offsetTop && position.y < offsetTop + sectionInfo.dimensions.height + offsetImage) {
                this.$refs.image.$el.style.transform = `translate3d(0, ${offsetImage}px, 0)`;
                this.$refs.image.$el.style['-webkit-transform'] = `translate3d(0, ${offsetImage}px, 0)`;
                this.$refs.image.$el.style['-moz-transform'] = `translate3d(0, ${offsetImage}px, 0)`;

                if (!this.timeline) return;
                this.timeline.progress(progress);
            }
        },

        setupTween() {
            this.timeline = new gsap.timeline({ paused: true });
            this.timeline.fromTo(this.$refs.image.$el, 1, { opacity: 0.75 }, { opacity: 0, ease: 'power3.In' });
        },

        /**
         * Private
         */
        setupIntersectionObserver() {
            const options = { threshold: 1 };

            this.intersectionObserver = new IntersectionObserver(this.observerHandler, options);
            this.intersectionObserver.observe(this.$refs.introTitle);
        },

        observerHandler(entry, observer) {
            if (entry[0].isIntersecting) {
                gsap.to(this.$refs.introTitle, 1, { alpha: 1, ease: 'power1.inOut' });
                observer.disconnect();
            }
        },
    },
};
