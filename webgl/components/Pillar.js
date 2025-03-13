// Vendor
import gsap from 'gsap';
import {
    Object3D,
    Vector2,
    PointLight,
    SphereBufferGeometry,
    MeshBasicMaterial,
    Mesh,
    Color,
    BufferGeometry,
    Points,
    BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    NoBlending,
    NormalBlending,
    SubtractiveBlending,
    MultiplyBlending,
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { component } from '@/vendor/bidello';

// Utils
import Debugger from '@/utils/Debugger';

// Geometries
import { LineSegmentsGeometry } from '@/webgl/geometries/LineSegmentsGeometry.js';

// Materials
import { LineMaterial } from '@/webgl/materials/LineMaterial.js';

// Shaders
import particlesPillarVertexShader from '@/webgl/shaders/particles-pillar/vertex.glsl';
import particlesPillarFragmentShader from '@/webgl/shaders/particles-pillar/fragment.glsl';

export default class Pillar extends component(Object3D) {
    init({ data, name, show, debugFolder }) {
        // Props
        this._data = data;
        this._name = name;
        this._show = show;
        this._debugFolder = debugFolder;

        // Data
        this._height = 1200;
        this._particlesMovementSpeed = this._data.particles.movementSpeed;
        this._particlesRotationSpeed = this._data.particles.rotationSpeed;
        this._radius = 20;
        this._revealProgress = this._show ? 1 : 0;
        this._lines = this._createLines();
        this._coreLines = this._createCoreLines();
        this._particles = this._createParticles();
        this._pointLight = this._createPointLight();

        // Debug
        this._debug = this._createDebugGui();
    }

    /**
     * Public
     */
    show() {
        if (this._timelineHide) this._timelineHide.kill();
        this._timelineShow = new gsap.timeline();
        this._timelineShow.to(this._pointLight, 0.75, { distance: this._data.pointLight.distance, ease: 'power3.out' }, 0);
        this._timelineShow.to(this._lines.material.uniforms.revealProgress, 0.85, { value: 1, ease: 'power4.out' }, 0);
        this._timelineShow.to(this._coreLines.material.uniforms.revealProgress, 0.85, { value: 1, ease: 'power4.out' }, 0);
        this._timelineShow.to(this._particles.material.uniforms.uRevealProgress, 0.85, { value: 1, ease: 'power4.out' }, 0);
        return this._timelineShow;
    }

    hide() {
        if (this._timelineShow) this._timelineShow.kill();
        this._timelineHide = new gsap.timeline();
        this._timelineHide.to(this._pointLight, 0.652, { distance: 0.001, ease: 'power3.out' }, 0.25);
        this._timelineHide.fromTo(this._lines.material.uniforms.revealProgress, 0.75, { value: 1 }, { value: 0, ease: 'power3.out' }, 0);
        this._timelineHide.fromTo(this._coreLines.material.uniforms.revealProgress, 0.75, { value: 1 }, { value: 0, ease: 'power3.out' }, 0);
        this._timelineHide.fromTo(this._particles.material.uniforms.uRevealProgress, 0.75, { value: 1 }, { value: 0, ease: 'power3.out' }, 0);
        return this._timelineHide;
    }

    /**
     * Private
     */
    _createLines() {
        const amount = 10;
        const maxRadius = this._radius;

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

        const material = new LineMaterial({
            linewidth: this._data.lineWidth, // in pixels
            resolution: new Vector2(),
            dashed: false,
            revealProgress: this._revealProgress,
            worldUnits: false,
            vertexColors: false,
        });
        material.uniforms.noisyLines.value = this._data.noisyLines;
        material.uniforms.emissive.value = new Color(this._data.emissive);

        const lines = new Line2(geometry, material);
        this.add(lines);
        return lines;
    }

    _createCoreLines() {
        const positions = [];
        const normals = [];

        const distance = 4;

        // Line left
        const lineLeftX = -distance;
        const lineLeftZ = 0;

        // Position top
        positions.push(lineLeftX);
        positions.push(this._height);
        positions.push(lineLeftZ);

        // Position bottom
        positions.push(lineLeftX);
        positions.push(0);
        positions.push(lineLeftZ);

        // Normal top
        normals.push(0);
        normals.push(0);
        normals.push(1);

        // Normal bottom
        normals.push(0);
        normals.push(0);
        normals.push(1);

        // Line right
        const lineRightX = distance;
        const lineRightZ = 0;

        // Position top
        positions.push(lineRightX);
        positions.push(this._height);
        positions.push(lineRightZ);

        // Position bottom
        positions.push(lineRightX);
        positions.push(0);
        positions.push(lineRightZ);

        // Normal top
        normals.push(0);
        normals.push(0);
        normals.push(1);

        // Normal bottom
        normals.push(0);
        normals.push(0);
        normals.push(1);

        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(positions);
        geometry.setNormals(normals);

        const material = new LineMaterial({
            color: new Color(this._data.coreLines.color),
            linewidth: this._data.coreLines.lineWidth, // in pixels
            resolution: new Vector2(0, 0),
            dashed: false,
            revealProgress: this._revealProgress,
            showLights: false,
            worldUnits: false,
        });

        const mesh = new Line2(geometry, material);
        this.add(mesh);
        return mesh;
    }

    _createParticles() {
        const amount = 500;

        const positions = new Float32Array(amount * 3);
        const startPositionVertices = new Float32Array(amount * 3);
        const endPositionVertices = new Float32Array(amount * 3);

        for (let i = 0; i < amount * 3; i += 3) {
            const angle = Math.PI * 2 * Math.random();
            const r = this._radius * Math.random();
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
                uColor: { value: new Color(this._data.particles.color) },
                uTime: { value: 0 },
                uSize: { value: 40 },
                uSpeed: { value: 1 },
                uAlpha: { value: 1 },
                uFalloff: { value: 0.1 },
                uRotation: { value: 0 },
                uRevealProgress: { value: this._revealProgress },
            },
        });

        const points = new Points(geometry, material);
        points.frustumCulled = false;

        this.add(points);
        return points;
    }

    _createPointLight() {
        const distance = this._show ? this._data.pointLight.distance : 0.001;
        const pointLight = new PointLight(this._data.pointLight.color, this._data.pointLight.intensity, distance, this._data.pointLight.decay);
        // const geometry = new SphereBufferGeometry(0.3);
        // const material = new MeshBasicMaterial({ color: pointLight.color });
        // const mesh = new Mesh(geometry, material);
        // pointLight.add(mesh);
        this.add(pointLight);
        return pointLight;
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
        this._coreLines.material.resolution = new Vector2(this._width, this._height);
    }

    /**
     * Debug
     */
    _createDebugGui() {
        const gui = Debugger.gui;
        if (!gui) return;

        const colors = {
            lines: this._lines.material.color.getHex(),
            coreLines: this._coreLines.material.color.getHex(),
            pointLight: this._pointLight.color.getHex(),
            particles: this._particles.material.uniforms.uColor.value.getHex(),
            emissive: this._lines.material.uniforms.emissive.value.getHex(),
        };

        const folderLandscape = this._debugFolder;
        const folder = folderLandscape.addFolder(this._name);

        folder
            .add(this, '_revealProgress', 0, 1, 0.01)
            .name('revealProgress')
            .onChange(() => {
                this._particles.material.uniforms.uRevealProgress.value = this._revealProgress;
                this._coreLines.material.uniforms.revealProgress.value = this._revealProgress;
            });

        folder.add(this._lines.material, 'linewidth', 0, 50, 0.01);
        // folder
        //     .addColor(colors, 'lines')e
        //     .name('color')
        //     .onChange(() => {
        //         this._lines.material.color = new Color(colors.lines);
        //     });
        folder.add(this._lines.material.uniforms.noisyLines, 'value').name('noisyLines');
        folder
            .addColor(colors, 'emissive')
            .name('emissive')
            .onChange(() => {
                this._lines.material.uniforms.emissive.value = new Color(colors.emissive);
            });
        // folder.open();

        const folderPosition = folder.addFolder('Position');
        folderPosition.add(this.position, 'x', -5000, 5000, 0.01).listen();
        folderPosition.add(this.position, 'z', -5000, 5000, 0.01).listen();

        const folderCoreLines = folder.addFolder('Core lines');
        folderCoreLines.add(this._coreLines.material, 'linewidth', 0, 50, 0.01);
        folderCoreLines
            .addColor(colors, 'coreLines')
            .name('color')
            .onChange(() => {
                this._coreLines.material.color = new Color(colors.coreLines);
            });
        // folderCoreLines.open();

        const folderPointLight = folder.addFolder('Point light');
        folderPointLight
            .addColor(colors, 'pointLight')
            .name('color')
            .onChange(() => {
                this._pointLight.color = new Color(colors.pointLight);
            });
        folderPointLight.add(this._pointLight, 'intensity', 0, 10, 0.01);
        folderPointLight.add(this._pointLight, 'distance', 0, 5000, 0.01);
        folderPointLight.add(this._pointLight, 'decay', 0, 100, 0.01);
        // folderPointLight.open();

        const folderParticles = folder.addFolder('Particles');
        folderParticles
            .addColor(colors, 'particles')
            .name('color')
            .onChange(() => {
                this._particles.material.uniforms.uColor.value = new Color(colors.particles);
            });
        folderParticles.add(this, '_particlesMovementSpeed', 0, 0.1, 0.001).name('movementSpeed');
        folderParticles.add(this, '_particlesRotationSpeed', 0, 5, 0.01).name('rotationSpeed');
        // folderParticles.open();

        return gui;
    }
}
