// Vendor
import gsap from 'gsap';

// Assets
import IconTop from '@/assets/images/news/external-arrow-top.svg?inline';
import IconRight from '@/assets/images/news/external-arrow-right.svg?inline';

export default {
    props: ['data', 'isReady'],

    data() {
        return {
            isInView: false,
            lang: this.$i18n.locale,
        };
    },

    components: {
        IconTop,
        IconRight,
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

        src() {
            return this.data.image.sizes['1920x0'].url;
        },

        srcset() {
            let srcset = '';
            let image;
            for (const key in this.data.image.sizes) {
                image = this.data.image.sizes[key];
                srcset += `${image.url} ${image.width}w,`;
            }
            srcset = srcset.slice(0, -1);
            return srcset;
        },
    },

    mounted() {
        this.setupIntersectionObserver();
    },

    methods: {
        /**
         * Public
         */
        show() {
            gsap.to(this.$el, 1, { alpha: 1, ease: 'power1.in' });
        },

        /**
         * Private
         */
        setupIntersectionObserver() {
            const options = { threshold: 0.2 };

            this.intersectionObserver = new IntersectionObserver(this.observerHandler, options);
            this.intersectionObserver.observe(this.$el);
        },

        /**
         * Handlers
         */
        observerHandler(entry, observer) {
            // if (!this.isReady) return;
            if (this.isInView) return;

            if (entry[0].isIntersecting) {
                this.isInView = true;
                this.show();
                observer.disconnect();
            }
        },
    },
};
