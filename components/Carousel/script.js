// Vendor
import gsap from 'gsap';
import InertiaPlugin from '@/vendor/gsap/InertiaPlugin';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import math from '@/utils/math';
import Breakpoints from '@/utils/Breakpoints';

// Images
import Arrow from '@/assets/images/icons/arrow-right-large.svg?inline';

// Constants
const MOVE_CLICK_THRESHOLD = 3;

export default {
    props: {
        data: {},
        component: {},
        colors: {},
    },

    data() {
        return {
            lang: this.$i18n.locale,
        };
    },

    components: {
        Arrow,
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
        this.checkAvailableArrows(this.currentIndex);

        InertiaPlugin.track(this.position.current, 'x');
    },

    beforeDestroy() {
        this.removeEventListeners();
        if (this.timelineShow) this.timelineShow.kill();
    },

    methods: {
        transitionIn() {
            const timeline = new gsap.timeline();
            timeline.fromTo(this.$refs.listContainer, 2, { x: `${30 * this.direction}%` }, { x: '0%', ease: 'power1.out' }, 0);

            return timeline;
        },

        next() {
            const stepSize = parseInt(Breakpoints.active('wide') ? this.navigationStepSizeWide : this.navigationStepSizeNarrow);
            this.animateToSlide(this.currentIndex + stepSize);
        },

        previous() {
            const stepSize = parseInt(Breakpoints.active('wide') ? this.navigationStepSizeWide : this.navigationStepSizeNarrow);
            this.animateToSlide(this.currentIndex - stepSize);
        },

        enable() {
            this.isEnabled = true;
        },

        disable() {
            this.isEnabled = false;
        },

        goToIndex(index) {
            if (this.isAnimating) return;
            if (this.snapTween) this.snapTween.kill();
            this.isAnimating = true;

            let x = index * -this.slideWidth * this.direction;

            if (this.direction === -1) {
                x = math.clamp(x, 0, this.minSlide * this.direction);
            } else {
                x = math.clamp(x, this.minSlide, 0);
            }

            this.checkAvailableArrows(index);

            gsap.to(this.position.target, 1, { x, ease: 'power3.inOut', onComplete: this.animateToSlideCompleteHandler });
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

        animateToSlide(index) {
            if (this.isAnimating) return;
            this.isAnimating = true;

            const amount = this.slidesAmount - 1;
            this.currentIndex = math.clamp(index, 0, amount);

            this.$emit('update', {
                min: 0,
                max: amount,
                current: this.currentIndex,
            });

            let x = this.currentIndex * -this.slideWidth;
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
                            const value = Math.round(n / this.slideWidth) * this.slideWidth;
                            return value;
                        },
                    },
                },
                onUpdate: this.snapUpdateHandler,
                onComplete: this.snapCompleteHandler,
            });
        },

        checkAvailableArrows(index) {
            if (index === 0) {
                this.enableArrow('next');
                this.disableArrow('previous');
            } else if (index === this.slidesAmount - 1) {
                this.enableArrow('previous');
                this.disableArrow('next');
            } else {
                this.enableArrow('next');
                this.enableArrow('previous');
            }
        },

        enableArrow(name) {
            let arrow;

            switch (name) {
                case 'next':
                    arrow = this.$refs.buttonNext;
                    break;

                case 'previous':
                    arrow = this.$refs.buttonPrevious;
                    break;
            }

            arrow.disabled = false;
        },

        disableArrow(name) {
            let arrow;

            switch (name) {
                case 'next':
                    arrow = this.$refs.buttonNext;
                    break;

                case 'previous':
                    arrow = this.$refs.buttonPrevious;
                    break;
            }

            arrow.disabled = true;
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
            if (this.snapTween) this.snapTween.kill();
        },

        touchStartHandler(e) {
            this.isMouseDown = true;
            this.mousePosition.previous.x = e.touches[0].clientX;
            this.mousePosition.current.x = e.touches[0].clientX;
            if (this.snapTween) this.snapTween.kill();
        },

        clickHandler(e) {
            const delta = Math.abs(this.mousePosition.start.x - this.mousePosition.current.x);
            if (delta > MOVE_CLICK_THRESHOLD) e.preventDefault();
        },

        mouseMoveHandler(e) {
            this.mousePosition.current.x = e.clientX;
        },

        touchMoveHandler(e) {
            this.mousePosition.current.x = e.touches[0].clientX;
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
        },

        clickPreviousHanlder() {
            if (this.isAnimating) return;

            const index = this.currentIndex - 1;

            if (index < 0 || index > this.slidesAmount - 1) return;
            this.goToIndex(index);
            this.currentIndex = index;
        },

        clickNextHanlder() {
            if (this.isAnimating) return;

            const index = this.currentIndex + 1;

            if (index > this.slidesAmount - 1 || index < 0) return;
            this.goToIndex(index);
            this.currentIndex = index;
        },

        animateToSlideCompleteHandler() {
            this.isAnimating = false;
        },

        snapUpdateHandler() {
            this.position.target.x = this.position.current.x;
        },

        snapCompleteHandler() {
            this.isAnimating = false;
            this.currentIndex = Math.ceil(Math.abs(this.position.current.x / this.slideWidth));
            this.$emit('update', {
                min: 0,
                max: this.slidesAmount - 2,
                current: this.currentIndex,
            });

            this.checkAvailableArrows(this.currentIndex);
        },

        tickHandler() {
            this.update();
        },

        timelineShowCompleteHandler() {
            this.isTimelineShowComplete = true;
        },
    },
};
