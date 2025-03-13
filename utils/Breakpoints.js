// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';

class Breakpoints {
    constructor() {
        if (!process.client) return;

        this._active = null;
        this._bindHandlers();
        this._setupEventListeners();
        this._resize();
    }

    destroy() {
        this._removeEventListeners();
    }

    /**
     * Getters
     */
    get current() {
        return this._active;
    }

    /**
     * Public
     */
    active() {
        for (let i = 0, len = arguments.length; i < len; i++) {
            if (arguments[i] === this._active) return true;
        }
        return false;
    }

    /**
     * Fetch CSS Variables
     */
    _getCSSVariable(variableName) {
        return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(variableName).trim());
    }

    rem(value) {
        const viewportWidthSmall = this._getCSSVariable('--viewport-width-small');
        const fontSizeSmall = this._getCSSVariable('--font-size-small');
        const fontSizeMedium = this._getCSSVariable('--font-size-medium');

        const fontSize = parseFloat(this._active === 'medium' ? fontSizeMedium : fontSizeSmall);
        return (value / (viewportWidthSmall / 100) / 100) * fontSize * WindowResizeObserver.width;
    }

    reml(value) {
        const viewportWidthLarge = this._getCSSVariable('--viewport-width-large');
        const fontSizeLarge = this._getCSSVariable('--font-size-large');

        return (value / (viewportWidthLarge / 100) / 100) * fontSizeLarge * WindowResizeObserver.width;
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

    _getNameFromDocumentElement() {
        const before = window.getComputedStyle(document.documentElement, ':before');
        return before.content.replace(/"/g, '');
    }

    /**
     * Resize
     */
    _resize() {
        this._active = this._getNameFromDocumentElement();
    }

    /**
     * Handlers
     */
    _resizeHandler() {
        this._resize();
    }
}

export default new Breakpoints();
