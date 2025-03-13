// Vendor
import gsap from 'gsap';
import { RoughEase } from '@/vendor/gsap/EasePack';

// Utils
import Debugger from '@/utils/Debugger';

// Components
import Preloader from '@/components/Preloader';
import WebglBackground from '@/components/WebglBackground';

// Store
import { PRELOADER_COMPLETED } from '@/store';

// GSAP plugins
gsap.registerPlugin(RoughEase);

export default {
    components: {
        Preloader,
        WebglBackground,
    },

    created() {
        this.$root.environment = process.env.NODE_ENV;
    },

    mounted() {
        Debugger.setup();
        this.setupEventListeners();
    },

    updated() {
        if (this.$store.state.preloader === PRELOADER_COMPLETED) {
            this.setupWebglBackground();
        }
    },

    methods: {
        /**
         * Private
         */
        setupEventListeners() {
            this.$store.watch((state) => state.preloader, this.preloaderChangeHandler);
        },

        setupWebglBackground() {
            this.$refs.webglBackground.setup(true);
            this.$root.webglBackground = this.$refs.webglBackground;
        },

        /**
         * Handlers
         */
        preloaderChangeHandler() {
            this.setupWebglBackground();
        },
    },
};

/**
 * Clears console on reload
 */
if (module.hot) {
    module.hot.accept();
    module.hot.addStatusHandler((status) => {
        if (status === 'prepare') console.clear();
    });
}
