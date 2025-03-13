uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;

// Noise
uniform float uNoiseStrength;

// Chromatic aberration
uniform float uCAMaxDistortion;
uniform float uCAScale;
uniform float uCASize;

// Vignette
uniform float uVignetteOffset;
uniform float uVignetteDarkness;

// Gradients
uniform float uGradientsAlpha;
uniform vec2 uGradient1Position;
uniform vec3 uGradient1Color;
uniform float uGradient1Strength;
uniform float uGradient1Scale;
uniform vec2 uGradient2Position;
uniform vec3 uGradient2Color;
uniform float uGradient2Strength;
uniform float uGradient2Scale;

// Bottom gradient
uniform float uBottomGradientScale;
uniform float uBottomGradientStrength;
uniform vec3 uBottomGradientColor;

varying vec2 vUv;

#pragma glslify: random = require(../partials/random.glsl)

#define PI 3.141592653589793

vec2 barrelDistortion(vec2 coord, float amt) {
    vec2 cc = coord - 0.5;
    float dist = dot(cc, cc);
    return coord + cc * dist * amt;
}

float sat(float t) {
    return clamp( t, 0.0, 1.0 );
}

float linterp(float t) {
    return sat(1.0 - abs(2.0 * t - 1.0));
}

float remap(float t, float a, float b) {
    return sat((t - a) / (b - a));
}

vec4 spectrumOffset( float t ) {
    vec4 ret;
    float lo = step(t, 0.5);
    float hi = 1.0 - lo;
    float w = linterp(remap(t, 1.0 / 6.0, 5.0 / 6.0));
    ret = vec4(lo,1.0,hi, 1.) * vec4(1.0 - w, w, 1.0 - w, 1.);

    return pow(ret, vec4(1.0 / 2.2));
}

float sineInOut(float t) {
    return -0.5 * (cos(PI * t) - 1.0);
}

const int CAIterations = 9;
const float CAReciIterations = 1.0 / float(CAIterations);

void main() {
    vec2 uv = vUv;

    // Chromatic aberration
    vec2 caUv = (gl_FragCoord.xy / uResolution.xy * uCAScale) + (1.0 - uCAScale) * 0.5;
    vec4 sumCol = vec4(0.0);
    vec4 sumW = vec4(0.0);
    for (int i = 0; i < CAIterations; ++i) {
        float t = float(i) * CAReciIterations;
        vec4 w = spectrumOffset(t);
        sumW += w;
        sumCol += w * texture2D(tDiffuse, barrelDistortion(caUv, uCASize * uCAMaxDistortion * t));
    }
    vec4 color = sumCol / sumW;

    // Gradients
    float gradient1Alpha = 1.0 - distance(uGradient1Position, uv) * uGradient1Scale;
    gradient1Alpha = clamp(gradient1Alpha, 0.0, 1.0);
    gradient1Alpha = sineInOut(gradient1Alpha);
    color.rgb += uGradient1Color * gradient1Alpha * uGradient1Strength * uGradientsAlpha;

    float gradient2Alpha = 1.0 - distance(uGradient2Position, uv) * uGradient2Scale;
    gradient2Alpha = clamp(gradient2Alpha, 0.0, 1.0);
    gradient2Alpha = sineInOut(gradient2Alpha);
    color.rgb += uGradient2Color * gradient2Alpha * uGradient2Strength * uGradientsAlpha;

    // Bottom gradient
    float bottomGradientAlpha = distance(uv.y, 1.0) * uBottomGradientScale;
    bottomGradientAlpha = clamp(bottomGradientAlpha, 0.0, 1.0);
    // bottomGradientAlpha = sineInOut(bottomGradientAlpha);
    color.rgb = mix(color.rgb, uBottomGradientColor, bottomGradientAlpha * uBottomGradientStrength);

    // Vignette
    const vec2 center = vec2(0.5);
    float d = distance(vUv, center);
    color *= smoothstep(0.8, uVignetteOffset * 0.799, d * (uVignetteDarkness + uVignetteOffset));

    // Noise
    color.rgb += (random(vUv) - 0.5) * uNoiseStrength;

    // Final
    gl_FragColor = color;
}
