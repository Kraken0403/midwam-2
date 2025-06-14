import { EventBus } from '@/plugins/event-bus';
import gsap from 'gsap';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
import ButtonUnderlined from '@/components/ButtonUnderlined';


export default {
  name: 'SectionServicesDetail',

  props: {
    sections: {
      type: Array,
      required: true,
    },
  }
  ,
  components: {
    Heading,
    Body,
    ButtonUnderlined,
  },

  data() {
    return {
      activeIndex: 0,
      isStickyPinned: false,
    };
  },

  computed: {
    slides() {
      return this.sections.map((item) => ({
        title: item.title_ || '', // normalize key
        description: item.description || '',
        image: item.image_?.url || '', // normalize key
        call_to_action_label: item.call_to_action_label || '',
        call_to_action_link: item.call_to_action_link || '',
      }));
    },
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

    transitionIn() {
      this._timelineTransitionIn = new gsap.timeline();
      this._timelineTransitionIn.set(this.$el, { alpha: 1 }, 0);
      this._timelineTransitionIn.add(this.$refs.heading.show(), 0);
      // this._timelineTransitionIn.fromTo(this.$refs.scrollArrow, 0.7, { alpha: 0 }, { alpha: 1, ease: 'sine.inOut' }, 1);
      return this._timelineTransitionIn;
    },

    backgroundShow(done, direction) {
      if (this.timelineHide) this.timelineHide.kill();
    
      const delay = direction > 0 ? 0.6 : 0.8;
      this.timelineShow = new gsap.timeline({ delay, onComplete: done });
    
      this.timelineShow.set(this.$el, { autoAlpha: 1 }, 0);
    
      // Get the current index
      this.slides.forEach((_, i) => {
        const heading = this.$refs[`heading_${i}`]?.[0];
        // const body = this.$refs[`body_${i}`]?.[0];
      
        if (heading && typeof heading.show === 'function') {
          this.timelineShow.add(heading.show(), i * 0.2);
        }
      
        // if (body && typeof body.showBlock === 'function') {
        //   this.timelineShow.add(body.showBlock(0), i * 0.2 + 0.1);
        // }
      });
      
    
      return this.timelineShow;
    }
    ,

    backgroundHide() {
        this._timelineBackgroundHide = new gsap.timeline();
        // this._timelineBackgroundHide.to(this.$refs.scrollArrow, 0.7, { alpha: 0, ease: 'sine.inOut' }, 0);
        return this._timelineBackgroundHide;
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
      const scrollY = y;
      let newIndex = this.activeIndex;
      let newProgress = 0;
      let targetScale = 1;

      blocks.forEach((block, index) => {
        const blockRect = block.getBoundingClientRect();
        const blockCenter = blockRect.top + blockRect.height / 2;
        
        const top    = block.offsetTop;
        const height = block.offsetHeight;
        const passed = (y + viewportHeight) - top;
        const total  = viewportHeight + height;

        const viewportCenter = viewportHeight / 2;

        let p = passed / total;
        p = Math.min(Math.max(p, 0), 1);
    
        // When block center is closest to viewport center
        if (Math.abs(blockCenter - viewportCenter) < blockRect.height / 2) {
          newIndex = index;
          // newProgress = p
        }    

        // 2) scrub scale 1 → 1.4
        // targetScale = 1 + newProgress * 0.4;
        
      });
      
      if (newIndex !== this.activeIndex) {
        this.activeIndex = newIndex;
        console.log('targetScale:', targetScale)
        images.forEach((img, i) => {
          gsap.to(img, {
            opacity: i === newIndex ? 1 : 0,
            // scale: i === newIndex ? targetScale : 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      }
    
      
    }

    // handleScrollEffect({ y }) {
    //   if (!this.isStickyPinned) return;
  
    //   const blocks = this.$el.querySelectorAll('.service-block');
    //   const images = this.$el.querySelectorAll('.sticky-imagediv img');
    //   const vh     = window.innerHeight;
    //   let   newIndex    = this.activeIndex;
    //   let   newProgress = 0;
  
    //   // 1) Find which block is >50% scrolled through, capture its progress
    //   blocks.forEach((block, i) => {
    //     const top    = block.offsetTop;
    //     const height = block.offsetHeight;
    //     const passed = (y + vh) - top;
    //     const total  = vh + height;
  
    //     let p = passed / total;
    //     p = Math.min(Math.max(p, 0), 1);
  
    //     if (p >= 0.5) {
    //       newIndex    = i;
    //       newProgress = p;
    //     }
    //   });
  
    //   // 2) If the “active” block changed, fade in its image
    //   if (newIndex !== this.activeIndex) {
    //     this.activeIndex = newIndex;
    //     images.forEach((img, i) => {
    //       gsap.to(img, {
    //         opacity:  i === newIndex ? 1 : 0,
    //         duration: 0.4,
    //         ease:     'power2.out',
    //       });
    //     });
    //   }
  
    //   // 3) Scrub-scale **only** the active image, instantly (no pulsation)
    //   const targetScale = 1 + newProgress * 0.4;
    //   images.forEach((img, i) => {
    //     gsap.to(img, {
    //       scale:    i === newIndex ? targetScale : 1,
    //       duration: 0,
    //       ease:     'none',
    //     });
    //   });
    // },
  
    
    

    // handleScrollEffect({ y }) {
    //   if (!this.isStickyPinned) return;
    
    //   const blocks = this.$el.querySelectorAll('.service-block');
    //   const images = this.$el.querySelectorAll('.sticky-imagediv img');
    //   const viewportHeight = window.innerHeight;
    
    //   let newIndex = this.activeIndex;
    
    //   for (let i = 0; i < blocks.length; i++) {
    //     const block = blocks[i];
    //     const blockTop = block.offsetTop;
    //     const blockHeight = block.offsetHeight;
    
    //     // ✅ Check if the block is visible in viewport
    //     const scrollBottom = y + viewportHeight;
    //     const visibleHeight = scrollBottom - blockTop;
    //     const scrollRatio = visibleHeight / blockHeight;
    
    //     // ✅ If block is scrolled at least halfway into view
    //     if (scrollRatio >= 0.5) {
    //       newIndex = i;
    //     }
    
    //     // ✅ Scrub-based scaling ONLY for active
    //     if (i === newIndex) {
    //       const progress = Math.min(Math.max((y - blockTop + viewportHeight) / (viewportHeight + blockHeight), 0), 1);
    //       const scale = 1 + progress * 0.4;
    //       images[i].style.transform = `scale(${scale})`;
    //     } else {
    //       images[i].style.transform = 'scale(1)';
    //     }
    //   }
    
    //   // ✅ Smooth fade only when index actually changes
    //   if (this.activeIndex !== newIndex) {
    //     this.activeIndex = newIndex;
    //     images.forEach((img, i) => {
    //       gsap.to(img, {
    //         opacity: i === newIndex ? 1 : 0,
    //         duration: 0.4,
    //         ease: 'power2.out',
    //       });
    //     });
    //   }
    // }
    
    
    
  
  },
};
