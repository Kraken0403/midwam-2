// Vendor
import gsap from 'gsap';

// Compontents
import SectionHome from '@/components/SectionHome';
import Heading from '@/components/Heading';
import Body from '@/components/Body';
import NavigationDots from '@/components/NavigationDots';

// Data
import landscapes from '@/webgl/configs/landscapes';
import math from '@/utils/math';

export default {
    extends: SectionHome,

    components: {
        Heading,
        Body,
        NavigationDots,
    },

    data() {
        return {
            landscapes,
        };
    },

    mounted() {
        this.activeLandscapeIndex = 0;
        this._setupIntersectionObserver();
    },

    methods: {
        _setupIntersectionObserver() {
            this._io = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting) {
                  this._io.disconnect()
                  // direction = 1 to mimic “forward” scroll
                  this.backgroundShow(/* done */ () => {}, /* direction */ 1)
                }
              },
              { threshold: 0.25 }
            )
            this._io.observe(this.$el)
          },
        /**
         * Public
         */
        backgroundShow(done, direction) {
            if (this.timelineHide) this.timelineHide.kill();

            const delay = direction > 0 ? 3 : 2;
            this.timelineShow = new gsap.timeline({ delay, onComplete: done });
            this.timelineShow.set(this.$el, { alpha: 1 }, 0);
            this.timelineShow.add(this.$refs.heading.show(), 0);
            this.timelineShow.add(this.$refs.body.showBlock(0), 0.6);
            // this.timelineShow.add(this.$refs.navigationDots.show(), 1.3);
            return this.timelineShow;
        },

        backgroundHide(done, direction) {
            if (this.timelineShow) this.timelineShow.kill();

            const delay = direction > 0 ? 0 : 0;
            this.timelineHide = new gsap.timeline({ delay, onComplete: done });
            this.timelineHide.to(this.$el, 0.5, { alpha: 0 }, 0.4);
            this.$refs.heading.hide();
            return this.timelineHide;
        },

        focus() {
            this.isHideLandscapeComplete = false;
            const scene = this.$root.webglApp.getScene('home');
            // scene.hideLandscape(() => {
            //     this.isHideLandscapeComplete = true;
            //     this.gotoNextLandscape();
            // });

            // if (this.timelineUnfocus) this.timelineUnfocus.kill();
            // this.timelineFocus = new gsap.timeline();
            // this.timelineFocus.to(this.$el, 0.5, { alpha: 0, scale: 0.95, ease: 'sine.inOut' });
            // return this.timelineFocus;
        },

        unfocus() {
            const scene = this.$root.webglApp.getScene('home');
            if (!this.isHideLandscapeComplete) {
                // scene.cancelHideLandscape();
            }

            // if (this.timelineFocus) this.timelineFocus.kill();
            // this.timelineUnfocus = new gsap.timeline();
            // this.timelineUnfocus.to(this.$el, 0.4, { alpha: 1, scale: 1, ease: 'sine.inOut' });
            // return this.timelineUnfocus;
        },

        /**
         * Private
         */
        gotoNextLandscape() {
            const nextIndex = math.modulo(this.activeLandscapeIndex + 1, this.landscapes.length);
            this.activeLandscapeIndex = nextIndex;
            const scene = this.$root.webglApp.getScene('home');
            scene.showLandscape(this.activeLandscapeIndex);
            // this.$refs.navigationDots.goto(this.activeLandscapeIndex);
        },
    },
};
