// Vendor
import gsap from 'gsap';

// Images
import Twitter from '@/assets/images/icons/twitter.svg?inline';
import LinkedIn from '@/assets/images/icons/linkedin.svg?inline';
import Facebook from '@/assets/images/icons/facebook.svg?inline';

export default {
    props: ['data'],

    components: {
        Twitter,
        LinkedIn,
        Facebook,
    },

    computed: {
        shareLinks() {
            const url = `${process.env.BASE_URL_FRONTEND}${this.$router.history.current.fullPath}`;

            const twitter = `https://twitter.com/share?url=${url}`;
            const linkedin = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=`;
            const facebook = `http://www.facebook.com/sharer.php?u=${url}`;

            return { twitter, linkedin, facebook };
        },
    },

    mounted() {},

    beforeDestroy() {},

    methods: {
        /**
         * Public
         */
        show() {
            const timeline = new gsap.timeline();
            timeline.to(this.$el, 2, { alpha: 1, ease: 'power1.inOut' });

            return timeline;
        },
    },
};
