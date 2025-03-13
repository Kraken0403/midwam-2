#define PI 3.141592653589793

varying vec2 vUv;

float sineInOut(float t) {
    return -0.5 * (cos(PI * t) - 1.0);
}

void main() {
    vec2 uv = vUv;

    // Gradients
    float alpha = 1.0 - distance(vec2(0.8, 0.7), uv) * 1.0;
    alpha = clamp(alpha, 0.0, 1.0);
    alpha = sineInOut(alpha);
    // alpha += (random(uv) - 0.5) * 0.05;

    vec3 color = vec3(43. / 255., 34. / 255., 97. / 255.) * alpha * 0.4;

    // Final
    gl_FragColor = vec4(color, 1.0);
}
