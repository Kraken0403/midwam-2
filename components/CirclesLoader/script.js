// Vendor
import gsap from 'gsap';

// Utils
import Browser from '@/utils/Browser';

const SETTINGS = {
    colors: {
        '0': '#DD5E20',
        '1': '#4C09FF',
        '2': '#FFC369',
    },
    scales: {
        '0': 1.05,
        '1': 0.42,
        '2': 0.72,
    },
    timeScale: 0.5,
    globalStagger: 0.4,
    circlesStagger: 0.4,
    globalEase: 'power1.out',
};

export default {
    data() {
        return {
            radius: 50,
            width: 100,
            settings: SETTINGS,
        };
    },

    mounted() {
        this._tweenObject = { progress: 0 };

        this.setupGlobaleTimeline();
    },

    methods: {
        /**
         * Public
         */
        play() {
            if (this.progressTimeline) this.progressTimeline.kill();

            this.progressTimeline = new gsap.timeline({
                onUpdate: () => {
                    this.timeline.progress(this._tweenObject.progress);
                },
            });

            this.progressTimeline.timeScale(SETTINGS.timeScale);
            this.progressTimeline.fromTo(this._tweenObject, 1, { progress: 0 }, { progress: 1, ease: SETTINGS.globalEase }, 0);

            return this.progressTimeline;
        },

        /**
         * Private
         */
        setupGlobaleTimeline() {
            if (this.timeline) this.timeline.kill();

            this.timeline = new gsap.timeline({ paused: true });

            this.timeline.fromTo(this.$refs.circlesContainer[0], 3, { scale: 0 }, { scale: SETTINGS.scales['0'], ease: 'power2.out' }, SETTINGS.globalStagger * 0);
            this.timeline.fromTo(this.$refs.circlesContainer[1], 3, { scale: 0 }, { scale: SETTINGS.scales['1'], ease: 'power2.out' }, SETTINGS.globalStagger * 1);
            this.timeline.fromTo(this.$refs.circlesContainer[2], 3, { scale: 0 }, { scale: SETTINGS.scales['2'], ease: 'power2.out' }, SETTINGS.globalStagger * 2);

            this.timeline.add(this.setupTimeline(this.$refs.svg_0), SETTINGS.globalStagger * 0);
            this.timeline.add(this.setupTimeline(this.$refs.svg_1), SETTINGS.globalStagger * 1);
            this.timeline.add(this.setupTimeline(this.$refs.svg_2), SETTINGS.globalStagger * 2);
        },

        setupTimeline(elements) {
            const timeline = new gsap.timeline();

            if (Browser.isSafari()) {
                timeline.fromTo(elements, 0.3, { alpha: 0 }, { alpha: 1, ease: 'none' }, 0);
                timeline.fromTo(elements, 1, { strokeDashoffset: 2 * Math.PI * this.radius }, { strokeDashoffset: Math.PI * this.radius, stagger: SETTINGS.circlesStagger, ease: 'none' }, 0);
                timeline.fromTo(elements, 1, { rotate: '-90deg' }, { rotate: '0deg', stagger: SETTINGS.circlesStagger, ease: 'none' }, 0);

                timeline.to(elements, 1, { rotate: '270deg', stagger: SETTINGS.circlesStagger, ease: 'none' }, 1);
                timeline.to(elements, 1, { alpha: 0, stagger: SETTINGS.circlesStagger, ease: 'none' }, 1);
            } else {
                timeline.fromTo(elements, 0.3, { alpha: 0 }, { alpha: 1, ease: 'none' }, 0);
                timeline.fromTo(elements, 1, { strokeDashoffset: 2 * Math.PI * this.radius }, { strokeDashoffset: Math.PI * this.radius, stagger: SETTINGS.circlesStagger, ease: 'none' }, 0);
                timeline.fromTo(elements, 1, { rotate: '-90deg' }, { rotate: '0deg', stagger: SETTINGS.circlesStagger, ease: 'none' }, 0);

                timeline.set(elements, { rotate: '180deg', stagger: SETTINGS.circlesStagger }, 1);
                timeline.set(elements, { strokeDashoffset: -Math.PI * this.radius, stagger: SETTINGS.circlesStagger }, 1);

                timeline.to(elements, 1, { rotate: '270deg', stagger: SETTINGS.circlesStagger, ease: 'none' }, 1);
                timeline.to(elements, 1, { strokeDashoffset: -2 * Math.PI * this.radius, stagger: SETTINGS.circlesStagger, ease: 'none' }, 1);
                timeline.to(elements, 1, { alpha: 0, stagger: SETTINGS.circlesStagger, ease: 'none' }, 1);
            }

            return timeline;
        },
    },
};
