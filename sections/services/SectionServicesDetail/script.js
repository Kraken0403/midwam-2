import { EventBus } from '@/plugins/event-bus';
import gsap from 'gsap';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
import ButtonUnderlined from '@/components/ButtonUnderlined';

import image1 from '@/assets/images/portfolio-detail/crown.JPG';
import image2 from '@/assets/images/portfolio-detail/image4.png';
import image3 from '@/assets/images/portfolio-detail/image3.png';

export default {
  name: 'SectionServicesDetail',

  components: {
    Heading,
    Body,
    ButtonUnderlined,
  },

  data() {
    return {
      activeIndex: 0,
      slides: [
        {
          title: 'Art-direction & Consulting',
          description: 'Whether your website needs a facelift or better direction...',
          image: image1,
          call_to_action_label: 'Learn More',
          call_to_action_link: '/services/art-direction',
        },
        {
          title: 'E-commerce & Shopify',
          description: 'We create lightning-fast headless stores that convert beautifully...',
          image: image2,
          call_to_action_label: 'Shop Now',
          call_to_action_link: '/services/e-commerce',
        },
        {
          title: 'Brand Strategy',
          description: 'Crafting your brand’s story and identity that resonates...',
          image: image3,
          call_to_action_label: 'Explore Strategy',
          call_to_action_link: '/services/branding',
        },
      ],
    };
  },

  mounted() {
    this.initStickyImageState();
    EventBus.$on('virtual-scroll', this.handleScrollEffect);
  },

  beforeDestroy() {
    EventBus.$off('virtual-scroll', this.handleScrollEffect);
  },

  methods: {
    initStickyImageState() {
      const images = this.$el.querySelectorAll('.sticky-imagediv img');
      if (!images.length) return;

      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: index === 0 ? 1 : 1,
        });
      });
    },

    handleScrollEffect({ y }) {
      const blocks = this.$el.querySelectorAll('.service-block');
      const images = this.$el.querySelectorAll('.sticky-imagediv img');
      const viewportHeight = window.innerHeight;
    
      blocks.forEach((block, index) => {
        const blockTop = block.offsetTop;
        const blockHeight = block.offsetHeight;
    
        const scrollInBlock = y + viewportHeight * 0.5 - blockTop;
        const progress = scrollInBlock / blockHeight;
    
        const clampedProgress = Math.max(0, Math.min(progress, 1));
        const scale = 1 + clampedProgress * 0.2; // 1 → 1.2 scaling
    
        gsap.to(images[index], {
          scale,
          duration: 0.3,
          ease: 'power2.out',
        });
    
        const isActive =
          y + viewportHeight * 0.5 >= blockTop &&
          y + viewportHeight * 0.5 <= blockTop + blockHeight;
    
        if (isActive && this.activeIndex !== index) {
          this.activeIndex = index;
    
          images.forEach((img, imgIndex) => {
            gsap.to(img, {
              opacity: imgIndex === index ? 1 : 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          });
        }
      });
    }    
,    
  },
};
