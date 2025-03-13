// Vendor
import gsap from 'gsap';

// Components
import ButtonArrow from '@/components/ButtonArrow';
import ButtonPlay from '@/components/ButtonPlay';

export default {
    props: ['data'],

    components: {
        ButtonArrow,
        ButtonPlay,
    },

    methods: {
        fadeIn() {
            if (this.timelineFadeOut) this.timelineFadeOut.kill();

            this.timelineFadeIn = new gsap.timeline();
            if (this.$i18n.locale === 'ar') {
                this.timelineFadeIn.to(this.$refs.title, 0.5, { color: 'rgba(255, 255, 255, 1)', opacity: 1 }, 0);
            } else {
                this.timelineFadeIn.to(this.$refs.title, 0.5, { color: 'rgba(255, 255, 255, 1)' }, 0);
            }
            this.timelineFadeIn.to(this.$refs.description, 0.5, { alpha: 1 }, 0);
            this.timelineFadeIn.to(this.$refs.buttons, 0.5, { alpha: 1 }, 0);
        },

        fadeOut(instant = false) {
            if (this.timelineFadeIn) this.timelineFadeIn.kill();
            const duration = instant ? 0 : 0.5;

            this.timelineFadeOut = new gsap.timeline();
            if (this.$i18n.locale === 'ar') {
                this.timelineFadeOut.to(this.$refs.title, duration, { color: 'rgba(255, 255, 255, 1)', opacity: 0.3 }, 0);
            } else {
                this.timelineFadeOut.to(this.$refs.title, duration, { color: 'rgba(255, 255, 255, 0)' }, 0);
            }
            this.timelineFadeOut.to(this.$refs.description, duration, { alpha: 0 }, 0);
            this.timelineFadeOut.to(this.$refs.buttons, duration, { alpha: 0 }, 0);
        },

        clickVideoHandler() {
            if (this.$store.state.videoOverlay.isOpen) {
                this.$store.commit('videoOverlay/close');
                this.$root.videoOverlay.hide();
            } else {
                this.$store.commit('videoOverlay/open');
                this.$store.commit('videoOverlay/data', {});
                this.$root.videoOverlay.show();
            }
        },
    },
};
