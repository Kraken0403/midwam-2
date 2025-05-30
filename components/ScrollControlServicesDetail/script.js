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
      isEnabled: true,
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

      EventBus.$emit('virtual-scroll', {y: this.position.current});
      // console.log('emitted', y)

      // Manual sticky logic
      const sticky = document.querySelector('.sticky-imagediv');
      const container = document.querySelector('.services-detail');
      const blocks = document.querySelectorAll('.service-block');
      const endBlock = blocks[blocks.length - 1];

      if (sticky && container && endBlock) {
        const stickyStart = container.offsetTop;
        const stickyEnd = endBlock.offsetTop + endBlock.offsetHeight;

        if (y >= stickyStart && y <= stickyEnd) {
          sticky.style.position = 'absolute';
          sticky.style.top = `${y - stickyStart}px`;
        } else if (y < stickyStart) {
          sticky.style.top = `0px`;
        } else {
          sticky.style.top = `${stickyEnd - stickyStart}px`;
        }
      }
    },

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
