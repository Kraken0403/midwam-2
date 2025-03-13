#include <packing>

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tMask;
uniform sampler2D tDepth;
uniform vec3 uScannerPosition;
uniform mat4 uProjectionInverse;
uniform mat4 uViewMatrixInv;

uniform vec3 uScanColor;
uniform float uScanWidth;
uniform float uScanDistance;
uniform float uScanGradientOffset;
uniform float uScanGradientSize;
uniform float uNoiseScale;

float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

// https://stackoverflow.com/questions/32227283/getting-world-position-from-depth-buffer-value
vec3 worldPosFromDepth(float depth) {
    float z = depth * 2.0 - 1.0;

    vec4 clipSpacePosition = vec4(vUv * 2.0 - 1.0, z, 1.0);
    vec4 viewSpacePosition = uProjectionInverse * clipSpacePosition;

    // Perspective division
    viewSpacePosition /= viewSpacePosition.w;

    vec4 worldSpacePosition = uViewMatrixInv * viewSpacePosition;

    return worldSpacePosition.xyz;
}

void main() {
    // Diffuse color
    vec3 diffuse = texture2D(tDiffuse, vUv).rgb;

    // Distance to world
    vec3 worldPosition = worldPosFromDepth(texture2D(tDepth, vUv).r);
    float dist = distance(worldPosition, uScannerPosition);

    vec3 scannerCol = vec3(0.0, 0.0, 0.0);

    if (dist < uScanDistance && dist > uScanDistance - uScanWidth) {
        float diff = 1. - (uScanDistance - dist) / (uScanWidth);
        scannerCol = uScanColor * cubicPulse(uScanGradientOffset, uScanGradientSize, diff);
    }

    vec3 color = (diffuse + scannerCol);

    if (dist > uScanDistance) {
        discard;
    }

    gl_FragColor.rgb = color;
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
}
