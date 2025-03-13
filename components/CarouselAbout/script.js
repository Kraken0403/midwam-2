// Vendor
import gsap from 'gsap';
import InertiaPlugin from '@/vendor/gsap/InertiaPlugin';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import math from '@/utils/math';

// Components
import SlideAbout from '@/components/SlideAbout';

// Constants
const MOVE_CLICK_THRESHOLD = 3;

export default {
    props: {
        data: {},
    },

    components: {
        SlideAbout,
    },

    created() {
        this.isTimelineShowComplete = false;
        this.slidesAmount = this.data ? this.data.length : 0;
        this.currentIndex = 0;
        this.isMouseDown = false;
        this.isAnimating = false;
        this.isEnabled = true;
        this.direction = this.$i18n.locale === 'ar' ? -1 : 1;

        this.mousePosition = {
            start: { x: 0, y: 0 },
            previous: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
        };

        this.position = {
            target: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
        };
    },

    mounted() {
        this.setupEventListeners();
        this.resize();
        this.fadeoutInactiveItems();

        InertiaPlugin.track(this.position.current, 'x');
    },

    beforeDestroy() {
        this.removeEventListeners();
        if (this.timelineShow) this.timelineShow.kill();
    },

    methods: {
        /**
         * Public
         */
        // show() {
        //     const elements = [];
        //     if (this.$refs.item) {
        //         const length = math.clamp(this.$refs.item.length, 0, 6);
        //         for (let i = 0; i < length; i++) {
        //             elements.push(this.$refs.item[i].$el);
        //         }
        //     }
        //     this.timelineShow = new gsap.timeline({ onComplete: this.timelineShowCompleteHandler });
        //     this.timelineShow.fromTo(elements, 0.4, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut', stagger: 0.1 }, 0);
        //     this.timelineShow.fromTo(elements, 0.8, { scale: 0 }, { scale: 1, ease: 'power3.out', stagger: 0.1 }, 0);
        //     this.timelineShow.fromTo(elements, 0.8, { y: '60%' }, { y: '0%', ease: 'power3.out', stagger: 0.1 }, 0);
        //     return this.timelineShow;
        // },

        enable() {
            this.isEnabled = true;
        },

        disable() {
            this.isEnabled = false;
        },

        /**
         * Private
         */
        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            gsap.ticker.add(this.tickHandler);
            this.$el.addEventListener('click', this.clickHandler);

            // Mouse events
            this.$el.addEventListener('mousedown', this.mouseDownHandler);
            window.addEventListener('mousemove', this.mouseMoveHandler);
            window.addEventListener('mouseup', this.mouseUpHandler);

            // Touch events
            this.$el.addEventListener('touchstart', this.touchStartHandler);
            window.addEventListener('touchmove', this.touchMoveHandler);
            window.addEventListener('touchend', this.touchEndHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
            gsap.ticker.remove(this.tickHandler);
            this.$el.removeEventListener('click', this.clickHandler);

            // Mouse events
            this.$el.removeEventListener('mousedown', this.mouseDownHandler);
            window.removeEventListener('mousemove', this.mouseMoveHandler);
            window.removeEventListener('mouseup', this.mouseUpHandler);

            // Touch events
            this.$el.removeEventListener('touchstart', this.touchStartHandler);
            window.removeEventListener('touchmove', this.touchMoveHandler);
            window.removeEventListener('touchend', this.touchEndHandler);
        },

        goToIndex(index) {
            if (this.isAnimating) return;
            this.isAnimating = true;

            this.updateSlideAlpha(index);

            let x = index * -this.slideWidth;
            x = math.clamp(x, this.minSlide, 0);

            gsap.to(this.position.target, 1, { x, ease: 'power3.inOut', onComplete: this.animateToSlideCompleteHandler });
        },

        snap() {
            this.isAnimating = true;

            this.snapTween = gsap.to(this.position.current, {
                inertia: {
                    duration: {
                        max: 1,
                    },
                    x: {
                        min: this.minValue,
                        max: this.maxValue,
                        end: (n) => {
                            n = math.clamp(n, this.minValue, this.maxValue);
                            const value = Math.round(n / this.slideWidth) * this.slideWidth;
                            const index = Math.abs(value) / this.slideWidth;
                            this.updateSlideAlpha(index);
                            return value;
                        },
                    },
                },
                onUpdate: this.snapUpdateHandler,
                onComplete: this.snapCompleteHandler,
            });
        },

        update() {
            if (!this.isOverflowing) return;

            if (this.isMouseDown) {
                this.position.target.x += this.mousePosition.current.x - this.mousePosition.previous.x;
                this.mousePosition.previous.x = this.mousePosition.current.x;
            }

            this.position.target.x = math.clamp(this.position.target.x, this.minValue, this.maxValue);
            this.position.current.x = math.lerp(this.position.current.x, this.position.target.x, 0.5);

            this.updateListTransform();
            this.updateProgress();
        },

        updateListTransform() {
            const transform = `translateX(${this.position.current.x}px)`;
            this.$refs.list.style.transform = transform;
            this.$refs.list.style.webkitTransform = transform;
        },

        updateProgress() {
            const progress = this.position.current.x / this.minSlide;
            this.$emit('progress', progress);
        },

        fadeoutInactiveItems() {
            for (let i = 1, len = this.$refs.item.length; i < len; i++) {
                this.$refs.item[i].fadeOut(true);
            }
        },

        updateSlideAlpha(index) {
            const previousIndex = this.currentIndex;
            this.$refs.item[previousIndex].fadeOut();
            this.currentIndex = index;
            this.$refs.item[this.currentIndex].fadeIn();
        },

        /**
         * Resize
         */
        resize() {
            this.width = this.$el.offsetWidth;
            this.slideWidth = this.getSlideWidth();
            this.listWidth = this.getListWidth();
            this.minSlide = -(this.listWidth - this.width);
            this.isOverflowing = this.listWidth > this.width;
            this.minValue = this.direction > 0 ? this.minSlide : 0;
            this.maxValue = this.direction < 0 ? -this.minSlide : 0;
        },

        getSlideWidth() {
            let width = 0;
            if (this.$refs.list.children.length > 0) {
                width = this.$refs.list.children[0].offsetWidth;
            }
            return width;
        },

        getListWidth() {
            const items = this.$refs.list.children;
            let width = 0;
            // let style;
            // let marginRight;
            for (let i = 0, len = items.length; i < len; i++) {
                // style = window.getComputedStyle(items[i]);
                // marginRight = parseInt(style.marginRight);
                width += items[i].offsetWidth;
            }
            return width;
        },

        /**
         * Handlers
         */
        resizeHandler() {
            this.resize();
        },

        mouseDownHandler(e) {
            e.preventDefault();
            this.isMouseDown = true;
            this.mousePosition.start.x = e.clientX;
            this.mousePosition.previous.x = e.clientX;
            this.mousePosition.current.x = e.clientX;
        },

        touchStartHandler(e) {
            this.isMouseDown = true;
            this.mousePosition.start.x = e.touches[0].clientX;
            this.mousePosition.previous.x = e.touches[0].clientX;
            this.mousePosition.current.x = e.touches[0].clientX;
        },

        clickHandler(e) {
            const delta = Math.abs(this.mousePosition.start.x - this.mousePosition.current.x);
            if (delta > MOVE_CLICK_THRESHOLD) e.preventDefault();
        },

        mouseMoveHandler(e) {
            if (!this.isMouseDown) return;
            if (this.snapTween) this.snapTween.kill();
            this.mousePosition.current.x = e.clientX;
        },

        touchMoveHandler(e) {
            if (!this.isMouseDown) return;
            if (this.snapTween) this.snapTween.kill();

            this.mousePosition.current.x = e.touches[0].clientX;

            this.$store.commit('aboutScrollLock', true);
        },

        mouseUpHandler() {
            const delta = Math.abs(this.mousePosition.start.x - this.mousePosition.current.x);
            if (this.isMouseDown && delta > MOVE_CLICK_THRESHOLD) this.snap();
            this.isMouseDown = false;
        },

        touchEndHandler() {
            const delta = Math.abs(this.mousePosition.start.x - this.mousePosition.current.x);
            if (this.isMouseDown && delta > MOVE_CLICK_THRESHOLD) this.snap();
            this.isMouseDown = false;

            this.$store.commit('aboutScrollLock', false);
        },

        clickItemHandler(e) {
            const delta = Math.abs(this.mousePosition.start.x - this.mousePosition.current.x);
            if (delta > MOVE_CLICK_THRESHOLD) return;
            if (this.isAnimating) return;

            const target = e.currentTarget;
            const index = this.$refs.listItem.indexOf(target);

            if (this.currentIndex === index) return;

            this.goToIndex(index);
        },

        animateToSlideCompleteHandler() {
            this.isAnimating = false;
        },

        snapUpdateHandler() {
            this.position.target.x = this.position.current.x;
        },

        snapCompleteHandler() {
            this.isAnimating = false;
        },

        tickHandler() {
            this.update();
        },

        timelineShowCompleteHandler() {
            this.isTimelineShowComplete = true;
        },
    },
};
