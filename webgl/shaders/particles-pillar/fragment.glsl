uniform float uAlpha;
uniform vec3 uColor;
uniform float uRevealProgress;

varying float vAlpha;
varying float vProgress;
varying vec3 vSurfaceNormal;
varying vec3 vToLightVector;

float circle(vec2 _st, float _radius){
    vec2 dist = _st-vec2(0.5);
    return 1.-smoothstep(_radius-(_radius*0.1), _radius+(_radius*0.01), dot(dist,dist)*4.0);
}

void main() {
    // Light calculation
    vec3 unitNormal = normalize(vSurfaceNormal);
    vec3 unitLightVector = normalize(vToLightVector);
    float nDotl = dot(unitNormal, unitLightVector);
    float brightness = max(nDotl, 0.0);

    // Color
    vec3 diffuse = brightness * uColor;

    // Reveal
    float revealAlpha = vProgress > uRevealProgress ? 0.0 : 1.0;

    // Cirlce alpha
    // float alpha = circle(gl_PointCoord, 1.0) * vAlpha * uAlpha * revealAlpha;
    float alpha = vAlpha * uAlpha * revealAlpha;

    // Output color
    gl_FragColor = vec4(diffuse, alpha);
    // gl_FragColor = vec4(1.0, 0., 0., 1.);
}
