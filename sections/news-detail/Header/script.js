// Vendor
import gsap from 'gsap';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Components
import Section from '@/components/Section';
import Heading from '@/components/Heading';
import ButtonArrow from '@/components/ButtonArrow';
import ResponsiveImage from '@/components/ResponsiveImage';

export default {
    extends: Section,

    props: ['data'],

    data() {
        return {
            lang: this.$i18n.locale,
        };
    },

    components: {
        Heading,
        ResponsiveImage,
        ButtonArrow,
    },

    computed: {
        date() {
            const date = this.data.date;
            const normalizedDateComponents = date.split(' ')[0].split('-');
            const normalizedDate = normalizedDateComponents.join('/');
            const dateString = new Date(normalizedDate).toDateString();
            const dateComponents = dateString.split(' ');
            const month = dateComponents[1];
            const dayNumber = dateComponents[2];
            const year = dateComponents[3];

            return `${month} ${dayNumber} ${year}`;
        },
    },

    mounted() {},

    methods: {
        /**
         * Public
         */
        transitionIn() {
            const stagger = 0.05;
            const startingDelay = 0.5;

            this.timeline = new gsap.timeline();
            this.timeline.add(this.$refs.heading.show(), 0);

            this.timeline.fromTo(this.$refs.category, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.out' }, startingDelay + stagger * 1);
            this.timeline.fromTo(this.$refs.date, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.out' }, startingDelay + stagger * 2);
            this.timeline.fromTo(this.$refs.imageContainer, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, startingDelay + stagger * 3);

            this.timeline.fromTo(this.$refs.back.$el, 2, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, startingDelay + stagger * 10);

            this.timeline.set(this.$el, { alpha: 1, ease: 'power1.out' }, 0);

            return this.timeline;
        },

        parallax(position, sectionInfo) {
            const offsetTop = sectionInfo.position.y;
            const offsetImage = (offsetTop - position.y) * -0.2;
            if (position.y + WindowResizeObserver.height - offsetImage > offsetTop && position.y < offsetTop + sectionInfo.dimensions.height + offsetImage) {
                this.$refs.image.$el.style.transform = `translate3d(0, ${offsetImage}px, 0)`;
            }
        },

        /**
         * Private
         */
        translateSocialButtons() {
            if (!this.$refs.socials) return;
            this.$refs.socials.style.transform = `translate3d(0, ${this.scrollPosition}px, 0)`;
            this.$refs.socials.style['-moz-transform'] = `translate3d(0, ${this.scrollPosition}px, 0)`;
            this.$refs.socials.style['-webkit-transform'] = `translate3d(0, ${this.scrollPosition}px, 0)`;
        },
    },
};
