// Vendor
import gsap from 'gsap';

// Utils
import ObjectPool from '@/utils/ObjectPool';
import Breakpoints from '@/utils/Breakpoints';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default {
    mounted() {
        this.objectPool = new ObjectPool(5, ProjectImage);
    },

    beforeDestroy() {},

    methods: {
        /**
         * Public
         */
        show() {
            gsap.to(this.$el, 0.5, { alpha: 1 });
        },

        hide() {
            gsap.to(this.$el, 0.5, { alpha: 0 });
        },

        updatePosition(position) {
            const transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${position.x},${position.y},0,1)`;
            this.transform(this.$el, transform);
        },

        updateImage(src, direction) {
            const currentSource = src;
            const currentDirection = direction;
            const currentPoolObject = this.objectPool.obtain();
            currentPoolObject.image.src = currentSource;

            this.$el.appendChild(currentPoolObject.element);

            this.transitionOut(currentDirection, this.currentPoolObject);
            this.currentPoolObject = currentPoolObject;
            this.transitionIn(currentDirection, currentPoolObject);
        },

        transitionOut(currentDirection, previousPoolObject) {
            if (!previousPoolObject) return;

            const timelineOut = new gsap.timeline({
                onComplete: () => {
                    this.objectPool.recycle(previousPoolObject);
                },
            });

            timelineOut.to(previousPoolObject.element, 0.5, { alpha: 0 }, 0);
        },

        transitionIn(currentDirection, currentPoolObject) {
            const timelineIn = new gsap.timeline({
                onComplete: () => {},
            });

            switch (currentDirection) {
                case -1:
                    timelineIn.set(currentPoolObject.element, { top: 'auto', bottom: 0 }, 0);
                    break;
                default:
                    timelineIn.set(currentPoolObject.element, { top: 0, bottom: 'auto' }, 0);
                    break;
            }

            const duration = 1;

            timelineIn.fromTo(currentPoolObject.element, duration, { height: '0%' }, { height: '100%', ease: 'power3.out' }, 0);
            timelineIn.fromTo(currentPoolObject.image, duration, { scale: 1, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: 'power3.out' }, 0);
        },

        /**
         * Privte
         */
        transform(el, transform) {
            el.style.transform = transform;
            el.style.webkitTransform = transform;
            el.style.mozTransform = transform;
        },
    },
};

/**
 * Object Pool Class
 */
class ProjectImage {
    constructor() {
        this._width = Breakpoints.reml(350);
        this._height = Breakpoints.reml(120 * 4);

        this._bindHandlers();

        this._setupEventListeners();

        this._element = this._createElement();
    }

    get element() {
        return this._element.element;
    }

    get image() {
        return this._element.image;
    }

    destroy() {
        this._removeEventListeners();
    }

    recycle() {
        this._element.image.style.opacity = 0;
        this._element.image.style.visibility = 'hidden';
        this._element.element.style.opacity = 1;
        this._element.image.src = 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="transparent"/></svg>';
    }

    _bindHandlers() {
        this._resizeHandler = this._resizeHandler.bind(this);
    }

    _setupEventListeners() {
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
    }

    _removeEventListeners() {
        WindowResizeObserver.removeEventListener('resize', this._resizeHandler);
    }

    _createElement() {
        const element = document.createElement('div');
        element.setAttribute('class', 'image-container');

        element.style.position = 'absolute';
        element.style.top = 0;
        element.style.left = 0;

        element.style.width = `100%`;
        element.style.height = `100%`;

        element.style.overflow = 'hidden';

        element.style.margin = 'auto';

        element.style.fontSize = 0;

        const image = document.createElement('img');
        image.style.opacity = 0;

        image.style.position = 'absolute';
        image.style.top = 0;
        image.style.left = 0;
        image.style.bottom = 0;
        image.style.right = 0;

        image.style.width = `${this._width}px`;
        image.style.height = `${this._height}px`;

        image.style.margin = 'auto';

        image.style.objectFit = 'cover';

        image.style.transform = 'scale(1.5)';
        image.style.webkitTransform = 'scale(1.5)';
        image.style.mozTransform = 'scale(1.5)';

        element.appendChild(image);
        return { element, image };
    }

    _resizeHandler() {
        this._width = Breakpoints.reml(350);
        this._height = Breakpoints.reml(120 * 4);
    }
}
