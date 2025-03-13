// Vendor
import { gsap } from 'gsap';
import InertiaPlugin from '@/vendor/gsap/InertiaPlugin';
import normalizeWheel from 'normalize-wheel';

// Utils
import lerp from '@/utils/math/lerp';
import device from '@/utils/device';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Components
import Section from '@/components/Section';
import ResponsiveImage from '@/components/ResponsiveImage';
import MovingImage from '@/components/MovingImage';
import math from '@/utils/math';

const SMOOTH_VALUE_SCROLL = 0.1;
const SMOOTH_VALUE_TOUCH = 0.3;
const SCROLL_MULTIPLIER = 1;
const MAX_OVERDRAG_DISTANCE = 300;
const MAX_OVERDRAG_DISTANCETOUCH = 100;
const CLICK_TRESHOLD = 3;

export default {
    extends: Section,

    props: ['state'],

    components: {
        ResponsiveImage,
        MovingImage,
    },

    mounted() {
        // Positions
        this.positionY = { current: 0, target: 0 };
        this.dragMousePositionY = 0;
        this.mousePositionY = 0;
        this.mousePositionX = 0;
        this.relativeMousePositionY = 0;
        this.relativeMousePositionX = 0;
        this.deltaY = 0;
        this.touchStartMousePosition = { x: 0, y: 0 };

        // Slider
        this.currentIndex = 0;

        // Flags
        this.allowDrag = false;

        this.track();
        this.getElementsRects();
        this.setupWatchedElements();
        this.setupEventListeners();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        show() {
            if (this.timelineOut) this.timelineOut.kill();
            this.killTweens();
            this.setupWatchedElements();

            return new Promise((resolve) => {
                this.timelineIn = gsap.timeline({
                    onComplete: () => {
                        this.getElementsRects();
                        this.checkIfDragAllowed();
                    },
                });
                this.timelineIn.timeScale(0.9);

                this.timelineIn.set(this.$refs.background, { top: 'auto', bottom: 0 });
                this.timelineIn.fromTo(this.$refs.background, 1.2, { height: '0vh' }, { height: '100vh', ease: 'power4.out' }, 0);
                this.timelineIn.fromTo(this.$refs.item, 1, { y: '300%', autoAlpha: 0 }, { y: '0%', autoAlpha: 1, ease: 'power4.out', stagger: 0.05 }, 0.3);

                setTimeout(resolve, 1200);
            });
        },

        hide() {
            if (this.timelineIn) this.timelineIn.kill();
            this.killTweens();

            this.disableDrag();

            return new Promise((resolve) => {
                this.timelineOut = gsap.timeline({ paused: false });
                this.timelineOut.timeScale(0.9);

                this.timelineOut.set(this.$refs.background, { top: 0, bottom: 'auto' }, 0);
                this.timelineOut.fromTo(this.$refs.item, 0.8, { y: '0%', autoAlpha: 1 }, { y: '-300%', autoAlpha: 0, ease: 'power4.in', stagger: 0.05 }, 0);
                this.timelineOut.fromTo(this.$refs.background, 0.8, { height: '100vh' }, { height: '0vh', ease: 'power4.inOut' }, 0.8);

                setTimeout(resolve, 1200);
            });
        },

        hideItems() {
            this.disableDrag();

            return new Promise((resolve) => {
                if (this.hideItemsTimeline) this.hideItemsTimeline.kill();
                this.hideItemsTimeline = new gsap.timeline({ onComplete: resolve });
                this.hideItemsTimeline.fromTo(this.$refs.item, 0.8, { y: '0%', autoAlpha: 1 }, { y: '-300%', autoAlpha: 0, ease: 'power4.in', stagger: 0.05 });
            });
        },

        showItems() {
            return new Promise((resolve) => {
                this.$nextTick(() => {
                    if (this.hideItemsTimeline) this.hideItemsTimeline.kill();
                    this.setupWatchedElements();

                    this.hideItemsTimeline = new gsap.timeline({
                        onComplete: () => {
                            this.getElementsRects();
                            this.checkIfDragAllowed();
                            resolve();
                        },
                    });

                    this.hideItemsTimeline.fromTo(this.$refs.item, 1, { y: '300%', autoAlpha: 0 }, { y: '0%', autoAlpha: 1, ease: 'power4.out', stagger: 0.05 });
                });
            });
        },

        updateItems() {
            this.resetSliderPosition();
        },

        enableDrag() {
            this.allowDrag = true;
        },

        disableDrag() {
            this.allowDrag = false;
        },

        /**
         * Private
         */
        track() {
            const tracker1 = InertiaPlugin.track(this.positionY, 'target')[0];
            const tracker2 = InertiaPlugin.track(this.positionY, 'current')[0];
        },

        checkIfDragAllowed() {
            if (this.scrollHeight === 0) {
                this.disableDrag();
            } else {
                this.enableDrag();
            }
        },

        getElementsRects() {
            this.listRect = this.$refs.list.getBoundingClientRect();
            this.containerRect = this.$refs.container.getBoundingClientRect();

            this.scrollHeight = Math.max(this.listRect.height - this.containerRect.height, 0);
        },

        setupWatchedElements() {
            this.watchedElements = [];

            for (let i = 0; i < this.$refs.item.length; i++) {
                const element = this.$refs.item[i];
                const { height } = element.getBoundingClientRect();
                const posY = height * i + height / 2;
                let isInView = false;

                if (posY > 0 && posY < this.containerRect.height) {
                    isInView = true;
                    element.classList.add('is-active');
                }

                const watchedEl = {
                    el: element,
                    isInView: true,
                    positionY: posY,
                };

                this.watchedElements.push(watchedEl);
            }
        },

        getClosestValue(endValue) {
            const interval = -this.listRect.height / this.$refs.item.length;

            return Math.round(endValue / interval) * interval;
        },

        throwProps(deltaY) {
            this.tween = gsap.to(this.positionY, {
                inertia: {
                    duration: { max: 1 },
                    resistance: 0,
                    current: {
                        velocity: deltaY || 'auto',
                        max: 0,
                        min: -this.scrollHeight,
                        end: this.getClosestValue,
                    },
                },
                onUpdate: () => {
                    this.positionY.target = this.positionY.current;
                },
            });
        },

        setActive(watchedEl) {
            if (watchedEl.isInView) return;
            watchedEl.isInView = true;
            watchedEl.el.classList.add('is-active');
        },

        setInActive(watchedEl) {
            if (!watchedEl.isInView) return;
            watchedEl.isInView = false;
            watchedEl.el.classList.remove('is-active');
        },

        resetSliderPosition() {
            this.positionY.current = 0;
            this.positionY.target = 0;
        },

        updatePosition() {
            const maxOverdragDistance = device.isTouch() ? MAX_OVERDRAG_DISTANCETOUCH : MAX_OVERDRAG_DISTANCE;
            let distance = 0;

            if (this.positionY.target > 0 && this.deltaY <= 0) {
                distance = this.positionY.target;
            } else if (this.positionY.target < -this.scrollHeight && this.deltaY >= 0) {
                distance = Math.abs(this.positionY.target + this.scrollHeight);
            }

            const ease = Math.sin(Math.min(distance / maxOverdragDistance, 1) * Math.PI);

            this.positionY.target -= this.deltaY * (1 - ease);
        },

        updatePositionOnScroll() {
            this.positionY.target -= this.deltaY;
            this.positionY.target = math.clamp(this.positionY.target, -this.scrollHeight, 0);
        },

        // On tick
        animateBackgroundImages() {
            const relativeMousePositionY = this.mousePositionY - WindowResizeObserver.height / 2;
            const relativeMousePositionX = this.mousePositionX - WindowResizeObserver.width / 2;
            this.updateImagesContainerPosition(relativeMousePositionX, relativeMousePositionY);
        },

        updateImagesContainerPosition(x, y) {
            this.relativeMousePositionX = lerp(this.relativeMousePositionX, x, 0.05);
            this.relativeMousePositionY = lerp(this.relativeMousePositionY, y, 0.05);

            this.$refs.movingImage.updatePosition({ x: this.relativeMousePositionX, y: this.relativeMousePositionY });
        },

        updateListPosition() {
            this.positionY.current = this.draging ? this.touchLerp(this.positionY.current, this.positionY.target) : this.scrollLerp(this.positionY.current, this.positionY.target);

            const transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,${this.positionY.current},0,1)`;
            this.transform(this.$refs.list, transform);
        },

        watchPositions() {
            for (let i = 0; i < this.watchedElements.length; i++) {
                const watchedEl = this.watchedElements[i];
                const y = watchedEl.positionY + this.positionY.current;

                if (y > 0 && y < this.containerRect.height) {
                    this.setActive(watchedEl);
                } else {
                    this.setInActive(watchedEl);
                }
            }
        },

        scrollLerp(current, target) {
            return lerp(current, target, device.isTouch() ? 1 : SMOOTH_VALUE_SCROLL);
        },

        touchLerp(current, target) {
            return lerp(current, target, device.isTouch() ? 1 : SMOOTH_VALUE_TOUCH);
        },

        /**
         * Listeners
         */
        setupEventListeners() {
            gsap.ticker.add(this.tickHandler);
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            document.addEventListener('wheel', this.mousewheelHandler);

            if (device.isTouch()) {
                this.$el.addEventListener('touchstart', this.touchstartHandler);
                this.$el.addEventListener('touchmove', this.touchmoveHandler);
                window.addEventListener('touchend', this.touchendHandler);
            } else {
                this.$el.addEventListener('mousedown', this.touchstartHandler);
                this.$el.addEventListener('mousemove', this.mousemoveHandler);
                window.addEventListener('mouseup', this.touchendHandler);
            }
        },

        removeEventListeners() {
            gsap.ticker.remove(this.tickHandler);
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
            document.removeEventListener('wheel', this.mousewheelHandler);

            if (device.isTouch()) {
                this.$el.removeEventListener('touchstart', this.touchstartHandler);
                this.$el.removeEventListener('touchmove', this.touchmoveHandler);
                window.removeEventListener('touchend', this.touchendHandler);
            } else {
                this.$el.removeEventListener('mousedown', this.touchstartHandler);
                this.$el.removeEventListener('mousemove', this.mousemoveHandler);
                window.removeEventListener('mouseup', this.touchendHandler);
            }
        },

        /**
         * Handlers
         */

        // Mouse events
        mousemoveHandler(e) {
            this.mousePositionY = e.clientY;
            this.mousePositionX = e.clientX;

            this.touchmoveHandler(e);
        },

        mouseenterHandler(event) {
            const currentElement = event.currentTarget;
            const index = parseInt(currentElement.dataset.index);

            if (index === this.currentIndex) {
                this.$refs.movingImage.show();
            } else {
                const currentDirection = index > this.currentIndex ? 1 : -1;
                this.currentIndex = index;
                this.$refs.movingImage.updateImage(this.$refs.image[index].src, currentDirection);
                this.$refs.movingImage.show();
            }
        },

        mouseleaveHandler(event) {
            if (this.$refs.movingImage) {
                this.$refs.movingImage.hide();
            }
        },

        // Touch events
        touchstartHandler(e) {
            if (this.weeling) return;
            if (this.tween) this.tween.kill();

            const y = e.clientY || e.touches[0].clientY;
            const x = e.clientX || e.touches[0].clientX;

            this.touchStartMousePosition = { x, y };

            this.draging = true;
            this.dragMousePositionY = y;
        },

        touchmoveHandler(e) {
            if (this.weeling) return;
            if (!this.allowDrag) return;
            if (!this.draging) return;

            const y = e.clientY || e.touches[0].clientY;

            this.deltaY = this.dragMousePositionY - y;
            this.dragMousePositionY = y;

            this.updatePosition();
        },

        touchendHandler() {
            this.draging = false;

            this.throwProps();
        },

        // Wheel events
        mousewheelStartHandler() {
            if (this.draging) return;
            this.weeling = true;

            if (this.tween) this.tween.kill();
        },

        mousewheelHandler() {
            if (this.draging) return;
            if (!this.allowDrag) return;

            if (!this.weeling) {
                this.mousewheelStartHandler();
            }

            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.mousewheelEndHandler, 50);

            const normalized = normalizeWheel(event);
            const deltaY = normalized.pixelY * SCROLL_MULTIPLIER;

            this.deltaY = deltaY;

            this.updatePositionOnScroll();
        },

        mousewheelEndHandler() {
            this.weeling = false;
        },

        // Click Events
        projectClickHandler(e) {
            const lastMousePos = { x: e.clientX, y: e.clientY };
            const distanceX = Math.abs(this.touchStartMousePosition.x - lastMousePos.x);
            const distanceY = Math.abs(this.touchStartMousePosition.y - lastMousePos.y);

            if (distanceX <= CLICK_TRESHOLD && distanceY <= CLICK_TRESHOLD) {
                const url = e.currentTarget.dataset.link;
                this.$router.push(url);
            }
        },

        // Tick
        tickHandler() {
            this.updateListPosition();
            this.watchPositions();
            this.animateBackgroundImages();
        },

        // Resize
        resizeHandler() {
            this.getElementsRects();
            this.setupWatchedElements();
            this.resetSliderPosition();
            this.checkIfDragAllowed();
        },

        /**
         * Utils
         */
        transform(el, transform) {
            el.style.transform = transform;
            el.style.webkitTransform = transform;
            el.style.mozTransform = transform;
        },

        killTweens() {
            gsap.killTweensOf(this.$refs.background);
            gsap.killTweensOf(this.$refs.item);
        },
    },
};
