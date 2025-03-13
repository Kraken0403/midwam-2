// Vendor
import gsap from 'gsap';

// Components
import SectionAbout from '@/components/SectionAbout';
import Heading from '@/components/Heading';
import ButtonStart from '@/components/ButtonStart';
import ResponsiveImage from '@/components/ResponsiveImage';
import VideoPlayerAbout from '@/components/VideoPlayerAbout';
import VideoPlayer from '@/components/VideoPlayer';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    extends: SectionAbout,

    components: {
        Heading,
        ButtonStart,
        ResponsiveImage,
        VideoPlayerAbout,
        VideoPlayer,
    },

    computed: {
        coverImage() {
            if (this.data.cover_image.sizes['640x0']) {
                return this.data.cover_image.sizes['640x0'].url;
            }
            return false;
        },
    },

    methods: {
        /**
         * Public
         */
        backgroundShow() {
            const timeline = new gsap.timeline();
            timeline.add(this.$refs.heading.show(), 0.7);
            timeline.fromTo(this.$refs.video, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inout' }, 0.7);
            timeline.add(this.$refs.buttonPlay.transitionIn(), 0.8);
        },

        /**
         * Handlers
         */
        clickButtonPlayHandler() {
            const data = {
                cover_image: this.data.cover_image,
                video_source: this.data.vimeo_url,
            };
            this.$root.theVideoOverlay.show(data);
        },
    },
};
