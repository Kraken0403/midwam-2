uniform float uSize;
uniform float uAlpha;
uniform float uGradientInner;
uniform float uGradientOuter;
uniform float uNoiseStrength;
uniform vec3 uColor;
uniform vec2 uPosition;
uniform float uTime;

varying vec2 vUv;

// float circle(vec2 st, float radius){
//     vec2 dist = st - vec2(uPosition);
//     return 1.0 - smoothstep(radius - (radius * uGradientInner), radius + (radius * uGradientOuter), dot(dist, dist) * 4.0);
// }

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    // float alpha = circle(vUv, uSize);

    float alpha = 1.0 - (length(vUv - uPosition) * uSize);
    alpha += (random(vUv) - 0.5) * uNoiseStrength * alpha;

    gl_FragColor = vec4(uColor, alpha * uAlpha);
}
