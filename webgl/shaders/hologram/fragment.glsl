uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;
uniform float uOffset;
uniform float uLineOffsetMinAmplitude;
uniform float uLineOffsetMaxAmplitude;
uniform float uLineOffsetFrequency;
uniform float uStrengthMinAmplitude;
uniform float uStrengthMaxAmplitude;
uniform float uStrengthFrequency;
uniform float uLineWidth;
uniform vec3 uColor;
uniform float uColorStrength;
uniform float uProgress;
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

vec3 luminosity(vec3 s, vec3 d) {
    float dLum = dot(d, vec3(0.3, 0.59, 0.11));
    float sLum = dot(s, vec3(0.3, 0.59, 0.11));
    float lum = sLum - dLum;
    vec3 c = d + lum;
    float minC = min(min(c.x, c.y), c.z);
    float maxC = max(max(c.x, c.y), c.z);
    if(minC < 0.0) return sLum + ((c - sLum) * sLum) / (sLum - minC);
    else if(maxC > 1.0) return sLum + ((c - sLum) * (1.0 - sLum)) / (maxC - sLum);
    else return c;
}

void main() {
    vec2 uv = vUv;

    vec4 diffuseBase = texture2D(tDiffuse, vUv) * 1.;

    // Line offset
    float lineOffsetNoise = snoise2(vec2(uTime * uLineOffsetFrequency, 10.0));
    float lineOffset = (uLineOffsetMinAmplitude + lineOffsetNoise * uLineOffsetMaxAmplitude) / uResolution.x;

    // Strength
    float strengthNoise = snoise2(vec2(uTime * uStrengthFrequency, 1.0));
    float strength = uStrengthMinAmplitude + (1.0 + strengthNoise) * 0.5 * uStrengthMaxAmplitude;

    // float strength = snoise2(uTime * 3, 1.0);
    // float lineOffset = snoise2(uTime * 5, 10.0);

    float offset = uOffset / uResolution.x;
    float interval = uLineWidth;
    float direction = mod((uv.y - uTime * 0.04) * uResolution.y, interval) < interval * 0.5 ? -1.0 : 1.0;
    uv.x += offset + lineOffset * direction;
    vec4 hologramColor = texture2D(tDiffuse, uv);

    vec3 backgroundColor = uColor * uColorStrength;
    vec3 combinedColor = diffuseBase.rgb + hologramColor.rgb * strength;
    vec3 color = luminosity(combinedColor, backgroundColor);

    vec3 c = mix(diffuseBase.rgb, color, uProgress);

    gl_FragColor = vec4(c, 1.0);
}
