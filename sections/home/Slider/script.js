import sample from '@/assets/images/portfolio-detail/image2.png';
import sample2 from '@/assets/images/portfolio-detail/image3.png';
import sample3 from '@/assets/images/portfolio-detail/image4.png';
import Heading from '@/components/Heading';
import gsap from 'gsap';

export default {
  name: 'SectionSlider',
  
  components: {
    Heading,
  },

  data() {
    return {
      slides: [
        { title: 'Slide 1', image: sample },
        { title: 'Slide 2', image: sample2 },
        { title: 'Slide 3', image: sample3 },
        { title: 'Slide 4', image: sample2 },
      ]
    };
  },

  mounted() {
    this._setupIntersectionObserver();
    this.$nextTick(() => {
      new window.Swiper('.my-swiper', {
        loop: true,
        slidesPerView: 1.5,
        centeredSlides: true,
        spaceBetween: 30,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        observer: true,
        observeParents: true,
        breakpoints: {
          768: {
            slidesPerView: 1.2
          },
          1024: {
            slidesPerView: 1.5
          }
        }
      });
    });
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
