// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';

// Images
import Twitter from '@/assets/images/icons/twitter.svg?inline';
import LinkedIn from '@/assets/images/icons/linkedin.svg?inline';
import Facebook from '@/assets/images/icons/facebook.svg?inline';

export default {
    extends: Section,

    props: ['data'],

    data() {
        return {};
    },

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

    methods: {
        /**
         * Public
         */
        show() {
            gsap.to(this.$el, 1, { alpha: 1, ease: 'power1.inOut' });
        },
    },
};
