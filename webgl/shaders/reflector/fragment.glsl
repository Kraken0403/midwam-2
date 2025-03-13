uniform sampler2D tDiffuse;
uniform sampler2D tRoughnessMap;
uniform float uRoughnessMapStrength;
uniform float uRoughnessMapScale;
uniform vec2 uRoughnessMapOffset;
uniform vec3 uColor;
uniform float uReflectionStrength;
uniform float uMipStrength;
uniform vec2 uRoughnessMapResolution;
// uniform float uNoiseStrength;

varying vec4 vReflectionUv;
varying vec2 vUv;

#define PI 3.14159265359

#define r0 1.0
#define v0 0.339
#define m0 - 2.0
#define r1 0.8
#define v1 0.276
#define m1 - 1.0
#define r4 0.4
#define v4 0.046
#define m4 2.0
#define r5 0.305
#define v5 0.016
#define m5 3.0
#define r6 0.21
#define v6 0.0038
#define m6 4.0

// #pragma glslify: random = require(../partials/random.glsl)

float roughnessToMip(float roughness) {
    float mip = 0.0;

    if (roughness >= r1) {
        mip = (r0 - roughness) * (m1 - m0) / (r0 - r1) + m0;
    } else if (roughness >= r4) {
        mip = (r1 - roughness) * (m4 - m1) / (r1 - r4) + m1;
    } else if (roughness >= r5) {
        mip = (r4 - roughness) * (m5 - m4) / (r4 - r5) + m4;
    } else if (roughness >= r6) {
        mip = (r5 - roughness) * (m6 - m5) / (r5 - r6) + m5;
    } else {
        mip = - 2.0 * log2(1.16 * roughness); // 1.16 = 1.79^0.25
    }

    return mip;
}

// Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
float getSpecularMIPLevel(const in float roughness, const in int maxMIPLevel) {
    float maxMIPLevelScalar = float(maxMIPLevel);

    float sigma = PI * roughness * roughness / (1.0 + roughness);
    float desiredMIPLevel = maxMIPLevelScalar + log2(sigma);

    // clamp to allowable LOD ranges.
    return clamp(desiredMIPLevel, 0.0, maxMIPLevelScalar);
}

// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl
vec4 cubic(float v){
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;
    return vec4(x, y, z, w) * (1.0 / 6.0);
}

vec4 textureBicubic(sampler2D sampler, vec2 texCoords, vec2 textureResolution){
    vec2 texSize = textureResolution;
    vec2 invTexSize = 1.0 / texSize;

    texCoords = texCoords * texSize - 0.5;

    vec2 fxy = fract(texCoords);
    texCoords -= fxy;

    vec4 xcubic = cubic(fxy.x);
    vec4 ycubic = cubic(fxy.y);

    vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;

    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
    vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;

    offset *= invTexSize.xxyy;

    vec4 sample0 = texture2D(sampler, offset.xz);
    vec4 sample1 = texture2D(sampler, offset.yz);
    vec4 sample2 = texture2D(sampler, offset.xw);
    vec4 sample3 = texture2D(sampler, offset.yw);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}

vec4 textureBicubicLod(sampler2D sampler, vec2 texCoords, float mipmaplvl, vec2 textureResolution){
    vec2 texSize = textureResolution;
    vec2 invTexSize = 1.0 / texSize;

    texCoords = texCoords * texSize - 0.5;

    vec2 fxy = fract(texCoords);
    texCoords -= fxy;

    vec4 xcubic = cubic(fxy.x);
    vec4 ycubic = cubic(fxy.y);

    vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;

    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
    vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;

    offset *= invTexSize.xxyy;

    #ifdef TEXTURE_LOD_EXT
        vec4 sample0 = texture2DLodEXT(sampler, offset.xz, mipmaplvl);
        vec4 sample1 = texture2DLodEXT(sampler, offset.yz, mipmaplvl);
        vec4 sample2 = texture2DLodEXT(sampler, offset.xw, mipmaplvl);
        vec4 sample3 = texture2DLodEXT(sampler, offset.yw, mipmaplvl);
    #else
        vec4 sample0 = texture2D(sampler, offset.xz, mipmaplvl);
        vec4 sample1 = texture2D(sampler, offset.yz, mipmaplvl);
        vec4 sample2 = texture2D(sampler, offset.xw, mipmaplvl);
        vec4 sample3 = texture2D(sampler, offset.yw, mipmaplvl);
    #endif

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}

void main() {
    // Perspective division
    vec2 reflectionUv = vReflectionUv.xy / vReflectionUv.w;

    // Roughness
    // float roughness = texture2D(tRoughnessMap, (vUv + uRoughnessMapOffset) * uRoughnessMapScale).b * uRoughnessMapStrength;
    float roughness = textureBicubic(tRoughnessMap, (vUv + uRoughnessMapOffset) * uRoughnessMapScale, uRoughnessMapResolution).b * uRoughnessMapStrength;

    // Mip levels
    float mipmapLevel = roughnessToMip(roughness) * uMipStrength;
    float mipF = fract(mipmapLevel);
    float mipLow = floor(mipmapLevel);
    float mipHigh = mipLow + 1.0;

    vec2 sizeLow = vec2(pow(2., 10. - mipLow));
    vec2 resolutionLow = vec2(sizeLow);
    vec4 colorLow = textureBicubicLod(tDiffuse, reflectionUv, mipLow, resolutionLow);

    vec4 color;
    if (mipF == 0.0) {
        color = colorLow;
    } else {
        vec2 sizeHigh = vec2(pow(2., 10. - mipHigh));
        vec2 resolutionHigh = vec2(sizeHigh);
        vec4 colorHigh = textureBicubicLod(tDiffuse, reflectionUv, mipHigh, resolutionHigh);

        color = mix(colorLow, colorHigh, mipF);
    }

    // color += (random(reflectionUv) - 0.5) * uNoiseStrength;

    gl_FragColor = color;
    gl_FragColor.a = uReflectionStrength;
    // gl_FragColor = vec4(vec3(roughness), 1.0);
    // gl_FragColor = texture2D(tDiffuse, reflectionUv);
}
