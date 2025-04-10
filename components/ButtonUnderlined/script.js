// Vendor
import gsap from 'gsap';

export default {
  name: 'ButtonUnderlined',
  
  // Define props using an object so you can set a default
  props: {
    link: {
      type: String,
      default: ''  // If not provided, it'll be an empty string
    }
  },

  data() {
    return {
      state: '',
    };
  },

  computed: {
    // Update the computed property to default to "/" (homepage) if link is not provided or is empty.
    to() {
      // If there's no valid link, default to homepage. If you prefer "#", replace '/' with '#'
      if (!this.link || this.link.trim() === '') {
        return '/';
      }
      return `${this.$i18n.locale}/${this.link}`;
    },

    isMailto() {
      return this.link.indexOf('mailto') > -1;
    },
  },

  mounted() {
    this.allowHover = true;
  },

  methods: {
    /**
     * Public
     */
    show() {
      const timeline = new gsap.timeline();
      timeline.fromTo(this.$el, 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'sine.inOut' }, 0);
      timeline.fromTo(this.$el, 2, { y: '70%' }, { y: '0%', ease: 'power3.out' }, 0);
      return timeline;
    },

    /**
     * Private
     */
    hoverIn() {
      if (this.hoverOutTimeline) this.hoverOutTimeline.kill();

      this.hoverInTimeline = new gsap.timeline();

      const duration = 0.6;
      const stagger = 0.08;

      this.hoverInTimeline.set(this.$refs.underline, { transformOrigin: 'right top' });
      this.hoverInTimeline.set(this.$refs.line, { transformOrigin: 'left top' });

      this.hoverInTimeline.to(this.$refs.underline, duration, { scaleX: 0, ease: 'power1.inOut' });
      this.hoverInTimeline.to(this.$refs.line, duration, { scaleX: 1, stagger, ease: 'power1.out' }, stagger + duration * 0.3);

      this.hoverInTimeline.call(this.setActiveState, null, 0);
      this.hoverInTimeline.call(this.hoverInCompleteHandler, null);
    },

    hoverOut() {
      if (this.hoverInTimeline) this.hoverInTimeline.kill();

      this.hoverOutTimeline = new gsap.timeline();

      const duration = 0.5;
      const stagger = 0.06;

      this.hoverOutTimeline.set(this.$refs.underline, { transformOrigin: 'left top' });
      this.hoverOutTimeline.set(this.$refs.line, { transformOrigin: 'right top' });

      this.hoverOutTimeline.to(this.$refs.line, duration, { scaleX: 0, stagger: -stagger, ease: 'power1.inOut' }, 0);
      this.hoverOutTimeline.to(this.$refs.underline, duration, { scaleX: 1, ease: 'power1.inOut' }, stagger * 3 + duration * 0.55);

      this.hoverOutTimeline.call(this.resetActiveState, null, 0);
      this.hoverOutTimeline.call(this.hoverOutCompleteHandler, null);
    },

    setActiveState() {
      this.state = 'hover';
    },

    resetActiveState() {
      this.state = '';
    },

    /**
     * Handlers
     */
    mouseenterHandler() {
      this.mouseOver = true;

      if (!this.allowHover) return;
      this.allowHover = false;
      this.hoverIn();
    },

    mouseleaveHandler() {
      this.mouseOver = false;

      if (!this.allowHover) return;
      this.allowHover = false;
      this.hoverOut();
    },

    hoverInCompleteHandler() {
      this.allowHover = true;

      if (!this.mouseOver) {
        this.allowHover = false;
        this.hoverOut();
      }
    },

    hoverOutCompleteHandler() {
      this.allowHover = true;

      if (this.mouseOver) {
        this.allowHover = false;
        this.hoverIn();
      }
    },
  },
};
