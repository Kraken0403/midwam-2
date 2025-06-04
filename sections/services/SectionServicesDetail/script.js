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
      isStickyPinned: false,
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
    EventBus.$on('sticky-pin-state', this.setStickyState);
  },

  beforeDestroy() {
    EventBus.$off('virtual-scroll', this.handleScrollEffect);
    EventBus.$off('sticky-pin-state', this.setStickyState);
  },

  methods: {
    setStickyState(state) {
      this.isStickyPinned = state;
    },

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
      if (!this.isStickyPinned) return;
    
      const blocks = this.$el.querySelectorAll('.service-block');
      const images = this.$el.querySelectorAll('.sticky-imagediv img');
      const viewportHeight = window.innerHeight;
    
      const scrollBottom = y + viewportHeight;
      let newIndex = this.activeIndex;
    
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockTop = block.offsetTop;
        const blockHeight = block.offsetHeight;
    
        // 🔁 Smooth scaling for all images
        const blockProgress = (y + viewportHeight - blockTop) / (viewportHeight + blockHeight);

        const clampedProgress = Math.min(Math.max(blockProgress, 0), 1);
        const scale = 1 + clampedProgress * 0.4; // scale from 1 → 1.4
  
        gsap.to(images[i], {
          scale: scale,
          duration: 0.4,
          ease: 'power2.out',
        });
    
        // ✅ Fade logic
        const visibleHeight = scrollBottom - blockTop;
        const scrollRatio = visibleHeight / blockHeight;
    
        if (scrollRatio >= 1.4) {
          newIndex = i;
        }
      }
    
      // 🔁 Fade transition for active image
      if (this.activeIndex !== newIndex) {
        this.activeIndex = newIndex;
    
        images.forEach((img, i) => {
          gsap.to(img, {
            opacity: i === newIndex ? 1 : 0,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      }
    }
    
     
,    
  },
};
