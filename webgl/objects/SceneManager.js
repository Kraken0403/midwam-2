// Vendor
import gsap from 'gsap';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';

// Scenes
import scenesData from '@/webgl/configs/scenes';

export default class SceneManager extends component() {
    init({ scrollContainer, nuxtRoot, renderer, postProcessing, debug }) {
        // Props
        this._scrollContainer = scrollContainer;
        this._nuxtRoot = nuxtRoot;
        this._renderer = renderer;
        this._postProcessing = postProcessing;
        this._debug = debug;

        // Data
        this._active = null;
        this._debugGui = this._createDebugGui();
        this._scenes = this._createScenes();

        // Setup
        this._createSceneSelectionDebugGui();
    }

    destroy() {
        super.destroy();
        this._destroyScenes();
    }

    /**
     * Getters
     */
    get active() {
        return this._active;
    }

    get scenes() {
        return this._scenes;
    }

    /**
     * Public
     */
    get(scene) {
        return this._scenes[scene];
    }

    // show(scene) {
    //     // this.hide();

    //     const timeline = new gsap.timeline();
    //     timeline.add(this._scenes[scene].show(), 0);
    //     timeline.call(
    //         () => {
    //             this._active = this._scenes[scene];
    //         },
    //         null,
    //         0
    //     );
    //     return timeline;
    // }
    
    show(scene) {
        // ✅ Immediately set active before any animations
        this._active = this._scenes[scene];
      
        const timeline = new gsap.timeline();
        timeline.add(this._active.show(), 0); // Show animation still works
      
        return timeline;
      }

    hide(scene) {
        if (scene) {
            return this._scenes[scene].hide(() => {
                this._active = null;
            });
        } else if (this._active) {
            return this._active.hide(() => {
                this._active = null;
            });
        }
        return false;
    }

    focus(sectionIndex) {
        if (this._active && typeof this._active.focus === 'function') {
            this._active.focus(sectionIndex);
        }
    }

    unfocus() {
        if (this._active && typeof this._active.unfocus === 'function') {
            this._active.unfocus();
        }
    }

    /**
     * Private
     */
    _createScenes() {
        const scenes = {};
        let scene;
        for (const key in scenesData) {
            scene = scenesData[key];
            scenes[key] = new scene.class({
                scrollContainer: this._scrollContainer,
                nuxtRoot: this._nuxtRoot,
                renderer: this._renderer,
                postProcessing: this._postProcessing,
                debug: this._debug,
            });
            scenes[key].name = key;
        }
        return scenes;
    }

    _destroyScenes() {
        for (const key in this._scenes) {
            if (this._scenes[key].destroy) {
                this._scenes[key].destroy();
            }
        }
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const webglFolder = Debugger.gui.getFolder('Background');
        const debugGui = webglFolder.addFolder('Scene manager');
        debugGui.open();

        return debugGui;
    }

    _createSceneSelectionDebugGui() {
        if (!this._debugGui) return;

        const props = {
            active: null,
        };

        const scenes = Object.keys(this._scenes);
        this._debugGui.add(props, 'active', scenes).onChange(() => {
            this.show(props.active);
        });
    }
}
