// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import VideoPlayer from '@/components/VideoPlayer';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    extends: Section,

    components: {
        VideoPlayer,
    },

    created() {
        this.isShown = false;
    },

    methods: {
        show() {
            if (this.isShown) return;
            this.isShown = true;

            this.timelineShow = new gsap.timeline();
            this.timelineShow.to(this.$el, 1, { alpha: 1, ease: 'power1.out' }, 0);
            this.timelineShow.add(this.$refs.videoPlayer.show(), 0.4);
        },

        parallax(position, sectionInfo) {
            const offsetTop = sectionInfo.position.y - (WindowResizeObserver.height - sectionInfo.dimensions.height) * 0.5;
            const offsetImage = (offsetTop - position.y) * -0.15;

            if (position.y + WindowResizeObserver.height - offsetImage > offsetTop && position.y < offsetTop + sectionInfo.dimensions.height + offsetImage) {
                this.$refs.videoPlayer.parallax(offsetImage);
            }
        },
    },
};
