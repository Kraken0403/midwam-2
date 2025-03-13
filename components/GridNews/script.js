// Components
import ButtonNews from '@/components/ButtonNews';

export default {
    props: ['items', 'highlight', 'related'],

    data() {
        return {
            isReady: false,
        };
    },

    components: {
        ButtonNews,
    },

    beforeDestroy() {},

    methods: {
        /**
         * Public
         */
        show() {
            this.isReady = true;
        },
    },
};
