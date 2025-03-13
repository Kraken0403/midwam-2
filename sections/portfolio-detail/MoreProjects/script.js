// Vendor
import gsap from 'gsap';

// Utils
import lerp from '@/utils/math/lerp';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Components
import Section from '@/components/Section';
import ButtonPortfolio from '@/components/ButtonPortfolio';
import ButtonArrow from '@/components/ButtonArrow';
import MovingImage from '@/components/MovingImage';

export default {
    extends: Section,

    props: ['data'],

    mounted() {
        this.isActive = false;
        this.mousePosition = { x: 0, y: 0 };
        this.relativeMousePosition = { x: 0, y: 0 };
        this.absoluteMousePosition = { x: 0, y: 0 };

        this.position = {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
        };

        this.scrollPosition = 0;

        this.currentIndex = 0;

        this.getBounds();
        this.setupEventListeners();
        this.setupIntersectionObserver();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    components: {
        ButtonPortfolio,
        ButtonArrow,
        MovingImage,
    },

    methods: {
        show() {
            const timeline = new gsap.timeline();

            if (this.$refs.item) {
                timeline.to(this.$refs.item, 1, { alpha: 1, stagger: 0.1, ease: 'power1.inOut' });
                timeline.fromTo(this.$refs.item, 1, { y: '50%' }, { y: '0%', stagger: 0.1, ease: 'power2.Out' }, 0);
            }
            timeline.fromTo(this.$refs.button.$el, 1, { alpha: 0 }, { alpha: 1, ease: 'power1.inOut' }, 0.5);
        },

        /**
         * Private
         */
        getBounds() {
            this.bounds = this.$el.getBoundingClientRect();
            this.sectionScrollPosition = 0;

            this.$nextTick(() => {
                this.sectionScrollPosition = this.bounds.top + this.$root.scrollManager.position.y;
            });
        },

        updatePosition() {
            this.position.current.x = lerp(this.position.current.x, this.position.target.x, 0.05);
            this.position.current.y = lerp(this.position.current.y, this.position.target.y, 0.05);

            this.$refs.movingImage.updatePosition(this.position.current);
        },

        setupEventListeners() {
            this.$el.addEventListener('mousemove', this.mousemoveHandler);
            WindowResizeObserver.addEventListener('resize', this.resizeHandler);
            gsap.ticker.add(this.tickHandler);
        },

        removeEventListeners() {
            this.$el.removeEventListener('mousemove', this.mousemoveHandler);
            WindowResizeObserver.removeEventListener('resize', this.resizeHandler);
            gsap.ticker.remove(this.tickHandler);
        },

        setupIntersectionObserver() {
            this.intersectionObserver = new IntersectionObserver(
                (entries, obvserver) => {
                    entries.forEach((entry) => {
                        this.isActive = entry.isIntersecting;
                    });
                },
                {
                    threshold: 0,
                }
            );
            this.intersectionObserver.observe(this.$el);
        },

        /**
         * Handlers
         */
        mousemoveHandler(e) {
            const x = e.clientX;
            const y = e.clientY;

            this.absoluteMousePosition.x = x;
            this.absoluteMousePosition.y = y + this.scrollPosition;

            this.mousePosition.x = x;
            this.mousePosition.y = y;

            this.relativeMousePosition.x = this.mousePosition.x - this.bounds.width / 2;
            this.relativeMousePosition.y = this.absoluteMousePosition.y - this.sectionScrollPosition - this.bounds.height / 2;

            this.position.target.x = this.relativeMousePosition.x;
            this.position.target.y = this.relativeMousePosition.y;
        },

        mouseenterHandler(e) {
            const currentElement = e.currentTarget;
            const index = parseInt(currentElement.dataset.index);

            if (index === this.currentIndex) {
                this.$refs.movingImage.show();
            } else {
                const currentDirection = index > this.currentIndex ? 1 : -1;
                this.currentIndex = index;
                this.$refs.movingImage.updateImage(this.$refs.image[index].src, currentDirection);
                this.$refs.movingImage.show();
            }
        },

        mouseleaveHandler(e) {
            if (this.$refs.movingImage) {
                this.$refs.movingImage.hide();
            }
        },

        resizeHandler() {
            this.getBounds();
        },

        tickHandler() {
            if (!this.isActive) return;

            this.updatePosition();
            this.scrollPosition = this.$root.scrollManager ? this.$root.scrollManager.position.y : 0;
        },
    },
};
