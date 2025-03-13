// Utils
import EventDispatcher from '@/utils/EventDispatcher';
import SmoothScroll from '@/utils/SmoothScroll';
import ScrollLock from '@/utils/ScrollLock';

// Constants
export const TYPE_NATIVE = 'NATIVE';
export const TYPE_SMOOTH = 'SMOOTH';

export default class ScrollManager extends EventDispatcher {
    constructor() {
        super();

        this._setType(TYPE_NATIVE);
        this._bindHandlers();
        this._setupEventListeners();
    }

    destroy() {
        this._removeEventListeners();
        if (this._scrollLock) this._scrollLock.destroy();
        if (this._smoothScroll) this._smoothScroll.destroy();
    }

    /**
     * Getters & Setters
     */
    get position() {
        return this._getPosition();
    }

    get smoothScroll() {
        if (!this._smoothScroll) {
            console.warn('Smoothscroll is not enabled');
            return;
        }

        return this._smoothScroll;
    }

    get type() {
        return this._type;
    }

    /**
     * Public
     */
    setupScrollLock({ container, content }) {
        this._scrollLock = new ScrollLock({ container, content });
    }

    setupSmoothScroll({ container, content }) {
        this._smoothScroll = new SmoothScroll({ container, content });

        this._setType(TYPE_SMOOTH);

        window.removeEventListener('scroll', this._scrollHandler);
        this._smoothScroll.addEventListener('scroll', this._scrollHandler);
    }

    lockScroll() {
        if (!this._scrollLock) {
            console.warn('ScrollLock is not enabled');
            return;
        }

        const position = this._getPosition();
        if (this._smoothScroll) this._smoothScroll.disable();
        this._scrollLock.activate(position);
    }

    unlockScroll() {
        if (!this._scrollLock) {
            console.warn('ScrollLock is not enabled');
            return;
        }

        const position = this._scrollLock.deactivate();
        if (this._smoothScroll) {
            this._smoothScroll.enable();
            this._smoothScroll.update();
        }
        this._setScrollPosition(position);
    }

    scrollTo({ x = 0, y = 0 }) {
        if (this._isSmoothScrollEnabled()) {
            this._smoothScroll.scrollTo({ x, y });
        } else {
            window.scrollTo(x, y);
        }
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._scrollHandler = this._scrollHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('scroll', this._scrollHandler);
    }

    _removeEventListeners() {
        if (this._isSmoothScrollEnabled()) {
            this._smoothScroll.removeEventListener('scroll', this._scrollHandler);
        } else {
            window.removeEventListener('scroll', this._scrollHandler);
        }
    }

    _setType(type) {
        this._type = type;
    }

    _getNativeScrollPosition() {
        return {
            x: document.body.scrollLeft || document.documentElement.scrollLeft,
            y: document.body.scrollTop || document.documentElement.scrollTop,
        };
    }

    _getPosition() {
        if (this._isSmoothScrollEnabled()) {
            return this._smoothScroll.position;
        } else {
            return this._getNativeScrollPosition();
        }
    }

    _isSmoothScrollEnabled() {
        return this._type === TYPE_SMOOTH;
    }

    _setScrollPosition({ x = 0, y = 0 }) {
        document.body.scrollLeft = document.documentElement.scrollLeft = x;
        document.body.scrollTop = document.documentElement.scrollTop = y;
    }

    /**
     * Handlers
     */
    _scrollHandler() {
        this.dispatchEvent('scroll', this._getPosition());
    }
}
