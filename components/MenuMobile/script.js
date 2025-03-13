import gsap from 'gsap';

export default {
    mounted() {
        this.items = [this.$refs.listItem1, this.$refs.listItem2, this.$refs.listItem3, this.$refs.listItem4];
    },

    methods: {
        show() {
            if (this.timelineIn) this.timelineIn.kill();
            if (this.timelineOut) this.timelineOut.kill();

            this.timelineIn = new gsap.timeline();
            this.timelineIn.to(this.$refs.background, 1.5, { scaleY: 1, ease: 'power4.inOut' });
            this.timelineIn.to(this.items, 1, { autoAlpha: 1, ease: 'power3.inOut', stagger: 0.1 }, 0.8);
            this.timelineIn.fromTo(this.items, 0.7, { y: 50 }, { y: 0, ease: 'power3.Out', stagger: 0.1 }, 0.8);

            this.$el.style.pointerEvents = 'all';
            this.lockScroll();
        },

        hide() {
            if (this.timelineOut) this.timelineOut.kill();
            if (this.timelineIn) this.timelineIn.kill();

            this.timelineOut = new gsap.timeline();
            this.timelineOut.to(this.items, 0.8, { autoAlpha: 0, ease: 'power2.inOut' });
            this.timelineOut.to(this.$refs.background, 1.5, { scaleY: 0, ease: 'power4.inOut' }, 0.4);

            this.$el.style.pointerEvents = 'none';
            this.unlockScroll();
        },

        lockScroll() {
            if (this.$root.scrollManager) this.$root.scrollManager.lockScroll();
        },

        unlockScroll() {
            if (!this.$root.scrollManager) return;
            this.$root.scrollManager.unlockScroll();
        },

        linkClickHander() {
            this.hide();
        },
    },
};
