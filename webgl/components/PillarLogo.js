// Vendor
import gsap from 'gsap';
import {
    Object3D,
    Vector2,
    AmbientLight,
    PointLight,
    MeshBasicMaterial,
    Mesh,
    Color,
    BufferGeometry,
    Points,
    BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    PlaneBufferGeometry,
    Texture,
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';
import ResourceLoader from '@/utils/ResourceLoader';

// Geometries
import { LineSegmentsGeometry } from '@/webgl/geometries/LineSegmentsGeometry.js';

// Materials
import { LineMaterial } from '@/webgl/materials/LineMaterial.js';

// Shaders
import particlesPillarVertexShader from '@/webgl/shaders/particles-pillar/vertex.glsl';
import particlesPillarFragmentShader from '@/webgl/shaders/particles-pillar/fragment.glsl';
import device from '@/utils/device';

export default class PillarLogo extends component(Object3D) {
    init({ name, debugFolder }) {
        // Props
        this._name = name;
        this._debugFolder = debugFolder;

        // Data
        this._height = 800;
        this._particlesMovementSpeed = 0.057;
        this._particlesRotationSpeed = 1.94;
        this._revealProgress = 1;
        this._lines = this._createLines();
        this._particles = this._createParticles();
        this._pointLight = this._createPointLight();
        this._logo = this._createLogo();

        // Debug
        this._debug = this._createDebugGui();
    }

    /**
     * Public
     */
    show() {
        this._timelineShow = new gsap.timeline();
        this._timelineShow.fromTo(this._particles.material.uniforms.uRevealProgress, 3, { value: 0 }, { value: 1 }, 0);
        this._timelineShow.fromTo(this._pointLight, 3, { intensity: 0 }, { intensity: 1.91 }, 0);
        this._timelineShow.fromTo(this._logo.material, 3, { opacity: 0 }, { opacity: 1 }, 0);
        return this._timelineShow;
    }

    /**
     * Private
     */
    _createLines() {
        const amount = 20;
        const maxRadius = 30;

        const positions = [];
        const normals = [];

        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = maxRadius * Math.random();
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            // Position top
            positions.push(x);
            positions.push(this._height);
            positions.push(z);

            // Position bottom
            positions.push(x);
            positions.push(0);
            positions.push(z);

            // Normal top
            normals.push(0);
            normals.push(0);
            normals.push(1);

            // Normal bottom
            normals.push(0);
            normals.push(0);
            normals.push(1);
        }

        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(positions);
        geometry.setNormals(normals);

        const linewidth = device.dpr() > 1.5 ? 1 : 0.24;

        const material = new LineMaterial({
            linewidth, // in pixels
            resolution: new Vector2(),
            dashed: false,
            worldUnits: false,
            vertexColors: false,
            emissive: new Color(0x513c03),
        });
        material.color = new Color(0x896619);

        const lines = new Line2(geometry, material);
        this.add(lines);
        return lines;
    }

    _createParticles() {
        const amount = 1000;

        const positions = new Float32Array(amount * 3);
        const startPositionVertices = new Float32Array(amount * 3);
        const endPositionVertices = new Float32Array(amount * 3);

        const radius = 30;

        for (let i = 0; i < amount * 3; i += 3) {
            const angle = Math.PI * 2 * Math.random();
            const r = radius * Math.random();
            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);

            startPositionVertices[i + 0] = x; // x
            startPositionVertices[i + 1] = 0; // y
            startPositionVertices[i + 2] = z; // z

            endPositionVertices[i + 0] = x; // x
            endPositionVertices[i + 1] = this._height; // y
            endPositionVertices[i + 2] = z; // z

            positions[i + 0] = 0; // x
            positions[i + 1] = 0; // y
            positions[i + 2] = 0; // z
        }

        const offsets = new Float32Array(amount);
        for (let i = 0; i < amount; i++) {
            offsets[i] = i / amount;
        }

        const normals = new Float32Array(amount * 3);
        for (let i = 0; i < amount * 3; i += 3) {
            normals[i + 0] = -1 + Math.random() * 2; // x
            normals[i + 1] = -1 + Math.random() * 2; // y
            normals[i + 2] = -1 + Math.random() * 2; // z
        }

        const sizes = new Float32Array(amount);
        for (let i = 0; i < amount; i++) {
            sizes[i] = 30 * Math.random();
        }

        const speed = new Float32Array(amount);
        for (let i = 0; i < amount; i++) {
            speed[i] = 0.5 + Math.random() * 0.5;
        }

        const alpha = new Float32Array(amount);
        for (let i = 0; i < amount; i++) {
            alpha[i] = 1;
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setAttribute('aStartPosition', new BufferAttribute(startPositionVertices, 3));
        geometry.setAttribute('aEndPosition', new BufferAttribute(endPositionVertices, 3));
        geometry.setAttribute('aOffset', new BufferAttribute(offsets, 1));
        geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
        geometry.setAttribute('aSpeed', new BufferAttribute(speed, 1));
        geometry.setAttribute('aAlpha', new BufferAttribute(alpha, 1));
        geometry.setAttribute('aNormal', new BufferAttribute(normals, 3));

        const material = new ShaderMaterial({
            vertexShader: particlesPillarVertexShader,
            fragmentShader: particlesPillarFragmentShader,
            blending: AdditiveBlending,
            transparent: true,
            depthTest: false,
            uniforms: {
                uColor: { value: new Color(0xb5883b) },
                uTime: { value: 0 },
                uSize: { value: 100 },
                uSpeed: { value: 1 },
                uAlpha: { value: 1 },
                uFalloff: { value: 0.1 },
                uRotation: { value: 0 },
                uRevealProgress: { value: 0 },
            },
        });

        const points = new Points(geometry, material);
        points.frustumCulled = false;

        this.add(points);
        return points;
    }

    _createPointLight() {
        const pointLight = new PointLight(0x896619, 1.91, 2533, 10.47);
        pointLight.position.z = 3;
        // const geometry = new SphereBufferGeometry(0.3);
        // const material = new MeshBasicMaterial({ color: pointLight.color });
        // const mesh = new Mesh(geometry, material);
        // pointLight.add(mesh);
        this.add(pointLight);
        return pointLight;
    }

    _createLogo() {
        const image = ResourceLoader.get('logo');
        const logo = new Texture(image);
        logo.needsUpdate = true;
        const geometry = new PlaneBufferGeometry(60, 60);
        const material = new MeshBasicMaterial({ color: 0xc8590c, map: logo, transparent: true, opacity: 0 });
        const mesh = new Mesh(geometry, material);
        mesh.rotation.x = Math.PI * -0.5;
        mesh.position.y = 3;
        this.add(mesh);
        return mesh;
    }

    /**
     * Update
     */
    onUpdate({ time }) {
        this._particles.material.uniforms.uTime.value = time * this._particlesMovementSpeed;
        this._particles.material.uniforms.uRotation.value = time * this._particlesRotationSpeed;
    }

    /**
     * Resize
     */
    onResize({ width, height }) {
        this._width = width;
        this._height = height;
        this._resizeLinesMaterial();
    }

    _resizeLinesMaterial() {
        this._lines.material.resolution = new Vector2(this._width, this._height);
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const colors = {
            lines: this._lines.material.color.getHex(),
            pointLight: this._pointLight.color.getHex(),
            particles: this._particles.material.uniforms.uColor.value.getHex(),
            logo: this._logo.material.color.getHex(),
        };

        const folderLandscape = this._debugFolder;
        const folder = folderLandscape.addFolder(this._name);

        folder
            .add(this, '_revealProgress', 0, 1, 0.01)
            .name('revealProgress')
            .onChange(() => {
                this._particles.material.uniforms.uRevealProgress.value = this._revealProgress;
                // this._coreLines.material.uniforms.revealProgress.value = this._revealProgress;
            });

        folder.add(this._lines.material, 'linewidth', 0, 50, 0.01);
        folder
            .addColor(colors, 'lines')
            .name('color')
            .onChange(() => {
                this._lines.material.color = new Color(colors.lines);
            });
        folder.add(this._lines.material.uniforms.noisyLines, 'value').name('noisyLines');
        // folder.open();

        const folderPointLight = folder.addFolder('Point light');
        folderPointLight
            .addColor(colors, 'pointLight')
            .name('color')
            .onChange(() => {
                this._pointLight.color = new Color(colors.pointLight);
            });
        folderPointLight.add(this._pointLight, 'intensity', 0, 10, 0.01);
        folderPointLight.add(this._pointLight, 'distance', 0, 3000, 0.01);
        folderPointLight.add(this._pointLight, 'decay', 0, 100, 0.01);
        folderPointLight.open();

        const folderParticles = folder.addFolder('Particles');
        folderParticles
            .addColor(colors, 'particles')
            .name('color')
            .onChange(() => {
                this._particles.material.uniforms.uColor.value = new Color(colors.particles);
            });
        folderParticles.add(this, '_particlesMovementSpeed', 0, 0.1, 0.001).name('movementSpeed');
        folderParticles.add(this, '_particlesRotationSpeed', 0, 5, 0.01).name('rotationSpeed');
        folderParticles.open();

        const folderLogo = folder.addFolder('Logo');
        folderLogo.addColor(colors, 'logo').onChange(() => {
            this._logo.material.color = new Color(colors.logo);
        });

        return gui;
    }
}
