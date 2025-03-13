// Vendor
import gsap from 'gsap';

// Utils
import AudioManager from '@/utils/AudioManager';

const MIN_SCALE = 0.2;

export default {
    data() {
        return {
            isMuted: false,
        };
    },

    mounted() {
        // TMP
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.$el.style.display = 'block';
        }

        this.setupTimeline();

        // Analytics
        this.hasBeenMutedOnce = false;
    },

    beforeDestroy() {
        this.timeline.kill();
    },

    methods: {
        /**
         * Public
         */
        show() {
            this.timelineShow = new gsap.timeline();
            this.timelineShow.to(this.$el, 1.5, { alpha: 1, ease: 'sine.inOut' }, 0);
            return this.timelineShow;
        },

        fadeIn() {
            if (this.timelineFadeOut) this.timelineFadeOut.kill();
            this.timelineFadeIn = new gsap.timeline();
            this.timelineFadeIn.to(this.$el, 0.33, { alpha: 1, ease: 'sine.inOut' }, 0.1);
        },

        fadeOut() {
            if (this.timelineFadeIn) this.timelineFadeIn.kill();
            this.timelineFadeOut = new gsap.timeline();
            this.timelineFadeOut.to(this.$el, 0.33, { alpha: 0, ease: 'sine.inOut' }, 0);
        },

        /**
         * Private
         */
        setupTimeline() {
            this.timeline = new gsap.timeline({
                paused: true,
                onComplete: this.onCompleteHandler,
            });

            for (let i = 0; i < this.$refs.line.length; i++) {
                this.timeline.to(this.$refs.line[i], 0.5, { scaleY: MIN_SCALE + 1 * Math.random(), ease: 'none' }, 0);
            }

            this.timeline.play();
        },

        mute() {
            this.timeline.kill();
            gsap.to(this.$refs.line, 0.3, { scaleY: MIN_SCALE, ease: 'none' });
            this.$store.commit('audio/mute', {});
        },

        unmute() {
            this.timeline.kill();
            this.setupTimeline();
            this.$store.commit('audio/unmute', {});
        },

        toggleMute() {
            if (this.isMuted) {
                this.unmute();
            } else {
                this.mute();
            }

            this.isMuted = AudioManager.toggleMute();

            if (this.hasBeenMutedOnce) return;
            this.hasBeenMutedOnce = true;
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'mute',
            });
        },

        /**
         * Handlers
         */
        clickHandler() {
            this.toggleMute();
        },

        onCompleteHandler() {
            this.timeline.kill();
            this.setupTimeline();
        },
    },
};
