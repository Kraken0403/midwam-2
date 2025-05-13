import {
  Group,
  Mesh,
  PlaneGeometry,
  MeshStandardMaterial,
  TextureLoader,
  MathUtils
} from 'three';

export default class ServicesPlanes extends Group {
  constructor({ envMap, images = [], camera }) {
    super();

    const loader = new TextureLoader();

    // 📏 Step 1: Get camera projection info
    const fov = MathUtils.degToRad(camera.fov);         // vertical FOV in radians
    const aspect = camera.aspect;
    const distance = 10; // 🔥 estimated distance from camera to plane (adjust as needed)

    const visibleHeight = 2 * Math.tan(fov / 2) * distance;
    const visibleWidth = visibleHeight * aspect;

    // 🎯 Step 2: Use 45% of screen width and 3:2 ratio
    const planeWidth = visibleWidth * 0.55;
    const planeHeight = planeWidth * 0.82;

    const spacing = visibleWidth * 0.1; // 10% gap

    images.forEach((url, i) => {
      const texture = loader.load(url);
      const geometry = new PlaneGeometry(planeWidth, planeHeight);
      const material = new MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.45,
        envMap,
        envMapIntensity: 1,
        side: 2,
        transparent: true,
      });

      const mesh = new Mesh(geometry, material);

      // 🔧 Step 3: Space them evenly
      const x = (i - (images.length - 1) / 2) * (planeWidth + spacing);
      const y = planeHeight / 2; // raise above floor
      const z = 0;

      mesh.position.set(x, y, z);
      this.add(mesh);
    });
  }
}
