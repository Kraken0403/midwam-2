// Plugins
import vimeo from '@/plugins/vimeo';

// Vendor
import gsap from 'gsap';

// Components
import ResponsiveImage from '@/components/ResponsiveImage';
import ButtonPlayVideo from '@/components/ButtonPlayVideo';
import ButtonStart from '@/components/ButtonStart';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import AudioManager from '@/utils/AudioManager';

export default {
    props: ['data'],

    data() {
        return {
            isReady: false,
            isPlaying: false,
            isVideoMuted: false,
        };
    },

    // fetch() {
    //     return vimeo.getVideo(this.data.youtube_id).then((response) => {
    //         return {
    //             video: response,
    //         };
    //     });
    // },

    components: {
        ResponsiveImage,
        ButtonPlayVideo,
        ButtonStart,
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    beforeUpdate() {
        this.previousData = this.data;
    },

    updated() {
        const newData = this.data;

        if (newData !== this.previousData) {
            this.$refs.video.load();
        }

        this.previousData = newData;
    },

    mounted() {
        this.progress = 0;

        this.getBoudingBox();
        this.setupEventListeners();
    },

    methods: {
        show() {
            this.showTimeline = new gsap.timeline();
            this.showTimeline.add(this.$refs.button.transitionIn(), 0);
        },

        hide() {
            this.hideTimeline = new gsap.timeline();
            this.hideTimeline.add(this.$refs.button.transitionIn(), 0);
            this.hideTimeline.to(this.$refs.cover, 0.5, { autoAlpha: 1, ease: 'power1.inOut' }, 0);
            this.hideTimeline.to(this.$refs.video, 0.5, { alpha: 0, ease: 'power1.inOut' }, 0);
            this.hideTimeline.to(this.$refs.progressContainer, 1, { alpha: 0, ease: 'power1.inOut' }, 0);
            this.hideTimeline.to(this.$refs.overlay, 0.5, { alpha: 0, ease: 'sine.inOut' }, 0);
        },

        showVideo() {
            this.getBoudingBox();

            this.showVideoTimeline = new gsap.timeline();
            this.showVideoTimeline.to(this.$refs.cover, 0.5, { autoAlpha: 0, ease: 'power1.inOut' }, 0);
            this.showVideoTimeline.to(this.$refs.video, 0.5, { alpha: 1, ease: 'power1.inOut' }, 0);
            this.showVideoTimeline.to(this.$refs.progressContainer, 1, { alpha: 1, ease: 'power1.inOut' }, 0);
            this.showVideoTimeline.to(this.$refs.overlay, 0.5, { alpha: 0, ease: 'sine.inOut' }, 0);
            this.showVideoTimeline.add(this.$refs.button.transitionOut(), 0);
        },

        hideVideo() {
            this.hideVideoTimeline = new gsap.timeline();
            this.hideVideoTimeline.to(this.$refs.overlay, 1, { alpha: 1, ease: 'sine.inOut' });
            this.hideVideoTimeline.add(this.$refs.button.transitionIn(), 0);
        },

        parallax(offsetImage) {
            this.$refs.cover.style.transform = `translate3d(0, ${offsetImage}px, 0)`;
            this.$refs.cover.style['-webkit-transform'] = `translate3d(0, ${offsetImage}px, 0)`;
            this.$refs.cover.style['-moz-transform'] = `translate3d(0, ${offsetImage}px, 0)`;
        },

        play() {
            this.showVideo();
            this.$refs.video.play();
            this.isPlaying = true;
            this.showPauseIcon();

            if (this.isVideoMuted) return;
            AudioManager.mute();
        },

        pause() {
            this.hideVideo();
            this.$refs.video.pause();
            this.isPlaying = false;

            if (this.$store.state.audio.isMuted) return;
            AudioManager.unmute();
        },

        reset() {
            gsap.set(this.$refs.cover, { autoAlpha: 1 });
        },

        requestFullscreen() {
            if (this.$refs.video.requestFullscreen) {
                this.$refs.video.requestFullscreen();
            } else if (this.$refs.video.webkitRequestFullScreen) {
                this.$refs.video.webkitRequestFullScreen();
            } else if (this.$refs.video.mozRequestFullScreen) {
                this.$refs.video.mozRequestFullScreen();
            }
        },

        exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozExitFullscreen) {
                document.mozExitFullscreen();
            }
        },

        updateProgress() {
            if (!this.$refs.video.duration || !this.$refs.video.currentTime) return;

            this.progress = this.$refs.video.currentTime / this.$refs.video.duration;
            this.$refs.progress.style.transform = `scaleX(${this.progress})`;
            this.$refs.progress.style['-webkit-transform'] = `scaleX(${this.progress})`;
            this.$refs.progress.style['-moz-transform'] = `scaleX(${this.progress})`;
        },

        getBoudingBox() {
            this.progressContainerBoundingBox = this.$refs.progressContainer.getBoundingClientRect();
        },

        setupEventListeners() {
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            gsap.ticker.add(this.tickHandler);
        },

        removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
            gsap.ticker.remove(this.tickHandler);
        },

        showPauseIcon() {
            gsap.to(this.$refs.iconPlay, 0.2, { alpha: 0, ease: 'power2.out' });
            gsap.to(this.$refs.iconPause, 0.2, { alpha: 1, delay: 0.22, ease: 'power2.out' });
        },

        showPlayIcon() {
            gsap.to(this.$refs.iconPause, 0.2, { alpha: 0, ease: 'power2.out' });
            gsap.to(this.$refs.iconPlay, 0.2, { alpha: 1, delay: 0.22, ease: 'power2.out' });
        },

        showMuteIcon() {
            gsap.to(this.$refs.iconUnmuted, 0.2, { alpha: 0, ease: 'power2.out' });
            gsap.to(this.$refs.iconMuted, 0.2, { alpha: 1, delay: 0.22, ease: 'power2.out' });
        },

        showUnmutedIcon() {
            gsap.to(this.$refs.iconMuted, 0.2, { alpha: 0, ease: 'power2.out' });
            gsap.to(this.$refs.iconUnmuted, 0.2, { alpha: 1, delay: 0.22, ease: 'power2.out' });
        },

        canplayHandler() {
            this.isReady = true;
        },

        endedHandler() {
            this.isPlaying = false;
            this.hide();

            if (this.$store.state.audio.isMuted) return;
            AudioManager.unmute();
        },

        clickButtonHandler() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        },

        clickCoverHandler() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        },

        clickVideoHandler() {
            if (this.isPlaying) {
                this.$refs.video.pause();
                this.isPlaying = false;
                this.showPlayIcon();

                if (this.$store.state.audio.isMuted) return;
                AudioManager.unmute();
            } else {
                this.$refs.video.play();
                this.isPlaying = true;
                this.showPauseIcon();

                AudioManager.mute();
            }
        },

        clickProgressHandler(e) {
            const x = e.clientX;

            const width = this.progressContainerBoundingBox.width;
            const left = this.progressContainerBoundingBox.left;

            const progress = (x - left) / width;
            const targetTime = progress * this.$refs.video.duration;
            this.$refs.video.currentTime = targetTime;
        },

        clickFullscreenButtonHandler() {
            this.requestFullscreen();
        },

        clickMuteButtonHandler() {
            if (this.isVideoMuted) {
                this.isVideoMuted = false;
                this.$refs.video.muted = false;

                AudioManager.mute();
                this.showUnmutedIcon();
            } else {
                this.isVideoMuted = true;
                this.$refs.video.muted = true;

                if (this.$store.state.audio.isMuted) return;
                AudioManager.unmute();
                this.showMuteIcon();
            }
        },

        clickButtonPlayHandler() {
            if (this.isPlaying) {
                this.$refs.video.pause();
                this.isPlaying = false;
                this.showPlayIcon();

                if (this.$store.state.audio.isMuted) return;
                AudioManager.unmute();
            } else {
                this.$refs.video.play();
                this.isPlaying = true;
                this.showPauseIcon();

                AudioManager.mute();
            }
        },

        tickHandler() {
            this.updateProgress();
        },

        resizeHandler() {
            this.getBoudingBox();
        },
    },
};
