// Vendor
import gsap from 'gsap';

// Components
import VideoPlayer from '@/components/VideoPlayer';

export default {
    name: 'TheVideoOverlay',

    data() {
        return {
            data: null,
            // data: {
            //     cover_image: {
            //         sizes: {
            //             '1920x0': {
            //                 width: 1920,
            //                 height: 1080,
            //                 url: 'https://images.unsplash.com/photo-1556925159-d25835f7d37d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1951&q=80',
            //             },
            //         },
            //         alt: '',
            //     },
            // },
        };
    },

    components: {
        VideoPlayer,
    },

    created() {
        this.$root.videoOverlay = this;
    },

    mounted() {
        this.setupEventListeners();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        show(data) {
            this.$store.commit('videoOverlay/open');

            this.data = data;

            const tl = new gsap.timeline();
            tl.to(this.$el, 0.7, { autoAlpha: 1, ease: 'power3.out' }, 0);

            this.$nextTick(() => {
                this.$refs.videoPlayer.play();
            });

            this.$el.style.pointerEvents = 'all';
            this.lockScroll();
        },

        hide() {
            this.$store.commit('videoOverlay/close');

            const tl = new gsap.timeline({ onComplete: this.hideCompleteHandler });
            tl.to(this.$el, 0.4, { autoAlpha: 0, ease: 'power3.out' }, 0);

            this.$refs.videoPlayer.pause();

            this.$el.style.pointerEvents = 'none';
            this.unlockScroll();
        },

        /**
         * Private
         */
        lockScroll() {
            if (this.$root.scrollManager) {
                this.$root.scrollManager.lockScroll();
            }
        },

        unlockScroll() {
            if (this.$root.scrollManager) {
                this.$root.scrollManager.unlockScroll();
            }
        },

        setupEventListeners() {
            this.$store.watch((state) => {
                return state.videoOverlay;
            }, this.stateChangeHandler);
        },

        removeEventListeners() {},

        closeClickHandler() {
            this.hide();
        },

        stateChangeHandler() {},

        hideCompleteHandler() {
            this.$refs.videoPlayer.reset();
        }
    },
};
