const dat = process.client ? require('dat.gui') : null;

const DEBUG_PARAM = 'debug';
const WIDTH = 330;

class Debugger {
    constructor() {
        if (!dat) return;

        this._isVisible = null;
        this._gui = this._setupGui();

        this._extendGui();
        this._bindHandlers();
        this._setupEventListeners();
        this._show();
    }

    destroy() {
        this._removeEventListeners();
    }

    /**
     * Getters & Setters
     */
    get gui() {
        return this._gui;
    }

    /**
     * Public
     */
    setup() {
        this._gui = this._setupGui(true);
        this._extendGui();
        this._show();
    }

    show() {
        this._show();
    }

    hide() {
        this._hide();
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._windowKeyUpHandler = this._windowKeyUpHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('keyup', this._windowKeyUpHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('keyup', this._windowKeyUpHandler);
    }

    _getDebugUrlParam() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(DEBUG_PARAM);
    }

    _setupGui(force = false) {
        return this._getDebugUrlParam() !== null || force ? new dat.GUI({ width: WIDTH }) : null;
    }

    _extendGui() {
        if (!this._gui) return;

        dat.GUI.prototype.getFolder = function (name) {
            let result;

            function search(folders) {
                for (const key in folders) {
                    if (key === name) {
                        result = folders[key];
                        return;
                    } else if (folders[key].__folders) {
                        search(folders[key].__folders);
                    }
                }
            }
            search(this.__folders);

            return result;
        };

        dat.GUI.prototype.updateTitleBackgroundColor = function (color) {
            const title = this.domElement.querySelector('.title');
            title.style.backgroundColor = color;
        };
    }

    _show() {
        this._isVisible = true;
        if (this._gui) {
            this._gui.domElement.style.display = 'block';
            this._gui.domElement.parentElement.style.zIndex = 1000;
        }
    }

    _hide() {
        this._isVisible = false;
        if (this._gui) this._gui.domElement.style.display = 'none';
    }

    _toggle() {
        this._isVisible ? this._hide() : this._show();
    }

    /**
     * Handlers
     */
    _windowKeyUpHandler(e) {
        if (e.key === '`') this._toggle();
    }
}

export default new Debugger();
