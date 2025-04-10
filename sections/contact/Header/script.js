// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import Heading from '@/components/Heading';
import ContactForm from '@/components/ContactForm';
import Body from '@/components/Body';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    extends: Section,

    components: {
        Heading,
        Body,
        ContactForm
    },

    mounted() {
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
            const timelineIn = new gsap.timeline();
            timelineIn.set([this.$refs.sectionContent, this.$refs.buttonVisit], { alpha: 1 }, 0);
            timelineIn.add(this.$refs.heading.show(), 0);
            timelineIn.fromTo(this.$refs.line, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0);
            timelineIn.fromTo(this.$refs.addressTitle1, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.5);
            timelineIn.call(
                () => {
                    this.$refs.body1.showBlock(0);
                },
                null,
                0.55
            );
            timelineIn.fromTo(this.$refs.addressTitle2, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.53);
            timelineIn.call(
                () => {
                    this.$refs.body2.showBlock(0);
                },
                null,
                0.58
            );

            // Email & Phone
            timelineIn.fromTo([this.$refs.email, this.$refs.phone], 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0.8);
            timelineIn.fromTo(this.$refs.email, 2, { y: '70%' }, { y: '0%', ease: 'power3.out' }, 0.8);
            timelineIn.fromTo(this.$refs.phone, 2, { y: '140%' }, { y: '0%', ease: 'power3.out' }, 0.8);

            // Button visit
            timelineIn.fromTo(this.$refs.buttonVisitLine, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 1);
            timelineIn.fromTo(this.$refs.buttonVisitLine, 2, { y: '30%' }, { y: '0%', ease: 'power3.out' }, 1);
            timelineIn.fromTo(this.$refs.buttonVisitLabel, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 1.4);
            timelineIn.fromTo(this.$refs.buttonVisitLabel, 2, { x: -50 }, { x: 0, ease: 'power3.out' }, 1);

            timelineIn.to(this.$refs.background, 1.2, { alpha: 1, ease: 'sine.inOut' }, 0.1);

            return timelineIn;
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

        scrollToNextSection() {
            const position = {
                y: this.$root.scrollManager.position.y,
            };

            gsap.to(position, 1.5, {
                y: WindowResizeObserver.height,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this.$root.scrollManager.scrollTo({ y: position.y });
                },
            });
        },

        resize() {
            this.$el.style.height = `${WindowResizeObserver.viewportHeight}px`;
        },

        /**
         * Handlers
         */
        emailClickHandler() {
            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click on email',
            });
        },

        phoneClickHandler() {
            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click on phone number',
            });
        },

        buttonVisitClickHandler() {
            this.scrollToNextSection();
        },

        resizeHandler() {
            this.resize();
        },
    },
};
