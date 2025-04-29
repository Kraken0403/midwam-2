// Plugins
import { EventBus } from '@/plugins/event-bus';
import gsap from 'gsap';
import normalizeWheel from 'normalize-wheel';
import math from '@/utils/math';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    mounted() {
        this.position = { y: 0 };
        this.scrollProgress = 0;
        this._scrollY = 0;
        this._scrollYTarget = 0;
        this.currentSectionIndex = -1;

        if (process.client) {
            const VirtualScroll = require('virtual-scroll');
            this.virtualScroll = new VirtualScroll({
                el: document,
                mouseMultiplier: 0.7,
                touchMultiplier: 2,
                passive: true,
            });
            this.virtualScroll.on(this.onScroll);
        }

        this.$nextTick(() => {
            if (!this.$root.sectionsInfo || !this.$root.sectionsInfo.length) return;
        
            this.sectionCount = this.$root.sectionsInfo.length;
            this.resize();
        });
        gsap.ticker.add(this.onTick);
    },

    beforeDestroy() {
        if (this.virtualScroll) this.virtualScroll.off(this.onScroll);
        gsap.ticker.remove(this.onTick);
    },

    methods: {
        enable() {
            this.isEnabled = true;

            // setTimeout(() => {
            //     this.goto(6);
            // }, 1000);
        },

        disable() {
            this.isEnabled = false;
        },
        resize() {
            this.viewportHeight = WindowResizeObserver.viewportHeight;
            this.scrollLimit = this.$el.scrollHeight - this.viewportHeight;
        },

        onScroll(event) {
            const delta = event.deltaY || event.wheelDelta || -event.detail;
            this._scrollYTarget = math.clamp(this._scrollYTarget - delta, 0, this.scrollLimit);
        },

        onTick() {
            this._scrollY = math.lerp(this._scrollY, this._scrollYTarget, 0.1); // Lower = smoother
            this.$el.style.transform = `translateY(${-this._scrollY}px)`;
        
            const sections = this.$root?.sectionsInfo;
            const scene = this.$root?.webglApp?.getScene?.('home');
        
            if (!sections || !scene || typeof scene._goto !== 'function') return;
        
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const top = section.position.y;
                const height = section.dimensions.height;
                const bottom = top + height;
        
                // ✳️ Trigger offset: 30% into the section (you can customize per section too)
                const triggerOffset = height * 0.1;
        
                if (this._scrollY >= top + triggerOffset && this._scrollY < bottom) {
                    if (this.currentSectionIndex !== i) {
                        this.currentSectionIndex = i;
                        scene._goto(i, 1); // ✅ Trigger animation
                    }
                    break;
                }
            }
        }
        
        
        
        ,
    },
};
