// Vendor
import gsap from 'gsap';

// Utils
import Browser from '@/utils/Browser';

export default {
    props: ['content', 'width', 'radius'],

    data() {
        return { scale: this.width / 190 };
    },

    mounted() {
        this.time = 0;
        this.tweenObject = { rotationFactor: 0 };
        this.transitionOutStarted = false;
        this.setupEventListeners();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Public
         */
        transitionIn() {
            if (this.timelineOut) this.timelineOut.kill();

            const svgPathLength = this.$refs.circle.getTotalLength();
            const gapSize = svgPathLength * 0.165;

            this.$refs.circle.style.strokeDasharray = svgPathLength;

            this.timelineIn = new gsap.timeline({ onComplete: this.transitionInCompleteHandler });

            // Rotations
            this.timelineIn.set(this.$refs.svg, { rotate: 0, strokeDashoffset: svgPathLength }, 0);
            this.timelineIn.fromTo(this.$refs.svg, 1.5, { strokeDashoffset: svgPathLength }, { strokeDashoffset: gapSize, ease: 'power2.out' }, 0.7);
            this.timelineIn.to(this.tweenObject, 1.5, { rotationFactor: 1.2, ease: 'power2.out' }, 0.7);

            // Alpha / Colors
            this.timelineIn.set(this.$el, { autoAlpha: 1 }, 0);
            this.timelineIn.to(this.$refs.svg, 0.3, { alpha: 1, ease: 'none' }, 0.5);
            this.timelineIn.fromTo(this.$refs.circle, 1.5, { stroke: '#9b3511' }, { stroke: '#e68658', ease: 'power1.in' }, 0.7);
            this.timelineIn.fromTo(this.$refs.label, 1.5, { color: '#9b3511' }, { color: '#e68658', ease: 'power1.in' }, 0.5);
            this.timelineIn.to(this.$refs.label, 1.5, { alpha: 1, ease: 'sine.inOut' }, 0);

            return this.timelineIn;
        },

        transitionOut() {
            if (this.timelineIn) this.timelineIn.kill();

            this.transitionOutStarted = true;
            this.allowMouseenter = false;

            const svgPathLength = this.$refs.circle.getTotalLength();
            const gapSize = svgPathLength * 0.165;

            this.timelineOut = new gsap.timeline();

            // Rotations
            if (Browser.isSafari()) {
                this.timelineOut.to(this.$refs.svg, 1.5, { rotate: '180deg', ease: 'power2.inOut' }, 0);
                this.timelineOut.to(this.$refs.svg, 1.5, { strokeDashoffset: 0, ease: 'power2.inOut' }, 0);
            } else {
                this.timelineOut.set(this.$refs.svg, { strokeDashoffset: -gapSize, rotate: `${-Math.PI / 3}rad` }, 0);
                this.timelineOut.to(this.$refs.svg, 1.5, { strokeDashoffset: -2 * Math.PI * this.radius, ease: 'power2.inOut' }, 0);
                this.timelineOut.to(this.tweenObject, 1.5, { rotationFactor: 1.5, ease: 'power2.out' }, 0.5);
            }

            // Alpha / Colors
            this.timelineOut.to(this.$refs.svg, 0.5, { alpha: 0, ease: 'none' }, 1);
            this.timelineOut.to(this.$refs.label, 1, { alpha: 0, ease: 'power1.inOut' }, 0);
            this.timelineOut.set(this.$el, { autoAlpha: 0 });

            return this.timelineOut;
        },

        /**
         * Private
         */
        updateRotation() {
            this.$refs.svgContainer.style.transform = `rotate(${-90 + this.time}deg)`;
            this.$refs.svgContainer.style['-webkit-transform'] = `rotate(${-90 + this.time}deg)`;
            this.$refs.svgContainer.style['-moz-transform'] = `rotate(${-90 + this.time}deg)`;
        },

        setupEventListeners() {
            gsap.ticker.add(this.tickHandler);
        },

        removeEventListeners() {
            gsap.ticker.remove(this.tickHandler);
        },

        clickHandler() {
            if (!this.$parent.buttonStartClickHandler) return;
            this.$parent.buttonStartClickHandler();
        },

        mouseenterHanlder() {
            if (!this.allowMouseenter) return;
            gsap.killTweensOf(this.$refs.label);
            gsap.killTweensOf(this.$refs.circle);

            gsap.to(this.$refs.label, 0.5, { color: '#ffffff', alpha: 1, ease: 'none' }, 0);
            gsap.to(this.$refs.circle, 0.5, { stroke: '#ffffff', ease: 'none' }, 0);
        },

        mouseleaveHanlder() {
            if (this.transitionOutStarted) return;

            gsap.killTweensOf(this.$refs.label);
            gsap.killTweensOf(this.$refs.circle);

            gsap.to(this.$refs.label, 0.5, { color: '#e68658', alpha: 1, ease: 'none' }, 0);
            gsap.to(this.$refs.circle, 0.5, { stroke: '#e68658', ease: 'none' }, 0);
        },

        tickHandler() {
            this.time += 1 * this.tweenObject.rotationFactor;
            this.updateRotation();
        },

        transitionInCompleteHandler() {
            this.allowMouseenter = true;
        },
    },
};
