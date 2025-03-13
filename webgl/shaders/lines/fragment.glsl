uniform vec3 diffuse;
uniform float linewidth;
uniform bool noisyLines;
uniform float revealProgress;
uniform vec3 specular;
uniform vec3 emissive;
uniform float specularStrength;
uniform float shininess;
uniform float alpha;

#ifdef USE_DASH
    uniform float dashSize;
    uniform float gapSize;
#endif

varying float vLineDistance;
varying vec4 worldPos;

#ifdef WORLD_UNITS
    varying vec3 worldStart;
    varying vec3 worldEnd;
#endif

#include <common>
#include <bsdfs>
#include <color_pars_fragment>
// #include <fog_pars_fragment>
#include <clipping_planes_pars_fragment>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>

varying vec2 vUv;

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

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void RE_Direct_BlinnPhong_Custom( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

    float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
    vec3 irradiance = directLight.color;

    #ifndef PHYSICALLY_CORRECT_LIGHTS

        irradiance *= PI; // punctual light

    #endif

    reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

    reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void main() {

    #include <clipping_planes_fragment>
    #include <normal_fragment_begin>

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

    vec4 diffuseColor = vec4(diffuse, 1.0);
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    float specularStrength = 1.0;

    // accumulation
    #include <lights_phong_fragment>

    GeometricContext geometry;

    geometry.position = - vViewPosition;
    geometry.normal = normal;
    geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

    #ifdef CLEARCOAT

        geometry.clearcoatNormal = clearcoatNormal;

    #endif

    IncidentLight directLight;

    #if ( NUM_POINT_LIGHTS > 0 )

        PointLight pointLight;

        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

            pointLight = pointLights[ i ];

            getPointDirectLightIrradiance( pointLight, geometry, directLight );

            RE_Direct_BlinnPhong_Custom( directLight, geometry, material, reflectedLight );

        }
        #pragma unroll_loop_end

    #endif

    #if defined( RE_IndirectDiffuse )

        vec3 iblIrradiance = vec3( 0.0 );

        vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

    #endif

    #if defined( RE_IndirectSpecular )

        vec3 radiance = vec3( 0.0 );
        vec3 clearcoatRadiance = vec3( 0.0 );

    #endif

    #include <lights_fragment_end>

    float outputAlpha = 1.0;
    if (noisyLines) outputAlpha = random(vUv);

    float y = 1.0 - (1.0 + vUv.y) / 2.0;
    float revealAlpha = revealProgress > y ? 1.0 : 0.0;
    outputAlpha *= revealAlpha;

    #ifdef SHOW_LIGHTS

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        // vec3 outgoingLight = totalEmissiveRadiance;
        gl_FragColor = vec4(outgoingLight, outputAlpha * alpha);

    #else

        gl_FragColor = vec4(diffuseColor.rgb, outputAlpha * alpha);

    #endif

    // #include <premultiplied_alpha_fragment>
    // #include <tonemapping_fragment>
    // #include <encodings_fragment>
    // #include <fog_fragment>
}
