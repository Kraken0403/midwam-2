// Vendor
import gsap from 'gsap';
import { Group, Object3D, MeshBasicMaterial, Mesh, Texture, LinearFilter, PlaneBufferGeometry, TextureLoader, sRGBEncoding } from 'three';
import { component } from '@/vendor/bidello';

// Utils
import lerp from '@/utils/math/lerp';
import getViewSizeAtZDepth from '@/utils/helpers/getViewSizeAtZDepth';
import ResourceLoader from '@/utils/ResourceLoader';
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import Breakpoints from '@/utils/Breakpoints';

const PADDING = 10;

export default class ServicesCarousel extends component(Object3D) {
    init({ debugGui, camera }) {
        // Setup
        this._isDebug = debugGui !== undefined;
        this._debugGui = this._createDebugGui(debugGui);
        this._camera = camera;

        // Carousel Props
        this._positionX = {
            current: 0,
            target: 0,
        };

        // Settings
        this._sliderPositionZ = this.position.z;
        this._slideAspectRatio = 1080 / 1920;

        // Debug
        if (this._isDebug) {
            // this._createDebugPlane();
            this._createSlidesDebug();
        }
    }

    /**
     * Public
     */
    setupDirection(direction) {
        this._direction = direction;
    }

    setupSlides(projects) {
        this._textures = [];
      
        for (let i = 0; i < projects.length; i++) {
          const slug = projects[i].slug;
          const img = ResourceLoader.get(slug);
      
          if (!img) {
            console.warn(`[ServicesCarousel] No image loaded for ${slug}`);
            continue;
          }
      
          const texture = new Texture(img);
          texture.needsUpdate = true;
          this._textures.push(texture);
        }
        console.log('✅ Available textures:', this._textures.map(t => t.image?.src));

        this._createSlides();
        this._transitionInSlides();
      }
      

    destroySlides() {
        if (!this.sliderObject) return;
        this.sliderObject.remove(...this.sliderObject.children);
    }

    updatePosition(x) {
        if (!this._slideWidth) return;
        const maxDistance = this._slides.length - 1;
        if ((x > 0 || x.toFixed(2) < -maxDistance) && this._direction === 1) return;
        this._positionX.target = x * (this._slideWidth + 1);
    }

    hideSlides() {
        const timeline = new gsap.timeline();
        timeline.to(this.position, 1.3, { x: -(WindowResizeObserver.width * this._pixelRatioAtZDepth * this._direction) / 3, ease: 'power3.in' });

        return timeline;
    }

    showSlides() {
        const timeline = new gsap.timeline();
        timeline.fromTo(this.position, 1.5, { x: (WindowResizeObserver.width * this._pixelRatioAtZDepth * this._direction) / 3 }, { x: 0, ease: 'power3.out' });

        return timeline;
    }

    resetPosition(x) {
        this._positionX.target = x;
        this._positionX.current = x;
    }

    setActive(index) {
        if (!this._slides) return;

        if (this._timelineSetActive) this._timelineSetActive.kill();
        if (this.transitionInTimeline) this.transitionInTimeline.kill();
        this._timelineSetActive = new gsap.timeline();

        let item;
        let opacity;
        for (let i = 0, len = this._slides.length; i < len; i++) {
            item = this._slides[i];
            opacity = i === index ? 1 : 0.25;
            this._timelineSetActive.to(item.material, 0.6, { opacity, ease: 'sine.inOut' }, 0);
        }
    }

    /**
     * Private
     */
    _getViewSize() {
        this._viewSizeAtZDepth = getViewSizeAtZDepth(this._sliderPositionZ, this._camera);
        this._pixelRatioAtZDepth = this._viewSizeAtZDepth.width / WindowResizeObserver.width;
    }

    _createDebugPlane() {
        const geometry = new PlaneBufferGeometry(1, 1);
        const material = new MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const mesh = new Mesh(geometry, material);
        mesh.position.x = 0;

        mesh.scale.set(1, 5, 1);

        this._debugPlane = mesh;

        this.add(mesh);
    }

    _createSlidesDebug() {
        this.sliderObject = new Group();

        const image = new Texture(ResourceLoader.get('test-image'));
        if (!image) return;

        image.encoding = sRGBEncoding;
        image.minFilter = LinearFilter;
        image.magFilter = LinearFilter;
        image.needsUpdate = true;

        const geometry = new PlaneBufferGeometry(1, 1);
        const material = new MeshBasicMaterial({ map: image });
        // const material = new MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new Mesh(geometry, material);
        mesh.frustumCulled = false;

        const amount = 8;
        this._slides = [];

        for (let i = 0; i < amount; i++) {
            const clone = mesh.clone();
            this.sliderObject.add(clone);
            this._slides.push(clone);
        }

        this.add(this.sliderObject);
    }

    _createSlides() {
        this.sliderObject = new Group();

        const amount = this._textures.length;
        this._slides = [];

        for (let i = 0; i < amount; i++) {
            const image = this._textures[i];
            image.minFilter = LinearFilter;
            image.magFilter = LinearFilter;
            image.needsUpdate = true;

            const opacity = 0;

            const geometry = new PlaneBufferGeometry(1, 1);
            const material = new MeshBasicMaterial({ map: image, transparent: true, opacity });

            const mesh = new Mesh(geometry, material);
            mesh.frustumCulled = false;
            this.sliderObject.add(mesh);
            this._slides.push(mesh);
        }

        this.add(this.sliderObject);

        // Todo: find other way
        this._resizeSlides();
    }

    _transitionInSlides() {
        this.transitionInTimeline = new gsap.timeline();

        for (let i = 0; i < this._slides.length; i++) {
            const slide = this._slides[i];
            this.transitionInTimeline.to(slide.material, 1, { opacity: i === 0 ? 1 : 0.25, ease: 'sine.inOut' }, 0);
        }
    }

    _resizeSlides() {
        // Debug
        if (this._debugPlane) {
            this._debugPlane.scale.x = this._viewSizeAtZDepth.width;
        }

        if (!this._slides) return;

        let width = this._viewSizeAtZDepth.width * 0.6;

        if (Breakpoints.current === 'medium') {
            width = this._viewSizeAtZDepth.width * 0.8;
        } else if (Breakpoints.current === 'small') {
            width = this._viewSizeAtZDepth.width * 1.3;
        }

        this._slideWidth = width;
        const height = width * this._slideAspectRatio;
        const amount = this._slides.length;

        for (let i = 0; i < amount; i++) {
            const slide = this._slides[i];
            slide.scale.set(width, height, 1);
            slide.position.y = height * 0.5;
            slide.position.x = i * (width + 1) * (this._direction || 1);
        }

        this.sliderObject.position.x = amount * (width + 1) * -0.5;
    }

    /**
     * Resize
     */
    resize({ width, height }) {
        this._width = width;
        this._height = height;

        this._getViewSize();
        this._resizeSlides();
    }

    onResize({ width, height }) {}

    /**
     * Update
     */
    onUpdate({ time, delta }) {
        if (!this.sliderObject) return;

        this._positionX.current = lerp(this._positionX.current, this._positionX.target, 0.1);
        this.sliderObject.position.x = this._positionX.current;
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const folder = gui.addFolder('Services carousel');
        return folder;
    }
}
