import sample from '@/assets/images/services/interactive.PNG';
import sample2 from '@/assets/images/services/concept-design.png';

import Heading from '@/components/Heading';
import gsap from 'gsap';

export default {
  name: 'SectionServicesCards',
  
  components: {
    Heading,
  },

  data() {
    return {
      slides: [
        { title: 'Interactive', image: sample },
        { title: 'Concept Design', image: sample2 },
      ]
    };
  },

  mounted() {
    this._setupIntersectionObserver();
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._io.disconnect(); // Run once
          this.backgroundShow(() => {}, 1);
        }
      }, { threshold: 0.25 });
  
      this._io.observe(this.$el);
    }
    ,
    backgroundShow(done, direction) {
      const tl = gsap.timeline({ onComplete: done });
      if (this.$refs.heading?.show) {
        tl.add(this.$refs.heading.show(), 0);
      }
      return tl;
    },

    backgroundHide(done) {
      const tl = gsap.timeline({ onComplete: done });
      if (this.$refs.heading?.hide) {
        tl.add(this.$refs.heading.hide(), 0);
      }
      return tl;
    }
  }
};
