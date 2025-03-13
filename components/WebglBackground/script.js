import WebglApp from '@/webgl';

export default {
    beforeDestroy() {
        if (this.$root.webglApp) {
            this.$root.webglApp.destroy();
            this.$root.webglApp = null;
        }
    },

    mounted() {},

    methods: {
        /**
         * Public
         */
        setup(debug = false) {
            if (this.$root.webglApp) return;
            this.$root.webglApp = new WebglApp({
                canvas: this.$refs.canvas,
                scrollContainer: this.$refs.scrollContainer,
                nuxtRoot: this.$root,
                debug,
            });
        },
    },
};
