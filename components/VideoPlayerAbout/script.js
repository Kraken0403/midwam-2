// Components
import ResponsiveImage from '@/components/ResponsiveImage';

export default {
    props: ['data'],

    components: {
        ResponsiveImage,
    },

    methods: {
        parallax(offsetImage) {
            this.$refs.cover.style.transform = `translate3d(0, ${offsetImage}px, 0)`;
            this.$refs.cover.style['-webkit-transform'] = `translate3d(0, ${offsetImage}px, 0)`;
            this.$refs.cover.style['-moz-transform'] = `translate3d(0, ${offsetImage}px, 0)`;
        },
    },
};
