// Vendor
import SectionAbout from '@/components/SectionAbout';
import gsap from 'gsap';


export default {
  name: 'SectionProcessStep2', // 👈 required for dynamic method matching
  extends: SectionAbout,

  methods: {
    backgroundShow(done, direction) {
      // No DOM animation for now, just resolve the timeline
      const tl = new gsap.timeline({ onComplete: done });
      return tl;
    }
  }
};
