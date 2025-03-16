// Vendor
import gsap from 'gsap';

// Utils
import math from '@/utils/math';

// Icon
import IconA from '@/assets/images/cursor-icons/icon-a.svg?inline';
import IconB from '@/assets/images/cursor-icons/icon-b.svg?inline';
import IconC from '@/assets/images/cursor-icons/icon-c.svg?inline';
import IconD from '@/assets/images/cursor-icons/icon-d.svg?inline';
import IconE from '@/assets/images/cursor-icons/icon-e.svg?inline';
import IconF from '@/assets/images/cursor-icons/icon-f.svg?inline';
import IconG from '@/assets/images/cursor-icons/icon-g.svg?inline';

export default {
    components: {
        IconA,
        IconB,
        IconC,
        IconD,
        IconE,
        IconF,
        IconG,
    },

    created() {
        this.isVisible = false;
        this.currentIcon = null;
        this.isClickAndHoldEnabled = false;

        this.position = {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
        };

        this.iconPosition = { x: 0, y: 0 };

        this.lerpValues = [0.04, 0.08];

        this.opacities = [0.6, 1];

        this.scaleValues = [
            { current: 1, target: 1.1 },
            { current: 1, target: 1.4 },
        ];
    },

    mounted() {
        this.positions = [];

        this.setupStyles();
        this.setupEventListeners();
        this.animateOut();
    },

    beforeDestroy() {
        this.removeEventListeners();
        this.showNativeCursor();
    },

    methods: {
        /**
         * Public
         */
        show() {
            this.isVisible = true;
            this.hideNativeCursor();

            document.body.addEventListener('mouseenter', this.bodyMouseEnterHandler, true);
            document.body.addEventListener('mouseleave', this.bodyMouseLeaveHandler, true);

            return gsap.to(this.$el, 1, { alpha: 1, ease: 'power2.out' });
        },

        hide() {
            return gsap.to(this.$el, 0.4, { alpha: 0, ease: 'sine.inOut', onComplete: this.hideCompleteHandler });
        },

        enableClickAndHold() {
            // this.isClickAndHoldEnabled = true;
            this.isClickAndHoldEnabled = false;

            if (this.disableTimeline) this.disableTimeline.kill();
            if (this.clickAndHoldTimeline) this.clickAndHoldTimeline.kill();
            if (this.stopTimeline) this.stopTimeline.kill();

            this.hideNativeCursor();

            this.enableTimeline = new gsap.timeline();
            this.enableTimeline.add(this.showDragLabel(), 0);
            this.enableTimeline.add(this.animateIn(), 0);
        },

        disableClickAndHold() {
            this.isClickAndHoldEnabled = false;

            if (this.enableTimeline) this.enableTimeline.kill();
            if (this.clickAndHoldTimeline) this.clickAndHoldTimeline.kill();
            if (this.stopTimeline) this.stopTimeline.kill();

            this.showNativeCursor();

            this.disableTimeline = new gsap.timeline();
            this.disableTimeline.add(this.hideDragLabel(), 0);
            this.disableTimeline.add(this.animateOut(), 0);
        },

        clickAndHold() {
            if (this.disableTimeline) this.disableTimeline.kill();
            if (this.enableTimeline) this.enableTimeline.kill();
            if (this.stopTimeline) this.stopTimeline.kill();

            this.clickAndHoldTimeline = new gsap.timeline();
            this.clickAndHoldTimeline.add(this.animateIn(), 0);
            this.clickAndHoldTimeline.add(this.hideDragLabel(), 0);
            this.clickAndHoldTimeline.add(this.animateCircles(), 0);
            if (this.currentIcon !== this.$refs.iconG) {
                this.clickAndHoldTimeline.to(this.$refs.icons, 0.3, { alpha: 0, ease: 'sine.inOut' }, 0);
            }
            this.clickAndHoldTimeline.to(this.currentIcon, 0.4, { scale: 1.2, ease: 'sine.inOut' }, 0);
        },

        stopClickAndHold() {
            if (this.disableTimeline) this.disableTimeline.kill();
            if (this.enableTimeline) this.enableTimeline.kill();
            if (this.clickAndHoldTimeline) this.clickAndHoldTimeline.kill();

            this.stopTimeline = new gsap.timeline();
            this.stopTimeline.add(this.animateIn(), 0);
            this.stopTimeline.add(this.showDragLabel(), 0);
            this.stopTimeline.add(this.resetCircleScales(), 0);
            this.stopTimeline.to(this.$refs.icons, 0.3, { alpha: 1, ease: 'sine.inOut' }, 0);
            this.stopTimeline.to(this.currentIcon, 0.4, { scale: 1, ease: 'sine.inOut' }, 0);
        },

        /**
         * Private
         */
        setupStyles() {
            for (let i = 0; i < this.$refs.circle.length; i++) {
                this.positions.push({ x: 0, y: 0 });
            }
        },

        animateIn() {
            const timeline = new gsap.timeline();

            for (let i = 0; i < this.$refs.circle.length; i++) {
                const element = this.$refs.circle[i];
                timeline.to(element, 1, { alpha: this.opacities[i] }, 0);
            }

            timeline.to(this.$el, 1, { alpha: 1 }, 0);

            return timeline;
        },

        animateOut() {
            this.dragLabelIsVisible = false;

            const timeline = new gsap.timeline();

            timeline.to(this.$refs.circle, 1, { alpha: 0 }, 0);
            timeline.to(this.$el, 1, { alpha: 0 }, 0);

            return timeline;
        },

        showDragLabel() {
            this.dragLabelIsVisible = true;

            const timeline = new gsap.timeline();

            timeline.to(this.$refs.dragLabel, 0.4, { color: 'rgba(255, 255, 255, 0.5)' }, 0);

            return timeline;
        },

        hideDragLabel() {
            const timeline = new gsap.timeline();

            timeline.to(this.$refs.dragLabel, 0.4, { color: 'rgba(255, 255, 255, 0)' }, 0);

            return timeline;
        },

        animateCircles() {
            const timeline = new gsap.timeline();

            for (let i = 0; i < this.$refs.circle.length; i++) {
                timeline.to(this.scaleValues[i], 0.67, { current: this.scaleValues[i].target * 1.1, ease: 'power3.out' }, 0);
            }

            return timeline;
        },

        showIconA() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconA);
        },

        showIconB() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconB);
        },

        showIconC() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconC);
        },

        showIconD() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconD);
        },

        showIconE() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconE);
        },

        showIconF() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconF);
        },

        showIconG() {
            this.hideCurrentIcon();
            this.showIcon(this.$refs.iconG);
        },

        hideCurrentIcon() {
            if (this.currentIcon) {
                gsap.to(this.currentIcon, 0.5, { alpha: 0, ease: 'sine.inOut' });
            }
        },

        showIcon(icon) {
            this.currentIcon = icon;
            gsap.to(this.currentIcon, 0.5, { alpha: 1, ease: 'sine.inOut', delay: 0.5 });
        },

        resetCircleScales() {
            const timeline = new gsap.timeline();

            for (let i = 0; i < this.$refs.circle.length; i++) {
                timeline.to(this.scaleValues[i], 0.6, { current: 1, ease: 'power3.out' }, 0);
            }

            return timeline;
        },

        update() {
            if (!this.isVisible) return;
            this.updatePosition();
            this.updateIconPosition();
            this.updateTransform();
        },

        updatePosition() {
            for (let i = 0; i < this.positions.length; i++) {
                const lerpValue = this.lerpValues[i];
                this.positions[i].x = math.lerp(this.positions[i].x, this.position.target.x, lerpValue);
                this.positions[i].y = math.lerp(this.positions[i].y, this.position.target.y, lerpValue);
            }
        },

        updateIconPosition() {
            const lerpValue = 0.75;
            this.iconPosition.x = math.lerp(this.iconPosition.x, this.position.target.x, lerpValue);
            this.iconPosition.y = math.lerp(this.iconPosition.y, this.position.target.y, lerpValue);
        },

        updateTransform() {
            for (let i = 0; i < this.positions.length; i++) {
                this.positions[i].x = math.lerp(this.positions[i].x, this.position.target.x, 0.1);
                this.positions[i].y = math.lerp(this.positions[i].y, this.position.target.y, 0.1);
                const transform = `translate3d(${this.positions[i].x}px, ${this.positions[i].y}px, 0px) scale(${this.scaleValues[i].current})`;
                this.transform(this.$refs.circle[i], transform);
            }

            this.transform(this.$refs.dragLabel, `translate3d(${this.positions[0].x}px, ${this.positions[0].y}px, 0px)`);
            this.transform(this.$refs.icons, `translate3d(${this.iconPosition.x}px, ${this.iconPosition.y}px, 0px)`);
        },

        transform(el, transform) {
            el.style.transform = transform;
            el.style.webkitTransform = transform;
            el.style.mozTransform = transform;
        },

        setupEventListeners() {
            window.addEventListener('mousemove', this.mouseMoveHandler);
            gsap.ticker.add(this.tickHandler);
        },

        removeEventListeners() {
            window.removeEventListener('mousemove', this.mouseMoveHandler);
            gsap.ticker.remove(this.tickHandler);
        },

        hideNativeCursor() {
            document.body.classList.add('hide-cursor');
        },

        showNativeCursor() {
            document.body.classList.remove('hide-cursor');
        },

        updateLandscapeIcon(index) {
            const icons = this.$refs.iconG.children;
            let item;
            for (let i = 0, len = icons.length; i < len; i++) {
                item = icons[i];
                if (index === i) {
                    gsap.to(item, 0.3, { fill: '#F2AF71', stroke: '#F2AF71', ease: 'sine.inOut' });
                } else {
                    gsap.to(item, 0.3, { fill: 'transparent', stroke: '#F2AF71', ease: 'sine.inOut' });
                }
            }
        },

        /**
         * Handlers
         */
        mouseMoveHandler(e) {
            // if (!this.isVisible) return;

            const x = e.clientX;
            const y = e.clientY;

            this.position.target.x = x;
            this.position.target.y = y;

            this.mousemoveStart();

            clearTimeout(this.mousemoveTimeout);
            this.mousemoveTimeout = setTimeout(this.mousemoveEndHandler, 400);
        },

        mousemoveStart(e) {
            if (!this.isVisible) return;

            if (this.isMouseMoving) return;
            this.isMouseMoving = true;

            if (this.showLabelOnMoveTween) this.showLabelOnMoveTween.kill();
            this.hideLabelOnMoveTween = gsap.to(this.$refs.dragLabel, 0.3, { alpha: 0 });
        },

        mousemoveEndHandler() {
            if (!this.isVisible) return;

            if (!this.isMouseMoving) return;
            this.isMouseMoving = false;

            if (this.hideLabelOnMoveTween) this.hideLabelOnMoveTween.kill();
            this.showLabelOnMoveTween = gsap.to(this.$refs.dragLabel, 0.8, { alpha: 1, ease: 'power1.inOut' });
        },

        tickHandler() {
            this.time += 0.1;

            this.update();
        },

        bodyMouseEnterHandler(e) {
            if (!this.isClickAndHoldEnabled) return;

            if (!this.isHoverActive) {
                const element = e.target.closest('button') || e.target.closest('a');
                if (element) {
                    this.isHoverActive = element;
                    this.showNativeCursor();
                    gsap.to(this.$el, 0.2, { alpha: 0, ease: 'none' });
                }
            }
        },

        bodyMouseLeaveHandler(e) {
            if (!this.isClickAndHoldEnabled) return;

            if (this.isHoverActive) {
                if (this.isHoverActive === e.target) {
                    this.isHoverActive = null;
                    this.hideNativeCursor();
                    gsap.to(this.$el, 0.2, { alpha: 1, ease: 'none' });
                }
            }
        },

        hideCompleteHandler() {
            this.isVisible = false;
            this.showNativeCursor();
            document.body.removeEventListener('mouseenter', this.bodyMouseEnterHandler, true);
            document.body.removeEventListener('mouseleave', this.bodyMouseLeaveHandler, true);
        },
    },
};
