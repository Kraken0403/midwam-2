import mdl from '@/assets/images/portfolio-detail/MDL.jpg';
import albont from '@/assets/images/portfolio-detail/albont.jpg';
import ithra from '@/assets/images/portfolio-detail/ithra.jpg';
import masar from '@/assets/images/portfolio-detail/Masar_XP.jpg';
import mayadeen from '@/assets/images/portfolio-detail/Mayadeen.jpg';
import music from '@/assets/images/portfolio-detail/Music_XP.jpg';

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
        { title: 'MDL', image: mdl },
        { title: 'Albont', image: albont },
        { title: 'Ithra', image: ithra },
        { title: 'Masar XP', image: masar },
        { title: 'Mayadeen', image: mayadeen },
        { title: 'Music', image: music },
      ],
      state: {
        current: 0,
        target: 0,
        currentIndex: 0,
        slideWidth: 0,
        isDragging: false,
        startX: 0,
        wrapper: null,
        container: null,
        animationFrame: null,
      }
    };
  },

  mounted() {
    this._setupIntersectionObserver();
    this.$nextTick(() => {
      this._initCenteredSlider();
    });
  },

  methods: {
    _setupIntersectionObserver() {
      this._io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._io.disconnect();
          this.backgroundShow(() => {}, 1);
        }
      }, { threshold: 0.35 });

      this._io.observe(this.$el);
    },

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
    },

    _initCenteredSlider() {
      const wrapper = this.$el.querySelector('.swiper-wrapper');
      const container = this.$el.querySelector('.swiper-container');
      const slides = this.$el.querySelectorAll('.swiper-slide');

      const slideWidth = slides[0].offsetWidth + 20; // assuming margin-right: 20px

      Object.assign(this.state, {
        wrapper,
        container,
        slideWidth
      });

      this._centerSlide(this.state.currentIndex);

      const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

      const render = () => {
        this.state.current = lerp(this.state.current, this.state.target, 0.4);
        wrapper.style.transform = `translateX(${-this.state.current}px)`;
        this.state.animationFrame = requestAnimationFrame(render);
      };
      render();

      // Dragging
      container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.state.isDragging = true;
        this.state.startX = e.clientX;
        container.classList.add('grabbing');
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.state.isDragging) return;
        const delta = e.clientX - this.state.startX;
        this.state.startX = e.clientX;
        this.state.target -= delta;
      });

      window.addEventListener('mouseup', () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        container.classList.remove('grabbing');
        this._centerNearestSlide();
      });

      window.addEventListener('mouseleave', () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        container.classList.remove('grabbing');
        this._centerNearestSlide();
      });

      // Touch support
      container.addEventListener('touchstart', (e) => {
        this.state.isDragging = true;
        this.state.startX = e.touches[0].clientX;
      });

      window.addEventListener('touchmove', (e) => {
        if (!this.state.isDragging) return;
        const delta = e.touches[0].clientX - this.state.startX;
        this.state.startX = e.touches[0].clientX;
        this.state.target -= delta;
      });

      window.addEventListener('touchend', () => {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;
        this._centerNearestSlide();
      });

      // Arrows
      this.$el.querySelector('.swiper-button-next').addEventListener('click', () => {
        this.state.currentIndex = Math.min(this.slides.length - 2, this.state.currentIndex + 1);
        this._centerSlide(this.state.currentIndex);
      });

      this.$el.querySelector('.swiper-button-prev').addEventListener('click', () => {
        this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
        this._centerSlide(this.state.currentIndex);
      });
    },

    _centerSlide(index) {
      const containerCenter = this.state.container.offsetWidth / 2;
      const groupWidth = this.state.slideWidth * 2;
      const offset = index * this.state.slideWidth;
      this.state.target = offset - containerCenter + groupWidth / 2;

      const slides = this.state.wrapper.querySelectorAll('.swiper-slide');
      slides.forEach((el, i) => {
        el.classList.toggle('active', i === index || i === index + 1);
      });
    },

    _centerNearestSlide() {
      const containerCenter = this.state.container.offsetWidth / 2;
      const estimatedIndex = Math.round((this.state.current + containerCenter - this.state.slideWidth) / this.state.slideWidth);
      this.state.currentIndex = Math.max(0, Math.min(this.slides.length - 2, estimatedIndex));
      this._centerSlide(this.state.currentIndex);
    }
  }
};
