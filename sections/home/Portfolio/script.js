// Vendor
import gsap from 'gsap';

// Compontents
import ButtonArrow from '@/components/ButtonArrow';
import ButtonPortfolio from '@/components/ButtonPortfolio';
import Heading from '@/components/Heading';
import MovingImage from '@/components/MovingImage';

// Utils
import lerp from '@/utils/math/lerp';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    props: ['data', 'scrollType'],

    components: {
        ButtonArrow,
        ButtonPortfolio,
        Heading,
        MovingImage,
    },

    mounted() {
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
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Private
         */
        getBounds() {
            this.bounds = this.$el.getBoundingClientRect();
            this.sectionScrollPosition = 0;

            this.$nextTick(() => {
                this.sectionScrollPosition = this.bounds.top + this.$root.scrollControl.position.y;
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
            this.scrollPosition = this.$root.scrollControl ? this.$root.scrollControl.position.y : 0;
            this.updatePosition();
        },

        /**
         * Analytics
         */
        allProjectsClickHanlder() {
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click all projects on footer home',
            });
        },

        projectClickHandler() {
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click project on footer home',
            });
        },
    },
};
