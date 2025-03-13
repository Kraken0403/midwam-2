// Plugins
import { EventBus } from '@/plugins/event-bus';

// Vendor
import gsap from 'gsap';
import normalizeWheel from 'normalize-wheel';

// Utils
import math from '@/utils/math';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Store
import { FOCUS_STARTED } from '@/store';

let VirtualScroll = null;
if (process.client) {
    VirtualScroll = require('virtual-scroll');
}

// Constants
const MAX_STEPPED_STEPS = 6;
const STEP_SCROLL_THRESHOLD = 5.5;

export default {
    mounted() {
        // Data
        this.currentStepIndex = 0;
        this.sectionHeight = 0;
        this.position = { x: 0, y: 0 };
        this.touchStartPosition = { x: 0, y: 0 };
        this.touchDelta = { x: 0, y: 0 };
        this.touchPosition = {
            current: { x: 0, y: 0 },
            previous: { x: 0, y: 0 },
        };
        this.freeScrollPosition = {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
        };

        // Flags
        this.isEnabled = false;
        this.isAnimating = false;
        this.isWebglAppAnimationDone = false;
        this.isSectionAnimationDone = false;

        // Setup
        this.virtualScroll = this.setupVirtualScroll();
        this.setupEventListeners();
        this.$nextTick(this.resize);
    },

    beforeDestroy() {
        this.removeEventListeners();
        this.resetBackgroundPosition();
    },

    methods: {
        /**
         * Private
         */
        setupEventListeners() {
            // window.addEventListener('wheel', this.wheelEventHandler);
            if (this.virtualScroll) this.virtualScroll.on(this.wheelEventHandler);
            // window.addEventListener('touchstart', this.touchStartHandler);
            // window.addEventListener('touchmove', this.touchMoveHandler);
            // window.addEventListener('touchend', this.touchEndHandler);
            gsap.ticker.add(this.tickHandler);
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
        },

        removeEventListeners() {
            // window.removeEventListener('wheel', this.wheelEventHandler);
            if (this.virtualScroll) this.virtualScroll.off(this.wheelEventHandler);
            // window.removeEventListener('touchstart', this.touchStartHandler);
            // window.removeEventListener('touchmove', this.touchMoveHandler);
            // window.removeEventListener('touchend', this.touchEndHandler);
            gsap.ticker.remove(this.tickHandler);
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
        },

        setupVirtualScroll() {
            if (!VirtualScroll) return;
            const virtualScroll = new VirtualScroll({
                el: document,
                mouseMultiplier: navigator.platform.includes('Win') ? 1 : 0.4,
                useTouch: true,
                passive: true,
                firefoxMultiplier: 50,
                useKeyboard: false,
                touchMultiplier: 2,
            });
            return virtualScroll;
        },

        nextStep() {
            this.goto(this.currentStepIndex + 1);
        },

        previousStep() {
            this.goto(this.currentStepIndex - 1);
        },

        enable() {
            this.isEnabled = true;

            // setTimeout(() => {
            //     this.goto(6);
            // }, 1000);
        },

        disable() {
            this.isEnabled = false;
        },

        goto(index) {
            if (this.$store.state.focus === FOCUS_STARTED) return;

            const newIndex = math.clamp(index, 0, MAX_STEPPED_STEPS);
            const direction = newIndex > this.currentStepIndex ? 1 : -1;

            if (newIndex !== this.currentStepIndex) {
                this.isAnimating = true;
                this.isWebglAppAnimationDone = false;
                this.isSectionAnimationDone = false;

                EventBus.$emit('stepscroll', { index: newIndex, delta: newIndex - this.currentStepIndex });

                // Hide section
                this.hideSection(this.currentStepIndex, direction, () => {
                    this.currentStepIndex = newIndex;
                    this.slideToStep(this.currentStepIndex, direction);
                    this.checkIfAnimationsAreFinished();

                    // Show section
                    this.showSection(this.currentStepIndex, direction, () => {
                        this.isSectionAnimationDone = true;
                        this.checkIfAnimationsAreFinished();
                    });
                });

                // Start webgl animation
                const delay = direction > 0 && newIndex === 1 ? 0.1 : 0.5;
                gsap.delayedCall(delay, () => {
                    if (this.$root.webglApp) {
                        this.$root.webglApp.goto(index, direction, () => {
                            this.isWebglAppAnimationDone = true;
                            this.checkIfAnimationsAreFinished();
                        });
                    }
                });
            }
        },

        hideSection(index, direction, done) {
            const component = this.$root.sectionsInfo[index].component;
            if (typeof component.backgroundHide === 'function') {
                component.backgroundHide(done, direction);
            } else {
                done();
            }
        },

        showSection(index, direction, done) {
            const component = this.$root.sectionsInfo[index].component;
            if (typeof component.backgroundShow === 'function') {
                component.backgroundShow(done, direction);
            } else {
                done();
            }
        },

        slideToStep(index, direction) {
            const start = this.sectionHeight * (index - 1 * direction);
            const end = this.sectionHeight * index;

            const props = {
                y: start,
            };

            gsap.to(props, 0, {
                y: end,
                ease: 'power3.inOut',
                onUpdate: () => {
                    this.updatePosition(props.y);
                },
            });
        },

        updatePosition(y) {
            this.position.y = y;
            if (this.$refs.content) {
                this.$refs.content.style.transform = `translate(0, ${-this.position.y}px)`;
            }
        },

        checkIfAnimationsAreFinished() {
            // if (this.isWebglAppAnimationDone && this.isSectionAnimationDone) {
            if (this.isWebglAppAnimationDone) {
                this.isAnimating = false;
            }
        },

        resetBackgroundPosition() {
            if (!this.$root.webglBackground) return;
            this.$root.webglBackground.$el.style.transform = 'translateY(0px)';
            this.$root.webglApp.getScene('home').cameraAnimation.offset.y = 0;
        },

        /**
         * Update cycle
         */
        update() {
            if (this.isFreeScroll) {
                this.freeScrollPosition.current.y = math.lerp(this.freeScrollPosition.current.y, this.freeScrollPosition.target.y, 0.1);
                this.updatePosition(this.freeScrollPosition.current.y);
                this.updateWebglBackgroundPosition(this.freeScrollPosition.current.y);
            }
        },

        updateWebglBackgroundPosition(y) {
            if (!this.$root.webglBackground) return;
            // const canvasY = y - this.stepScrollLimit;
            const canvasY = (y - this.stepScrollLimit) / WindowResizeObserver.height;
            // this.$root.webglBackground.$el.style.transform = `translateY(${-canvasY * 0.5}px)`;
            // this.$root.webglBackground.$el.style.opacity = 1 - canvasY * 0.002;
            this.$root.webglApp.getScene('home').cameraAnimation.offset.y = -canvasY * 50;
            this.$root.webglApp.getScene('home').cameraAnimation._scrollOffset.y = -canvasY * 150;
            this.$root.webglApp._postProcessing.passes.hidePass.material.progress = 1 - canvasY;
            this.$root.webglApp._postProcessing.passes.finalPass.material.uniforms.uGradientsAlpha.value = 1 - canvasY;
        },

        /**
         * Resize
         */
        resize() {
            this.sectionHeight = WindowResizeObserver.viewportHeight;
            this.maxSteps = this.$root.sectionsInfo.length;
            this.stepScrollLimit = this.getStepScrollLimit();
            this.freeScrollLimit = this.getFreeScrollLimit();
            this.freeScrollPosition.current.y = this.stepScrollLimit;
            this.freeScrollPosition.target.y = this.stepScrollLimit;
            this.resizeContainer();
            this.updatePositionOnResize();
        },

        getStepScrollLimit() {
            let lastStepIndex = 0;
            for (let i = 0, len = this.$root.sectionsInfo.length; i < len; i++) {
                if (this.$root.sectionsInfo[i].scrollType === 'step') {
                    lastStepIndex = i;
                }
            }
            return lastStepIndex * this.sectionHeight;
        },

        getFreeScrollLimit() {
            return this.$root.sectionsInfo[this.maxSteps - 1].position.y + this.$root.sectionsInfo[this.maxSteps - 1].dimensions.height - this.sectionHeight;
        },

        resizeContainer() {
            this.$el.style.height = `${this.sectionHeight}px`;
        },

        updatePositionOnResize() {
            if (!this.isEnabled) return;

            if (!this.isFreeScroll) {
                const y = this.sectionHeight * this.currentStepIndex;
                this.updatePosition(y);
            }
        },

        /**
         * Handlers
         */
        wheelEventHandler(e) {
            if (this.isAnimating || !this.isEnabled) return;

            const y = -e.deltaY;
            const direction = e.deltaY > 0 ? -1 : 1;
            const delta = Math.abs(this.position.y - this.stepScrollLimit);

            let stepScroll = true;
            if (delta < 2) {
                if (direction > 0) {
                    stepScroll = false;
                } else {
                    stepScroll = true;
                }
            } else if (this.position.y > this.stepScrollLimit) {
                stepScroll = false;
            }

            if (stepScroll) {
                this.isFreeScroll = false;
                if (Math.abs(y) > STEP_SCROLL_THRESHOLD) {
                    if (y > 0) {
                        this.nextStep();
                    } else {
                        this.previousStep();
                    }
                }

                // TMP
                this.isCursorDragLabelVisible = true;
            } else {
                this.isFreeScroll = true;

                this.freeScrollPosition.target.y += y;
                this.freeScrollPosition.target.y = math.clamp(this.freeScrollPosition.target.y, this.stepScrollLimit, this.freeScrollLimit);

                // TMP
                if (this.isCursorDragLabelVisible) {
                    this.isCursorDragLabelVisible = false;
                    if (this.$root.customCursor) {
                        this.$root.customCursor.disableClickAndHold();
                    }
                }
            }
        },

        touchStartHandler(e) {
            if (this.isAnimating || !this.isEnabled) return;

            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            this.touchStartPosition.x = x;
            this.touchStartPosition.y = y;
            this.touchPosition.current.x = x;
            this.touchPosition.current.y = x;
            this.touchPosition.previous.x = x;
            this.touchPosition.previous.y = x;
        },

        touchMoveHandler(e) {
            if (this.isAnimating || !this.isEnabled) return;

            // Total delta
            const x = this.touchStartPosition.x - e.touches[0].clientX;
            const y = this.touchStartPosition.y - e.touches[0].clientY;
            this.touchDelta.x = x;
            this.touchDelta.y = y;

            // Delta difference
            this.touchPosition.current.x = e.touches[0].clientX;
            this.touchPosition.current.y = e.touches[0].clientY;
            // const deltaX = this.touchPosition.current.x - this.touchPosition.previous.x;
            const diffY = this.touchPosition.current.x - this.touchPosition.previous.x;
            this.touchPosition.previous.x = this.touchPosition.current.x;
            this.touchPosition.previous.y = this.touchPosition.current.y;

            if (this.position.y < this.stepScrollLimit) {
                this.isFreeScroll = false;
            } else {
                this.isFreeScroll = true;
                this.freeScrollPosition.target.y = math.clamp(this.freeScrollPosition.target.y + diffY, this.stepScrollLimit - 1, this.freeScrollLimit);
            }
        },

        touchEndHandler(e) {
            if (this.isAnimating || !this.isEnabled) return;

            if (this.position.y < this.stepScrollLimit) {
                if (Math.abs(this.touchDelta.y) > STEP_SCROLL_THRESHOLD) {
                    if (this.touchDelta.y > 0) {
                        this.nextStep();
                    } else {
                        this.previousStep();
                    }
                }
            } else {
                // this.isFreeScroll = true;
            }
        },

        tickHandler() {
            this.update();
        },

        resizeHandler() {
            this.resize();
        },
    },
};
