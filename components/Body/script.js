// Vendor
import gsap from 'gsap';
import SplitText from '@/vendor/gsap/SplitText';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Store
import { PRELOADER_COMPLETED, LANGUAGE_SWITCH_FINISHED } from '@/store';

export default {
    // props: ['data', 'large', 'trigger-on-scroll'],

    props: {
        data: {
            default: {},
        },
        large: {
            default: false,
        },
        triggerOnScroll: {
            type: Boolean,
            default: false,
        },
    },

    mounted() {
        this.blocksShowCompleted = [];

        if (this.$store.state.preloader === PRELOADER_COMPLETED && this.$store.state.languageSwitch === LANGUAGE_SWITCH_FINISHED) {
            this.start();
        }

        this.setupEventListeners();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        showBlock(index, direction = 1) {
            const lines = this.blocks[index].lines;

            const timeline = new gsap.timeline({ onComplete: this.showBlockCompleteHandler, onCompleteParams: [index] });
            timeline.fromTo(this.$el.children[index], 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0);

            if (direction > 0) {
                let y = 0;
                for (let i = 0, len = lines.length; i < len; i++) {
                    y += 70;
                    timeline.fromTo(lines[i], 2, { y: `${y}%` }, { y: '0%', ease: 'power3.out' }, 0);
                }
            } else {
                let y = 0;
                for (let i = lines.length - 1; i >= 0; i--) {
                    y -= 70;
                    timeline.fromTo(lines[i], 2, { y: `${y}%` }, { y: '0%', ease: 'power3.out' }, 0);
                }
            }

            return timeline;
        },

        showAll(direction = 1) {
            let lines = [];
            for (let i = 0, len = this.blocks.length; i < len; i++) {
                lines = [...lines, ...this.blocks[i].lines];
            }

            const timeline = new gsap.timeline({ onComplete: this.showAllCompleteHandler });
            timeline.fromTo(this.$el.children, 1, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 0);

            if (direction > 0) {
                let y = 0;
                for (let i = 0, len = lines.length; i < len; i++) {
                    y += 70;
                    timeline.fromTo(lines[i], 2, { y: `${y}%` }, { y: '0%', ease: 'power3.out' }, 0);
                }
            } else {
                let y = 0;
                for (let i = lines.length - 1; i >= 0; i--) {
                    y -= 70;
                    timeline.fromTo(lines[i], 2, { y: `${y}%` }, { y: '0%', ease: 'power3.out' }, 0);
                }
            }

            return timeline;
        },

        /**
         * Private
         */
        start() {
            this.blocks = this.split();
            this.blocksShowCompleted = [];
            if (this.triggerOnScroll) {
                this.setupIntersectionObserver();
            }
            this.resize();
        },

        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            this.$store.watch((state) => state.preloader, this.preloaderChangeHandler);
            this.$store.watch((state) => state.languageSwitch, this.languageSwitchChangeHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        split() {
            const blocks = [];
            const children = this.$el.children;

            let item;
            let split;
            for (let i = 0, len = children.length; i < len; i++) {
                item = children[i];
                split = new SplitText(item, { type: 'lines', linesClass: 'lines' });
                blocks.push(split);
            }
            return blocks;
        },

        setupIntersectionObserver() {
            let item;
            const elements = Array.prototype.slice.call(this.$el.children);
            for (let i = 0, len = elements.length; i < len; i++) {
                item = elements[i];
                this.intersectionObserver = new IntersectionObserver(
                    (entries, obvserver) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                const index = elements.indexOf(entry.target);
                                this.showBlock(index);
                                obvserver.disconnect();
                            }
                        });
                    },
                    {
                        threshold: 0.2,
                    }
                );
                this.intersectionObserver.observe(item);
            }
        },

        /**
         * Resize
         */
        resize() {
            // this.revertSplits();
        },

        revertSplits() {
            for (let i = this.blocksShowCompleted.length - 1; i >= 0; i--) {
                this.blocks[this.blocksShowCompleted[i]].revert();
            }
            this.blocksShowCompleted = [];
        },

        /**
         * Handlers
         */
        showBlockCompleteHandler(index) {
            this.blocksShowCompleted.push(index);
        },

        showAllCompleteHandler() {
            for (let i = 0, len = this.blocks.length; i < len; i++) {
                this.blocksShowCompleted.push(i);
            }
        },

        resizeHandler() {
            this.resize();
        },

        preloaderChangeHandler(state) {
            if (this.$store.state.languageSwitch === LANGUAGE_SWITCH_FINISHED && state === PRELOADER_COMPLETED) {
                this.start();
            }
        },

        languageSwitchChangeHandler(state) {
            if (this.$store.state.preloader === PRELOADER_COMPLETED && state === LANGUAGE_SWITCH_FINISHED) {
                this.start();
            }
        },
    },
};
