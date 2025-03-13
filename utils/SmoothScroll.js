// Vendor
import gsap from 'gsap';

// Utils
import EventDispatcher from '@/utils/EventDispatcher';
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import Debugger from '@/utils/Debugger';
import math from '@/utils/math';

export default class SmoothScroll extends EventDispatcher {
    constructor({ container, content }) {
        super();

        if (!process.client) return;

        this._container = container;
        this._content = content;

        this._isDisabled = false;
        this._damping = 0.07;
        this._scrollPosition = { x: 0, y: 0 };
        this._position = { x: 0, y: 0, deltaX: 0, deltaY: 0 };

        this._bindHandlers();
        this._setupEventListeners();
        this._setContentFixed();
        this._resize();
        this._setupDebugGui();
    }

    destroy() {
        this._removeEventListeners();
        this._removeDebugGui();
    }

    /**
     * Getters & Setters
     */
    get position() {
        return this._position;
    }

    /**
     * Public
     */
    update() {
        this._resize();
    }

    enable() {
        this._isDisabled = false;
    }

    disable() {
        this._isDisabled = true;
    }

    scrollTo({ x, y }) {
        if (x !== undefined) this._position.x = x;
        if (y !== undefined) this._position.y = y;
        this._scrollPosition.x = this._position.x;
        this._scrollPosition.y = this._position.y;
        this._updatePosition();
        window.scrollTo(this._position.x, this._position.y);
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._tickHandler = this._tickHandler.bind(this);
        this._resizeHandler = this._resizeHandler.bind(this);
        this._scrollHandler = this._scrollHandler.bind(this);
    }

    _setupEventListeners() {
        gsap.ticker.add(this._tickHandler);
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
        window.addEventListener('scroll', this._scrollHandler);
    }

    _removeEventListeners() {
        gsap.ticker.remove(this._tickHandler);
        WindowResizeObserver.removeEventListener('resize', this._resizeHandler);
        window.removeEventListener('scroll', this._scrollHandler);
    }

    _updateScrollPosition() {
        if (this._isDisabled) return;

        const x = document.body.scrollLeft || document.documentElement.scrollLeft;
        const y = document.body.scrollTop || document.documentElement.scrollTop;

        this._scrollPosition.x = x;
        this._scrollPosition.y = math.clamp(y, 0, this._contentHeight - this._viewportHeight);
    }

    _setContentFixed() {
        this._content.style.position = 'fixed';
    }

    _update() {
        if (this._isDisabled) return;

        this._updatePosition();
        this._updateTransform();

        if (Math.round(this._position.x) !== this._scrollPosition.x || Math.round(this._position.y) !== this._scrollPosition.y) {
            this.dispatchEvent('scroll', this._position);
        }
    }

    _updatePosition() {
        const previousPositionX = this._position.x;
        const previousPositionY = this._position.y;
        this._position.x = Math.round(math.lerp(this._position.x, this._scrollPosition.x, this._damping) * 100) / 100;
        this._position.y = Math.round(math.lerp(this._position.y, this._scrollPosition.y, this._damping) * 100) / 100;
        this._position.deltaX = previousPositionX - this._position.x;
        this._position.deltaY = previousPositionY - this._position.y;
    }

    _updateTransform() {
        this._content.style.transform = `translate(${-this._position.x}px, ${-this._position.y}px)`;
    }

    /**
     * Resize
     */
    _resize() {
        this._viewportHeight = WindowResizeObserver.height;
        this._contentHeight = this._content.offsetHeight;
        this._resizeContainer();
    }

    _resizeContainer() {
        this._container.style.height = `${this._contentHeight}px`;
    }

    /**
     * Debug
     */
    _setupDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        this.debugGui = gui.addFolder('Smooth scroll');
        this.debugGui.add(this, '_damping', 0, 1, 0.001).name('damping');
    }

    _removeDebugGui() {
        if (this.debugGui) Debugger.gui.removeFolder(this.debugGui);
    }

    /**
     * Handlers
     */
    _tickHandler() {
        this._update();
    }

    _resizeHandler() {
        this._resize();
    }

    _scrollHandler() {
        this._updateScrollPosition();
    }
}
