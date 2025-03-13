// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

export default class ScrollLock {
    constructor(options = {}) {
        this._container = options.container;
        this._content = options.content;

        this._isActive = false;
        this._scrollOffsetY = 0;
        this._containerHeight = 0;
        this._position = { x: 0, y: 0 };

        this._bindHandlers();
        this._setupEventListeners();
    }

    destroy() {
        this._removeEventListeners();
    }

    /**
     * Public
     */
    activate(position) {
        this._isActive = true;
        this._position = position;

        this._setContainerHeight(WindowResizeObserver.viewportHeight); // TODO: force refetch dimensions
        this._container.style.overflow = 'hidden';
        this._container.style.position = 'fixed';

        this._content.style.transform = this._content.style.webkitTransform = `translateY(${-this._position.y}px)`;
    }

    deactivate() {
        this._content.style.height = 'auto';
        this._content.style.transform = 'translateY(0px)';

        this._container.style.height = 'auto';
        this._container.style.overflow = 'visible';
        this._container.style.position = 'static';

        this._isActive = false;

        return this._position;
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._resizeHandler = this._resizeHandler.bind(this);
    }

    _setupEventListeners() {
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
    }

    _removeEventListeners() {
        WindowResizeObserver.removeEventListener('resize', this._resizeHandler);
    }

    _setContainerHeight(height) {
        this._container.style.height = `${height}px`;
    }

    _resize() {
        if (this._isActive) this._setContainerHeight(WindowResizeObserver.viewportHeight);
    }

    /**
     * Handlers
     */
    _resizeHandler() {
        this._resize();
    }

    _touchMoveHandler(e) {
        e.preventDefault();
    }
}
