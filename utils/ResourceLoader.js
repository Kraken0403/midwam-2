// Vendor
import FontFaceObserver from 'fontfaceobserver';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '@/webgl/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TextureLoader } from 'three';
import Pizzicato from 'pizzicato';

// Utils
import EventDispatcher from '@/utils/EventDispatcher';
import AudioManager from '@/utils/AudioManager';
import resources from '@/resources';
import Browser from '@/utils/Browser';

// States
const STATE_LOADING = 'loading';
const STATE_LOADED = 'loaded';

// Cache
const cache = [];

export default class ResourceLoader extends EventDispatcher {
    constructor(resources, basePath) {
        super();

        this._resources = this._deepClone(resources);
        this._basePath = basePath;
        this._allAssetsLoaded = false;
        this._loadResources();

        if (Browser.isSafari()) {
            this._reloadAssetsInterval = setInterval(() => {
                if (this._allAssetsLoaded) clearInterval(this._reloadAssetsInterval);
                for (let i = 0, len = this._resources.length; i < len; i++) {
                    if (this._resources[i].state === STATE_LOADING) {
                        this._loadResource(this._resources[i]);
                    }
                }
            }, 10000);
        }
    }

    /**
     * Static
     */
    static get(name) {
        const resource = this._getResourceByName(name);
        if (resource) {
            return resource.data;
        } else {
            return undefined;
        }
    }

    static _getResourceByName(name) {
        for (let i = 0, len = cache.length; i < len; i++) {
            if (cache[i].name === name) return cache[i];
        }
        return undefined;
    }

    /**
     * Private
     */
    _deepClone(array) {
        return JSON.parse(JSON.stringify(array));
    }

    _loadResources() {
        for (let i = 0, len = this._resources.length; i < len; i++) {
            this._loadResource(this._resources[i]);
        }
    }

    _loadResource(resource) {
        switch (resource.type) {
            case 'image':
                this._loadImage(resource);
                break;
            case 'json':
                this._loadJson(resource);
                break;
            case 'font':
                this._loadFont(resource);
                break;
            case 'gltf':
            case 'glb':
                this._loadGltf(resource);
                break;
            case 'obj':
                this._loadObj(resource);
                break;
            case 'sound':
                this._loadSound(resource);
                break;
        }
    }

    _checkResourcesStatus() {
        for (let i = 0, len = this._resources.length; i < len; i++) {
            if (this._resources[i].state === STATE_LOADING) {
                return;
            }
        }
        this._allAssetsLoaded = true;
        if (this._reloadAssetsInterval) clearInterval(this._reloadAssetsInterval);
        this.dispatchEvent('complete');
    }

    /**
     * Loaders
     */
    _loadImage(resource) {
        resource.state = STATE_LOADING;
        const image = new Image();
        image.crossOrigin = '';
        image.onload = () => {
            resource.state = STATE_LOADED;
            cache.push(resource);
            this._checkResourcesStatus();
        };
        image.src = resource.path ? this._basePath + resource.path : resource.absolutePath;
        resource.data = image;
    }

    _loadJson(resource) {
        resource.state = STATE_LOADING;
        const request = new XMLHttpRequest();
        request.addEventListener('load', () => {
            resource.data = JSON.parse(request.response);
            resource.state = STATE_LOADED;
            cache.push(resource);
            this._checkResourcesStatus();
        });
        request.open('GET', this._basePath + resource.path);
        request.send();
    }

    _loadFont(resource) {
        resource.state = STATE_LOADING;
        const observer = new FontFaceObserver(resource.name, {
            weight: resource.weight,
        });
        observer.load().then(() => {
            resource.state = STATE_LOADED;
            cache.push(resource);
            this._checkResourcesStatus();
        });
    }

    _loadGltf(resource) {
        resource.state = STATE_LOADING;
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(this._basePath + '/assets/libs/draco/');
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(this._basePath + resource.path, (gltf) => {
            resource.data = gltf;
            resource.state = STATE_LOADED;
            cache.push(resource);
            this._checkResourcesStatus();
        });
    }

    _loadObj(resource) {
        resource.state = STATE_LOADING;
        const loader = new OBJLoader();
        loader.load(this._basePath + resource.path, (gltf) => {
            resource.data = gltf;
            resource.state = STATE_LOADED;
            cache.push(resource);
            this._checkResourcesStatus();
        });
    }

    _loadSound(resource) {
        resource.state = STATE_LOADING;
        const sound = new Pizzicato.Sound(this._basePath + resource.path, (error) => {
            resource.data = sound;
            resource.state = STATE_LOADED;
            cache.push(resource);
            if (!error) AudioManager.add(resource.name, sound);
            this._checkResourcesStatus();
        });
    }
}
