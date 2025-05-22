// Vendor
import gsap from 'gsap';
import normalizeWheel from 'normalize-wheel';

// Utils
import math from '@/utils/math';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

let VirtualScroll = null;
if (process.client) {
  VirtualScroll = require('virtual-scroll');
}

export default {
  mounted() {
    this.position = { y: 0 };
    this._scrollY = 0;
    this._scrollYTarget = 0;
    this.currentSectionIndex = -1;
    this.isEnabled = false;

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
      if (!VirtualScroll) return null;
      return new VirtualScroll({
        el: this.$el,
        mouseMultiplier: navigator.platform.includes('Win') ? 1 : 0.4,
        useTouch: true,
        passive: true,
        firefoxMultiplier: 50,
        useKeyboard: false,
        touchMultiplier: 2,
      });
    },

    setupEventListeners() {
      if (this.virtualScroll) this.virtualScroll.on(this.wheelEventHandler);
      window.addEventListener('touchstart', this.touchStartHandler, { passive: false });
      window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
      window.addEventListener('touchend', this.touchEndHandler);
      WindowResizeObserver.addEventListener('resize', this.resizeHandler);
    },

    removeEventListeners() {
      if (this.virtualScroll) this.virtualScroll.off(this.wheelEventHandler);
      window.removeEventListener('touchstart', this.touchStartHandler);
      window.removeEventListener('touchmove', this.touchMoveHandler);
      window.removeEventListener('touchend', this.touchEndHandler);
      WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
    },

    enable() {
      this.isEnabled = true;
    },

    disable() {
      this.isEnabled = false;
    },

    wheelEventHandler(e) {
      if (!this.isEnabled) return;

      const deltaRaw = e.deltaY || e.wheelDelta || -e.detail || 0;
      const delta = Math.max(Math.min(deltaRaw, 60), -60);

      this._scrollYTarget = math.clamp(this._scrollYTarget - delta, 0, this.scrollLimit);
    },

    touchStartHandler(e) {
      if (!this.isEnabled || e.touches.length > 1) return;
      this.touchStartY = e.touches[0].clientY;
      this.touchCurrentY = this.touchStartY;
    },

    touchMoveHandler(e) {
      if (!this.isEnabled || e.touches.length > 1) return;
      const newY = e.touches[0].clientY;
      const delta = this.touchCurrentY - newY;
      this.touchCurrentY = newY;

      const cappedDelta = Math.max(Math.min(delta, 60), -60);
      this._scrollYTarget = math.clamp(this._scrollYTarget + cappedDelta, 0, this.scrollLimit);

      e.preventDefault();
    },

    touchEndHandler() {
      this.touchStartY = 0;
      this.touchCurrentY = 0;
    },

    tickHandler() {
      this.update();
    },

    update() {
      this._scrollY = math.lerp(this._scrollY, this._scrollYTarget, 0.05);
      this.updatePosition(this._scrollY);
      this.checkSectionTrigger();
    },

    updatePosition(y) {
      this.position.y = y;
      if (this.$refs.content) {
        this.$refs.content.style.transform = `translateY(${-y}px)`;
      }
    },

    checkSectionTrigger() {
      const scene = this.$root?.webglApp?.getScene?.('home');
      const sections = this.$root?.sectionsInfo;
      if (!scene || !sections || typeof scene._goto !== 'function') return;
    
      const triggerPoint = window.innerHeight * 0.7;
    
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const el = section.component?.$el;
        if (!el) continue;
    
        const rect = el.getBoundingClientRect();
    
        if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
          const scrollType = section.component?.$attrs?.['scroll-type'] || 'free';
    
          // ✅ Enforce snap scroll for step sections
          if (scrollType === 'step' && section.position?.y !== undefined) {
            this._scrollYTarget = section.position.y;
          }
    
          console.log(`🔥 Triggering section: ${section.component?.$options?.name} [${scrollType}]`);
    
          if (this.currentSectionIndex !== i) {
            const prev = this.currentSectionIndex;
            const next = i;
            const direction = next > prev ? 1 : -1;
            this.currentSectionIndex = next;
    
            if (prev !== -1 && Math.abs(next - prev) > 1) {
              const range = direction > 0
                ? [...Array(next - prev).keys()].map(n => prev + n + 1)
                : [...Array(prev - next).keys()].map(n => prev - n - 1);
              range.forEach(idx => scene._goto(idx, direction));
            } else {
              scene._goto(i, direction);
            }
          }
    
          break;
        }
      }
    }
    ,

    resize() {
      this.viewportHeight = WindowResizeObserver.viewportHeight;
      this.scrollLimit = this.$el.scrollHeight - this.viewportHeight;
      this._scrollYTarget = math.clamp(this._scrollYTarget, 0, this.scrollLimit);
      this._scrollY = math.clamp(this._scrollY, 0, this.scrollLimit);
    },

    resizeHandler() {
      this.resize();
    }
  }
};
