// Vendor
import gsap from 'gsap';

// Components
import ContactForm from '@/components/ContactForm';
import Heading from '@/components/Heading';

export default {
  name: 'SectionFormCta',

  components: {
    ContactForm,
    Heading
  },

  mounted() {
    this._setupIntersectionObserver();
  },

  beforeDestroy() {
    this._removeEventListeners();
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this._io.disconnect();
            this.backgroundShow(() => {}, 1); // direction = 1
          }
        },
        { threshold: 0.25 }
      );
      this._io.observe(this.$el);
    },

    backgroundShow(done, direction) {
      if (this.timelineHide) this.timelineHide.kill();

      const delay = direction > 0 ? 0.6 : 0.8;
      this.timelineShow = gsap.timeline({ delay, onComplete: done });

      // Ensure the section is visible
      this.timelineShow.set(this.$el, { autoAlpha: 1 }, 0);

      // Animate heading if available
      if (this.$refs.heading?.show) {
        this.timelineShow.add(this.$refs.heading.show(), 0);
      }

      return this.timelineShow;
    },

    backgroundHide(done, direction) {
      if (this.timelineShow) this.timelineShow.kill();

      const delay = direction > 0 ? 0 : 0;
      this.timelineHide = gsap.timeline({ delay, onComplete: done });

      this.timelineHide.to(this.$el, { autoAlpha: 0, duration: 0.5 }, 0.4);

      // Hide heading if it has a hide method
      if (this.$refs.heading?.hide) {
        this.$refs.heading.hide();
      }

      return this.timelineHide;
    },

    _removeEventListeners() {
      // No events to remove currently
    },
  }
};
