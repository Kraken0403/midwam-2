// Plugins
import { EventBus } from '@/plugins/event-bus';

// Utils
import ScrollManager from '@/utils/ScrollManager';
import device from '@/utils/device';

export default {
    mounted() {
        this.setupScrollManager();
        this.setupEventListeners();
    },

    beforeDestroy() {
        this.$root.scrollManager.destroy();
        this.removeEventListeners();
    },

    methods: {
        /**
         * Private
         */
        setupEventListeners() {
            this.$store.watch((state) => state.lockScroll, this.lockScrollChangerHandler);
            this.$root.scrollManager.addEventListener('scroll', this.scrollHandler);
        },

        removeEventListeners() {
            this.$root.scrollManager.removeEventListener('scroll', this.scrollHandler);
        },

        setupScrollManager() {
            this.$root.scrollManager = new ScrollManager();

            this.$root.scrollManager.setupScrollLock({
                container: this.$refs.container,
                content: this.$refs.content,
            });

            if (!device.isTouch()) {
                this.$root.scrollManager.setupSmoothScroll({
                    container: this.$refs.container,
                    content: this.$refs.content,
                });
            }
        },

        /**
         * Handlers
         */
        lockScrollChangerHandler(value) {
            if (value) {
                this.$root.scrollManager.lockScroll();
            } else {
                this.$root.scrollManager.unlockScroll();
            }
        },

        scrollHandler(e) {
            EventBus.$emit('scroll', e);
        },
    },
};
