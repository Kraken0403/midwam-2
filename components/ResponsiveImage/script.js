// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    props: ['sizes', 'alt', 'type'],

    computed: {
        src() {
            if (this.sizes.length === 0) return;
            return this.sizes['1920x0'].url;
        },

        srcset() {
            let srcset = '';
            let image;
            for (const key in this.sizes) {
                image = this.sizes[key];
                srcset += `${image.url} ${image.width}w,`;
            }
            srcset = srcset.slice(0, -1);
            return srcset;
        },
    },

    mounted() {
        if (this.sizes.length === 0) return;
        this.setupEventListeners();
        this.resize();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Private
         */
        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        /**
         * Resize
         */
        resize() {
            if (this.type === 'cover') {
                this.updateImageCoverSize();
            } else {
                this.updateImageAspectRatio();
            }
        },

        updateImageCoverSize() {
            this.$el.style.height = '100%';

            const image = this.sizes['1920x0'];
            const imageWidth = image.width;
            const imageHeight = image.height;

            const container = this.$el;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            const scale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
            const width = Math.ceil(imageWidth * scale);
            const height = Math.ceil(imageHeight * scale);
            const x = Math.round((containerWidth - width) * 0.5);
            const y = Math.round((containerHeight - height) * 0.5);

            this.$refs.image.style.width = `${width}px`;
            this.$refs.image.style.height = `${height}px`;
            this.$refs.image.style.top = `${y}px`;
            this.$refs.image.style.left = `${x}px`;
        },

        updateImageAspectRatio() {
            const image = this.sizes['1920x0'];
            const width = image.width;
            const height = image.height;
            const ratio = (height / width) * 100;
            this.$el.style.paddingBottom = `${ratio}%`;
        },

        /**
         * Handlers
         */
        resizeHandler() {
            this.resize();
        },
    },
};
