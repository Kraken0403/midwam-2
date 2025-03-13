uniform mat4 textureMatrix;

varying vec4 vReflectionUv;
varying vec2 vUv;

void main() {
    vReflectionUv = textureMatrix * vec4(position, 1.0);
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
