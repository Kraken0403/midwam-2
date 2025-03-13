// Vendor
import { sRGBEncoding, Texture, PMREMGenerator } from 'three';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';

class EnvironmentMap {
    constructor() {
        this._texture = null;
    }

    /**
     * Getters & Setters
     */
    get texture() {
        return this._texture;
    }

    /**
     * Public
     */
    generate(renderer) {
        this._texture = this._generateTexture(renderer);
    }

    /**
     * Private
     */
    _generateTexture(renderer) {
        const texture = new Texture(ResourceLoader.get('environment-map'));
        texture.needsUpdate = true;
        texture.encoding = sRGBEncoding;
        const pmremGenerator = new PMREMGenerator(renderer);
        const renderTarget = pmremGenerator.fromEquirectangular(texture);
        pmremGenerator.dispose();
        return renderTarget.texture;
    }
}

export default new EnvironmentMap();
