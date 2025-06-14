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
    name: 'SectionHeaderDetail',
    extends: Section,

    props: ['data'],

    components: {
        ResponsiveImage,
        Body,
        Heading,
    },

    mounted() {
        this.normalizeSizes();
        this.setupTween();
        this.setupIntersectionObserver();
        console.log('Normalized background image:', this.data.background_image);
    },

    methods: {
        /**
         * Normalize image sizes (since API returns flat format)
         */
        normalizeSizes() {
            const bg = this.data?.background_image;
            if (!bg || !bg.sizes) return;

            const rawSizes = bg.sizes;
            const normalized = {};

            for (const key in rawSizes) {
                if (!key.includes('-width') && !key.includes('-height')) {
                    normalized[key] = {
                        url: rawSizes[key],
                        width: rawSizes[`${key}-width`] || 0,
                        height: rawSizes[`${key}-height`] || 0,
                    };
                }
            }

            this.data.background_image.sizes = normalized;
        },

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

            if (
                position.y + WindowResizeObserver.height - offsetImage > offsetTop &&
                position.y < offsetTop + sectionInfo.dimensions.height + offsetImage
            ) {
                const el = this.$refs.image?.$el;
                if (!el) return;

                el.style.transform = `translate3d(0, ${offsetImage}px, 0)`;
                el.style['-webkit-transform'] = el.style.transform;
                el.style['-moz-transform'] = el.style.transform;

                if (this.timeline) {
                    this.timeline.progress(progress);
                }
            }
        },

        setupTween() {
            this.timeline = new gsap.timeline({ paused: true });
            if (this.$refs.image?.$el) {
                this.timeline.fromTo(this.$refs.image.$el, 1, { opacity: 0.75 }, { opacity: 0, ease: 'power3.in' });
            }
        },

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
