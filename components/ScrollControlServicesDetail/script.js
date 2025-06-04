import { EventBus } from '@/plugins/event-bus';

import gsap from 'gsap';
import math from '@/utils/math';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

let VirtualScroll = null;
if (process.client) {
  VirtualScroll = require('virtual-scroll');
}

export default {
  data() {
    return {
      position: { current: 0, target: 0 },
      maxScroll: 0,
      isStickyPinned: false,
      isEnabled: true,
      firstBlockIsAtTop: false,
    };
  },

  mounted() {
    this.virtualScroll = this.setupVirtualScroll();
    this.setupEventListeners();
    this.$nextTick(() => {
      this.resize();
      gsap.ticker.add(this.tickHandler);
    });
  },

  beforeDestroy() {
    this.removeEventListeners();
    gsap.ticker.remove(this.tickHandler);
  },

  methods: {
    setupVirtualScroll() {
      return new VirtualScroll({
        el: document,
        mouseMultiplier: 0.8,
        touchMultiplier: 1.5,
        passive: true,
      });
    },

    setupEventListeners() {
      if (this.virtualScroll) {
        this.virtualScroll.on(this.wheelHandler);
      }
      WindowResizeObserver.addEventListener('resize', this.resizeHandler);
    },

    removeEventListeners() {
      if (this.virtualScroll) this.virtualScroll.off(this.wheelHandler);
      WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
    },

    wheelHandler(e) {
      if (!this.isEnabled) return;
      this.position.target -= e.deltaY;
      this.position.target = math.clamp(this.position.target, 0, this.maxScroll);
    },

    tickHandler() {
      this.position.current = math.lerp(this.position.current, this.position.target, 0.1);
      this.updateScroll(this.position.current);
    },

    updateScroll(y) {
      const scroller = this.$refs.content;
      if (scroller) {
        scroller.style.transform = `translate3d(0, ${-y}px, 0)`;
      }
    
      const section = document.querySelector('.section--services-detail');
      const sticky = document.querySelector('.sticky-imagediv');
      const wrapper = document.querySelector('.sticky-wrapper');
    
      if (!section || !sticky || !wrapper) return;
    
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
    
      const stickyHeight = sticky.offsetHeight;
    
      // The amount scrolled inside the section
      const scrollInside = y - sectionTop;
    
      if (y < sectionTop) {
        // Before section starts
        sticky.style.position = 'absolute';
        sticky.style.top = '0px';
        this.isStickyPinned = false;
      } else if (y >= sectionTop && y <= sectionBottom - stickyHeight) {
        // While section is scrolling and sticky should be pinned
        sticky.style.position = 'absolute';
        sticky.style.top = `${scrollInside}px`;
        this.isStickyPinned = true;
      } else {
        // After the section ends
        sticky.style.position = 'absolute';
        sticky.style.top = `${sectionHeight - stickyHeight}px`;
        this.isStickyPinned = false;
      }
    
      EventBus.$emit('virtual-scroll', { y });
      EventBus.$emit('sticky-pin-state', this.isStickyPinned);
    }
    
    ,

    resize() {
      this.$nextTick(() => {
        const scroller = this.$refs.content;
        if (scroller) {
          this.maxScroll = scroller.scrollHeight - WindowResizeObserver.viewportHeight;
        }
      });
    },

    resizeHandler() {
      this.resize();
    },
  },
};
