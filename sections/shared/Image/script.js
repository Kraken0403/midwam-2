// Vendor
import gsap from 'gsap';

// Components
import Section from '@/components/Section';
import ResponsiveImage from '@/components/ResponsiveImage';

// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    extends: Section,

    components: {
        ResponsiveImage,
    },

    methods: {
        show() {
            gsap.to(this.$el, 1, { alpha: 1, ease: 'power1.out' });
        },

        parallax(position, sectionInfo) {
            const offsetTop = sectionInfo.position.y;
            const offsetImage = (offsetTop - position.y) * -0.2;
            // const offsetRow = (offsetTop - position.y) * 0.05;
            if (position.y + WindowResizeObserver.height - offsetImage > offsetTop && position.y < offsetTop + sectionInfo.dimensions.height + offsetImage) {
                this.$refs.image.$el.style.transform = `translate3d(0, ${offsetImage}px, 0)`;
                // this.$refs.videoContainer.style.transform = `translateY(${offsetRow}px)`;
            }
        },
    },
};
