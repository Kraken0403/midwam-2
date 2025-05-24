import {
  Object3D,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Float32BufferAttribute,
  Color,
} from 'three';
import SimplexNoise from 'simplex-noise';

export default class BackgroundLines extends Object3D {
  constructor({
    lineCount = 6,
    pointCount = 10020,
    waveHeight = 2,
    spacing = 0.3,
    colorMode = 'gradient', // 'fixed' or 'gradient'
    fixedColor = '#00ffff',
    lengthFactor = 1.0,      // Controls length of lines
    speedFactor = 1.0,       // Slows down or speeds up wave animation
    twistAmount = 0          // 0 = no twist, 0.5 = half spiral, 1 = full turn
  } = {}) {
    super();

    this.lineCount = lineCount;
    this.pointCount = pointCount;
    this.waveHeight = waveHeight;
    this.spacing = spacing;
    this.colorMode = colorMode;
    this.fixedColor = fixedColor;
    this.lengthFactor = lengthFactor;
    this.speedFactor = speedFactor;
    this.twistAmount = twistAmount;

    this._noise = new SimplexNoise();
    this._lines = [];
    this._time = 0;

    this._createLines();
  }

  _createLines() {
    for (let i = 0; i < this.lineCount; i++) {
      const positions = new Float32Array(this.pointCount * 3);

      for (let j = 0; j < this.pointCount; j++) {
        const angle = (i / this.lineCount) * Math.PI * 2 * this.twistAmount;
        const radius = (j - this.pointCount / 2) * this.lengthFactor;

        const x = radius * Math.cos(angle);
        const y = (i - this.lineCount / 2) * this.spacing;
        const z = radius * Math.sin(angle);

        // Debug for NaNs
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          console.warn(`Invalid vertex: i=${i}, j=${j}, x=${x}, y=${y}, z=${z}`);
        }

        positions.set([x, y, z], j * 3);
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

      const color =
        this.colorMode === 'gradient'
          ? new Color(`hsl(${(i / this.lineCount) * 360}, 100%, 50%)`)
          : new Color(this.fixedColor);

      const material = new LineBasicMaterial({ color });
      const line = new Line(geometry, material);

      this._lines.push(line);
      this.add(line);
    }
  }

  update({ time, delta }) {
    this._time += delta * this.speedFactor;

    for (let i = 0; i < this._lines.length; i++) {
      const line = this._lines[i];
      const positions = line.geometry.attributes.position.array;

      for (let j = 0; j < this.pointCount; j++) {
        const index = j * 3 + 2; // Update Z only (for wave)
        const x = j / this.pointCount;

        positions[index] = this._noise.noise3D(x * 2, i * 0.1, this._time) * this.waveHeight;
      }

      line.geometry.attributes.position.needsUpdate = true;
    }
  }
}
