#include <packing>

varying vec2 vUv;

uniform vec2 uSize;
uniform vec3 uScanColor;
uniform float uScanWidth;
uniform float uScanDistance;
uniform float uScanGradientOffset;
uniform float uScanGradientSize;

float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

void main() {
    vec2 uv = vUv * uSize;

    vec2 center = vec2(0.5, 0.5) * uSize;
    float dist = distance(center, uv);

    float alpha = 0.0;
    vec3 color = uScanColor;

    if (dist < uScanDistance && dist > uScanDistance - uScanWidth) {
        float diff = 1. - (uScanDistance - dist) / (uScanWidth);
        alpha = cubicPulse(uScanGradientOffset, uScanGradientSize, diff);
    }

    gl_FragColor = vec4(color, alpha);
}
