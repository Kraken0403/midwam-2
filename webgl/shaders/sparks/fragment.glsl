uniform vec3 diffuse;
uniform float opacity;
uniform float globalAlpha;
uniform float linewidth;

#ifdef USE_DASH

uniform float dashSize;
uniform float gapSize;

#endif

varying float vLineDistance;

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vUv;
varying float vProgress;
varying vec3 vColor;

#ifndef IS_BURST

    varying float vTotalProgress;

#endif

varying vec4 worldPos;

#ifdef WORLD_UNITS
    varying vec3 worldStart;
    varying vec3 worldEnd;
#endif

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

    float mua;
    float mub;

    vec3 p13 = p1 - p3;
    vec3 p43 = p4 - p3;

    vec3 p21 = p2 - p1;

    float d1343 = dot( p13, p43 );
    float d4321 = dot( p43, p21 );
    float d1321 = dot( p13, p21 );
    float d4343 = dot( p43, p43 );
    float d2121 = dot( p21, p21 );

    float denom = d2121 * d4343 - d4321 * d4321;

    float numer = d1343 * d4321 - d1321 * d4343;

    mua = numer / denom;
    mua = clamp( mua, 0.0, 1.0 );
    mub = ( d1343 + d4321 * ( mua ) ) / d4343;
    mub = clamp( mub, 0.0, 1.0 );

    return vec2( mua, mub );

}

void main() {
    #include <clipping_planes_fragment>

    #ifdef USE_DASH

        if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

        if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

    #endif

    #ifdef WORLD_UNITS

        // Find the closest points on the view ray and the line segment
        vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
        vec3 lineDir = worldEnd - worldStart;
        vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

        vec3 p1 = worldStart + lineDir * params.x;
        vec3 p2 = rayEnd * params.y;
        vec3 delta = p1 - p2;
        float len = length( delta );
        float norm = len / linewidth;

        #ifndef USE_DASH

            if (norm > 0.5) discard;

        #endif

    #else

        if ( abs( vUv.y ) > 1.0 ) {

            float a = vUv.x;
            float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
            float len2 = a * a + b * b;

            if ( len2 > 1.0 ) discard;

        }

    #endif

    vec4 diffuseColor = vec4( vColor, opacity );

    #include <logdepthbuf_fragment>
    #include <color_fragment>

    float alpha = map(vProgress, 0.6, 1.0, 1.0, 0.0);

    #ifndef IS_BURST

        alpha = vTotalProgress < 1.0 ? 0.0 : alpha;

    #endif

    vec3 color = diffuseColor.rgb;

    gl_FragColor = vec4(color, alpha * globalAlpha);

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
}
