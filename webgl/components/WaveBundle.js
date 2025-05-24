// WaveBundle.js
import gsap from 'gsap'
import {
    Object3D,
    Vector3,
    Color,
    Mesh,
    TextureLoader,
    Vector2,
    NormalBlending, 
    MultiplyBlending
  } from 'three';
  import { MeshLine, MeshLineMaterial } from 'three.meshline';
  
  export default class WaveBundle extends Object3D {
    constructor({
      strands = 20,
      points = 300,
      amplitude = 1.0,
      frequency = 1.0,
      waveLength = 10,
      speed = 1.0,
      strandSpacing = 0.15,
      colorFrom = '#ff8800',
      colorTo = '#00ffff',
      lineWidth = 0.5,
      texturePath = '/assets/stroke-v.png',
      resolution = { x: window.innerWidth, y: window.innerHeight },
    } = {}) {
      super();
  
      this.strands = strands;
      this.points = points;
      this.amplitude = amplitude;
      this.frequency = frequency;
      this.waveLength = waveLength;
      this.speed = speed;
      this.strandSpacing = strandSpacing;
      this.colorFrom = new Color(colorFrom);
      this.colorTo = new Color(colorTo);
      this.lineWidth = lineWidth;
      this.resolution = new Vector2(resolution.x, resolution.y);
  
      this._time = 0;
      this._lines = [];
  
      this._texture = new TextureLoader().load(texturePath, () => {
        this._createStrands();
      });
    }
  
    _createStrands() {
      for (let i = 0; i < this.strands; i++) {
        const t = this.strands === 1 ? 0 : i / (this.strands - 1);

        const offset = (i - this.strands / 2) * this.strandSpacing;
        const color = this.colorFrom.clone().lerp(this.colorTo, t);
  
        const points = this._generatePoints(offset, 0);
  
        const meshLine = new MeshLine();
        meshLine.setPoints(points);
  
        const material = new MeshLineMaterial({
          // color: color,
          color: 0xffffff,
          lineWidth: this.lineWidth,
          transparent: true,
          depthWrite: false,
          useMap: true,
          opacity: 0,
          map: this._texture,
          alphaTest: 0.05,
          resolution: this.resolution,
          blending: NormalBlending
        });
  
        const mesh = new Mesh(meshLine.geometry, material);
        this.add(mesh);
  
        this._lines.push({ mesh, meshLine, offset });
      }
    }

    setOpacity(value, duration = 1) {
      this._lines.forEach(({ mesh }) => {
        gsap.to(mesh.material, {
          opacity: value,
          duration,
          ease: 'power2.out'
        });
      });
    }
  
    _generatePoints(offset, time) {
      const points = [];
  
      for (let j = 0; j < this.points; j++) {
        const progress = j / (this.points - 1);
        const x = (progress - 0.5) * this.waveLength;
        const y = Math.sin(x * this.frequency + time * this.speed) * this.amplitude + offset;
        const z = 0;
  
        points.push(new Vector3(x, y, z));
      }
  
      return points;
    }
  
    update({ time }) {
      this._time = time;
  
      for (let i = 0; i < this._lines.length; i++) {
        const { meshLine, offset } = this._lines[i];
        const points = this._generatePoints(offset, this._time);
        meshLine.setPoints(points);
      }
    }
  }
  