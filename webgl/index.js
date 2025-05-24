// Vendor
import gsap from 'gsap';
import { WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, Clock, NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping } from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';
import scenes from '@/webgl/configs/scenes'

import bidello, { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import device from '@/utils/device';
import WindowResizeObserver from '@/utils/WindowResizeObserver';

// Objects
import PostProcessing from '@/webgl/objects/PostProcessing';
import SceneManager from '@/webgl/objects/SceneManager';
import EnvironmentMap from '@/webgl/objects/EnvironmentMap';

export default class Main extends component() {
    init({ canvas, scrollContainer, nuxtRoot, debug }) {
        // Props
        this._canvas = canvas;
        this._scrollContainer = scrollContainer;
        this._nuxtRoot = nuxtRoot;
        this._debug = debug;

        if (!process.client) {
            return;
        }

        // Data
        this._width = null;
        this._height = null;
        this._isActive = true;
        this._clock = new Clock();
        this._debugGui = this._createDebugGui();
        this._renderer = this._createRenderer();
        EnvironmentMap.generate(this._renderer);
        this._postProcessing = this._createPostProcessing();
        this._sceneManager = this._createSceneManager();
        this._postProcessing.setup();

        // Setup
        this._bindHandlers();
        this._setupEventListeners();
        this._resize();
        this._prepareScenes();
        this._updateDebugGui();

        if (this._debug) this._sceneManager.show('home');
        const routeName = this._nuxtRoot?.$route?.name || '';
            if (routeName.includes('home')) {
                this._sceneManager.show('home');
            }

        // setTimeout(() => {
        //     this.goto(6, 1, null);
        // }, 500);
    }

    destroy() {
        super.destroy();
        this._removeEventListeners();
        this._removeDebugGui();
        this._sceneManager.destroy();
    }

    /**
     * Public
     */
    show() {
        this._isActive = true;
        return gsap.to(this._canvas, 0.5, { alpha: 1, ease: 'sine.inOut' });
    }

    hide() {
        this._isActive = false;
        return gsap.to(this._canvas, 0.8, { alpha: 0, ease: 'sine.inOut' });
    }

    getScene(scene) {
        return this._sceneManager.get(scene);
    }

    showScene(scene) {
        const timeline = new gsap.timeline();
        timeline.call(
            () => {
                this._postProcessing.resetDefaults();
                this._sceneManager.show(scene);
            },
            null,
            0
        );
        return timeline;
    }

    hideScene(sceneName) {
        const scene = sceneName ? this._sceneManager.get(sceneName) : this._sceneManager.active;
        const timeline = gsap.timeline();
      
        if (scene && scene.hide) {
          timeline.add(scene.hide(() => {
            // 🧼 Clean postprocessing right after fade
            this._postProcessing.resetDefaults();
            this._renderer.setClearColor(0x000000, 0);
            this._renderer.clear(true, true, true);
            this._renderer.autoClearColor = true;
          }), 0);
        }
      
        return timeline;
      }
      

    focus(sectionIndex) {
        // this._sceneManager.focus(sectionIndex);
    }

    unfocus() {
        // this._sceneManager.unfocus();
    }

    goto(index, direction, done) {
        if (this._sceneManager.active.name === 'home') {
            this._sceneManager.active.goto(index, direction, done);
        }

        if (this._sceneManager.active.name === 'about') {
            this._sceneManager.active.goto(index, direction, done);
            console.log('about')
        }

        // if (this._sceneManager.active.name === 'services') {
        //     this._sceneManager.active.goto(index, direction, done);
        //     console.log('services')
        // }
    }

    /**
     * Private
     */
    _bindHandlers() {
        this._resizeHandler = this._resizeHandler.bind(this);
        this._tickHandler = this._tickHandler.bind(this);
    }

    _setupEventListeners() {
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
        gsap.ticker.add(this._tickHandler);
    }

    _removeEventListeners() {
        WindowResizeObserver.removeEventListener('resize', this._resizeHandler);
        gsap.ticker.remove(this._tickHandler);
    }

    _createRenderer() {
        const renderer = new WebGLRenderer({
            antialias: false,
            canvas: this._canvas,
            // logarithmicDepthBuffer: true,
        });

        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2;
        renderer.outputEncoding = sRGBEncoding;
        renderer.setClearColor('#0f0d10', 1.0);
        renderer.autoClear = false;
        return renderer;
    }

    _createSceneManager() {
        const sceneManager = new SceneManager({
            scrollContainer: this._scrollContainer,
            nuxtRoot: this._nuxtRoot,
            renderer: this._renderer,
            postProcessing: this._postProcessing,
            debug: this._debug,
            // scenes
        });
        return sceneManager;
    }

    _createPostProcessing() {
        const postProcessing = new PostProcessing({
            renderer: this._renderer,
        });
        return postProcessing;
    }

    _prepareScenes() {
        let item;
        for (const key in this._sceneManager.scenes) {
            item = this._sceneManager.scenes[key];
            this._postProcessing.render(item, item.camera);
        }
    }

    /**
     * Update cycle
     */
    _update() {
        if (!this._isActive) return;

        const delta = this._clock.getDelta();
        const time = this._clock.getElapsedTime();

        bidello.trigger(
            {
                name: 'update',
                fireAtStart: false,
            },
            { delta, time }
        );

        this._render();
    }

    // _render() {
    //     const scene = this._sceneManager.active;
    //     // if (scene) this._renderer.render(scene, scene.camera);
    //     if (scene) this._postProcessing.render(scene, scene.camera);
    // }

    _render() {
        const scene = this._sceneManager.active;
      
        if (scene && scene.camera) {
          // ✅ For 'services', skip postprocessing and render directly
          if (scene.name === 'service') {
            // this._renderer.render(scene, scene.camera);
            this._postProcessing.render(scene, scene.camera);

          } else {
            this._postProcessing.render(scene, scene.camera);
          }
        }
      }
  

    /**
     * Resize
     */
    _resize() {
        this._dpr = !WEBGL.isWebGL2Available() && device.dpr() > 1.5 ? 2 : 1;

        this._width = WindowResizeObserver.viewportWidth;
        this._height = WindowResizeObserver.height;

        bidello.trigger(
            {
                name: 'resize',
                fireAtStart: true,
            },
            {
                width: this._width * this._dpr,
                height: this._height * this._dpr,
                dpr: this._dpr,
            }
        );

        this._resizeRenderer();
    }

    _resizeRenderer() {
        this._renderer.setPixelRatio(this._dpr);
        this._renderer.setSize(this._width, this._height, true);
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const folder = gui.addFolder('Background');
        folder.open();

        return folder;
    }

    _updateDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const params = {
            toneMapping: this._renderer.toneMapping,
            clearColor: this._renderer.getClearColor().getHex(),
        };

        const toneMaps = {
            NoToneMapping,
            LinearToneMapping,
            ReinhardToneMapping,
            CineonToneMapping,
            ACESFilmicToneMapping,
        };

        // Renderer
        const folderBackground = gui.getFolder('Background');
        const folderRenderer = folderBackground.addFolder('Renderer');
        folderRenderer.add(params, 'toneMapping', toneMaps).onChange(() => {
            this._renderer.toneMapping = parseInt(params.toneMapping);
        });
        folderRenderer.add(this._renderer, 'toneMappingExposure', 0, 5, 0.01).listen();
        folderRenderer
            .addColor(params, 'clearColor')
            .onChange(() => {
                this._renderer.setClearColor(params.clearColor);
            })
            .listen();
    }

    _removeDebugGui() {
        if (this._debugGui) Debugger.gui.removeFolder(this._debugGui);
    }

    /**
     * Handlers
     */
    _resizeHandler() {
        this._resize();
    }

    _tickHandler() {
        this._update();
    }
}
