uniform sampler2D tDiffuse;
uniform vec3 uHideColor;
uniform float uProgress;

varying vec2 vUv;

void main() {
    vec4 diffuseBase = texture2D(tDiffuse, vUv);
    vec3 color = mix(uHideColor, diffuseBase.rgb, uProgress);
    gl_FragColor = vec4(color, 1.0);
}
