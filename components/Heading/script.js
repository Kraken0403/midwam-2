// Vendor
import gsap from 'gsap';
import SplitText from '@/vendor/gsap/SplitText';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Store
import { PRELOADER_ASSETS_LOADED, PRELOADER_COMPLETED } from '@/store';

export default {
    props: ['data', 'tag', 'preserveLineBreak', 'isCustomTriggered'],

    data() {
        return {
            lang: this.$i18n.locale,
        };
    },

    mounted() {
        // Flags
        this.isInView = false;
        this.isShowCompleted = false;
        this.isHideCompleted = false;

        if (this.$store.state.preloader === PRELOADER_COMPLETED || this.$store.state.preloader === PRELOADER_ASSETS_LOADED) {
            this.start();
        }

        this.setupEventListeners();
    },

    beforeDestroy() {
        this.isDestroyed = true;
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        show() {
            if (this.timelineShow) this.timelineShow.kill();

            this.timelineShow = new gsap.timeline({ onComplete: this.showCompleteHandler });

            const translateX = 100;
            const staggerOptions = {
                each: 0.04,
                from: 'random',
            };

            for (let i = 0; i < this.lines.length; i++) {
                const line = this.lines[i];
                const direction = i % 2 === 0 ? 1 : -1;
                this.timelineShow.fromTo(line, 1.5, { x: translateX * direction }, { x: 0, ease: 'power4.out' }, 0.05 * i);
            }

            if (this.lang === 'ar') {
                this.timelineShow.fromTo(this.lines, 1.2, { alpha: 0 }, { alpha: 1, ease: 'power2.inOut', stagger: 0.04 }, 0);
            } else {
                this.timelineShow.fromTo(
                    this.letters,
                    1.2,
                    { alpha: 0 },
                    {
                        alpha: () => {
                            if (Math.random() > 0.5) {
                                return 0.6 + 0.4 * Math.random();
                            } else {
                                return 1;
                            }
                        },
                        ease: 'power2.inOut',
                        stagger: staggerOptions,
                    },
                    0
                );
            }

            return this.timelineShow;
        },

        hide() {
            if (this.timelineHide) this.timelineHide.kill();
            if (this.timelineShow) this.timelineShow.kill();

            this.timelineHide = new gsap.timeline({ onComplete: this.hideCompleteHandler });

            const translateX = 10;
            const staggerOptions = {
                each: 0.04,
                from: 'random',
            };

            for (let i = 0; i < this.lines.length; i++) {
                const line = this.lines[i];
                const direction = i % 2 === 0 ? 1 : -1;
                this.timelineHide.to(line, 1, { x: translateX * direction, ease: 'sine.inOut' }, 0.05 * i);
            }

            if (this.lang === 'ar') {
                this.timelineHide.to(this.lines, 0.8, { alpha: 0, ease: 'power2.inOut', stagger: 0.04 }, 0);
            } else {
                this.timelineHide.to(this.letters, 0.8, { alpha: 0, ease: 'power2.inOut', stagger: staggerOptions }, 0);
            }

            return this.timelineHide;
        },

        /**
         * Private
         */
        start() {
            this.lines = this.splitLines();
            this.letters = this.splitLetters();
            this.setupIntersectionObserver();
            this.$el.style.opacity = 1;
        },

        splitLines() {
            const el = this.$el;

            if (this.preserveLineBreak) {
                this.splitString();
            }

            // console.log(el.innerText);

            this.splitedLines = new SplitText(el, { type: 'lines', linesClass: 'gsap-lines' });

            return this.splitedLines.lines;
        },

        splitString() {
            const el = this.$el;

            el.innerHTML = '';
            const lines = this.data.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const div = document.createElement('div');
                div.setAttribute('class', 'line');
                div.innerHTML = line;
                el.appendChild(div);
            }
        },

        splitLetters() {
            if (this.lang === 'ar') return;

            const lines = this.lines;
            const letters = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const split = new SplitText(line, { type: 'chars', charsClass: 'chars' });
                letters.push(split.chars);
            }

            return letters;
        },

        setupIntersectionObserver() {
            if (this.isCustomTriggered) return;

            const options = { threshold: 0.2 };

            this.intersectionObserver = new IntersectionObserver(this.observerHandler, options);
            this.intersectionObserver.observe(this.$el);
        },

        /**
         * Resize
         */
        resize() {
            // if (this.isShowCompleted) this.revertSplits();
        },

        revertSplits() {
            this.splitedLines.revert();
        },

        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            this.$store.watch((state) => state.preloader, this.preloaderChangeHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        /**
         * Handlers
         */
        preloaderChangeHandler(state) {
            if (this.isDestroyed) return;

            if (state === PRELOADER_COMPLETED) {
                this.start();
            }
        },

        showBlockCompleteHandler(index) {},

        resizeHandler() {
            this.resize();
        },

        observerHandler(entry, observer) {
            if (this.isInView) return;

            if (entry[0].isIntersecting) {
                this.isInView = true;
                this.show();
                observer.disconnect();
            }
        },

        showCompleteHandler() {
            this.isShowCompleted = true;
        },

        hideCompleteHandler() {
            this.isHideCompleted = true;
        },

        // mouseEnterHandler() {
        //     this.timelineMouseEnter = new gsap.timeline();
        //     let item;
        //     for (let i = 0, len = this.letters.length; i < len; i++) {
        //         item = this.letters[i];
        //         this.timelineMouseEnter.to(
        //             item,
        //             {
        //                 duration: () => {
        //                     return 1 + Math.random();
        //                 },
        //                 alpha: () => {
        //                     return 0.2 + 0.8 * Math.random();
        //                 },
        //                 yoyo: true,
        //                 repeat: -1,
        //                 ease: 'power3.inOut',
        //             },
        //             i * 0.1
        //         );
        //     }
        // },

        // mouseLeaveHandler() {
        //     this.timelineMouseEnter.pause();
        // },
    },
};
