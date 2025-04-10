// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    props: ['data', 'scrollType'],

    mounted() {
        this.__setupEventListeners();
        this.__resize();
    },

    beforeDestroy() {
        this.__removeEventListeners();
    },

    methods: {
        /**
         * Private
         */
        __setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.__resizeHandler);
        },

        __removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.__resizeHandler);
        },

        __resize() {
            this.$el.style.height = `${WindowResizeObserver.viewportHeight}px`;
        },

        /**
         * Handlers
         */
        __resizeHandler() {
            this.__resize();
        },
    },
};
