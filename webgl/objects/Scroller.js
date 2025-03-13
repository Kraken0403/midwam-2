// Vendor
import bidello, { component } from '@/vendor/bidello';
import normalizeWheel from 'normalize-wheel';

// Utils
import math from '@/utils/math';
import Debugger from '@/utils/Debugger';

// Constants
const MAX_STEPS = 6;

class Scroller extends component() {
    init() {
        // Data
        this._currentStepIndex = 0;
        this._isEnabled = true;
        this._isAnimating = false;
        this._debugGui = this._createDebugGui();

        // Setup
        this._bindHandlers();
        this._setupEventListeners();
    }

    destroy() {
        super.destroy();
        this._removeEventListeners();
    }

    /**
     * Getters & Setters
     */
    get index() {
        return this._currentStepIndex;
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._wheelEventHandler = this._wheelEventHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('wheel', this._wheelEventHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('wheel', this._wheelEventHandler);
    }

    _nextStep() {
        this._goto(this._currentStepIndex + 1);
    }

    _previousStep() {
        this._goto(this._currentStepIndex - 1);
    }

    _goto(index, force = false) {
        if (this._isAnimating && !force) return;

        const newIndex = math.clamp(index, 0, MAX_STEPS);
        const direction = newIndex > this._currentStepIndex || force ? 1 : -1;

        if (newIndex !== this._currentStepIndex) {
            this._isAnimating = true;
            this._currentStepIndex = newIndex;

            bidello.trigger(
                {
                    name: 'scroll',
                },
                {
                    index: this._currentStepIndex,
                    direction,
                    done: () => {
                        this._isAnimating = false;
                    },
                }
            );
        }
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const params = {
            step: 1,
        };

        const steps = [];
        for (let i = 1; i < MAX_STEPS + 1; i++) {
            steps.push(i);
        }

        const folder = gui.addFolder('Scroller');
        folder.add(this, '_previousStep').name('previous');
        folder.add(this, '_nextStep').name('next');
        folder.add(params, 'step', steps).onChange(() => {
            this._goto(params.step, true);
        });
        folder.open();

        return gui;
    }

    /**
     * Handlers
     */
    _wheelEventHandler(e) {
        if (!this._isEnabled) return;

        const normalized = normalizeWheel(e);
        if (normalized.pixelY > 0) {
            this._nextStep();
        } else {
            this._previousStep();
        }
    }
}

export default new Scroller();
