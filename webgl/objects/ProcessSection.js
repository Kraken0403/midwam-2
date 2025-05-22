import { Group, Vector3, CatmullRomCurve3 } from 'three';

export default class ProcessSection {
  constructor({ camera, spinner, debugGui }) {
    this.camera = camera;
    this.spinner = spinner;
    this.debugGui = debugGui;

    this.progress = 0;
    this.active = false; // 🔥 New: controls whether animation is running

    this.group = new Group();
    this._createCurve();
    this._initDebug();
  }

  _createCurve() {
    this.pathPoints = [
      new Vector3(0, 0, 0),
      new Vector3(5, 5, -5),
      new Vector3(-5, 10, -10),
      new Vector3(0, 15, -15),
      new Vector3(5, 20, -20),
      new Vector3(0, 25, -25),
    ];

    this.curve = new CatmullRomCurve3(this.pathPoints);
    this.curve.curveType = 'catmullrom';
    this.curve.closed = false;
  }

  setProgress(value) {
    this.progress = Math.min(Math.max(value, 0), 1);
  }

  setActive(state) {
    this.active = state;
  }

  update({ time, delta }) {
    if (!this.curve || !this.spinner || !this.active) return;

    const point = this.curve.getPointAt(this.progress);
    const tangent = this.curve.getTangentAt(this.progress);

    // Move spinner
    this.spinner.position.copy(point);
    this.spinner.lookAt(point.clone().add(tangent));

    // Optionally move camera slightly along path
    const camOffset = this.curve.getPointAt(Math.min(this.progress + 0.05, 1));
    this.camera.position.lerp(camOffset, 0.05);
    this.camera.lookAt(point);
  }

  _initDebug() {
    if (!this.debugGui) return;
    const folder = this.debugGui.addFolder('Process Section');
    folder.add(this, 'progress', 0, 1, 0.001);
    folder.add(this, 'active').listen(); // Optional: debug visibility toggle
  }
}
