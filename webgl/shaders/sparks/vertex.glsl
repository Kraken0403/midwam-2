#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float linewidth;
uniform vec2 resolution;
uniform float time;
uniform float radius;
uniform float progress;

attribute vec3 instanceStart;
attribute vec3 instanceEnd;

attribute vec3 instanceColorStart;
attribute vec3 instanceColorEnd;

attribute vec3 angle;
attribute float offset;
attribute float size;
attribute float speed;
attribute vec3 color;

varying vec2 vUv;
varying float vProgress;
varying vec3 vColor;

#ifdef WORLD_UNITS

    varying vec4 worldPos;
    varying vec3 worldStart;
    varying vec3 worldEnd;

#endif

#ifndef IS_BURST

    varying float vTotalProgress;

#endif

#ifdef USE_DASH

    uniform float dashScale;
    attribute float instanceDistanceStart;
    attribute float instanceDistanceEnd;
    varying float vLineDistance;

#endif

void trimSegment( const in vec4 start, inout vec4 end ) {

    // trim end segment so it terminates between the camera plane and the near plane

    // conservative estimate of the near plane
    float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
    float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
    float nearEstimate = - 0.5 * b / a;

    float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

    end.xyz = mix( start.xyz, end.xyz, alpha );

}

void main() {

    vColor = color;

    #ifdef USE_DASH

        vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

    #endif

    float aspect = resolution.x / resolution.y;

    vUv = uv;

    #ifndef IS_BURST

        float totalProgress = time * speed + offset;
        float progress = mod(totalProgress, 1.0);
        vTotalProgress = totalProgress;

    #endif

    float scaleProgress = 1.0;
    if (progress < 0.3) {
        scaleProgress = progress / 0.3;
    }

    vProgress = progress;

    float lineOffset = radius * progress;
    vec3 startPosition = instanceStart + (lineOffset - size * 0.5 * scaleProgress) * angle;
    vec3 endPostion = startPosition + size * scaleProgress * angle;

    // camera space
    vec4 start = modelViewMatrix * vec4( startPosition, 1.0 );
    vec4 end = modelViewMatrix * vec4( endPostion, 1.0 );

    #ifdef WORLD_UNITS

        worldStart = start.xyz;
        worldEnd = end.xyz;

    #endif

    // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
    // clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
    // but we need to perform ndc-space calculations in the shader, so we must address this issue directly
    // perhaps there is a more elegant solution -- WestLangley

    bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

    if ( perspective ) {

        if ( start.z < 0.0 && end.z >= 0.0 ) {

            // trimSegment( start, end );

        } else if ( end.z < 0.0 && start.z >= 0.0 ) {

            trimSegment( end, start );

        }

    }

    // clip space
    vec4 clipStart = projectionMatrix * start;
    vec4 clipEnd = projectionMatrix * end;

    // ndc space
    vec3 ndcStart = clipStart.xyz / clipStart.w;
    vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

    // direction
    vec2 dir = ndcEnd.xy - ndcStart.xy;

    // account for clip-space aspect ratio
    dir.x *= aspect;
    dir = normalize( dir );

    #ifdef WORLD_UNITS

        // get the offset direction as perpendicular to the view vector
        vec3 worldDir = normalize( end.xyz - start.xyz );
        vec3 offset;
        if ( position.y < 0.5 ) {

            offset = normalize( cross( start.xyz, worldDir ) );

        } else {

            offset = normalize( cross( end.xyz, worldDir ) );

        }

        // sign flip
        if ( position.x < 0.0 ) offset *= - 1.0;

        float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

        // don't extend the line if we're rendering dashes because we
        // won't be rendering the endcaps
        #ifndef USE_DASH

            // extend the line bounds to encompass  endcaps
            start.xyz += - worldDir * linewidth * 0.5;
            end.xyz += worldDir * linewidth * 0.5;

            // shift the position of the quad so it hugs the forward edge of the line
            offset.xy -= dir * forwardOffset;

        #endif

        // endcaps
        if ( position.y > 1.0 || position.y < 0.0 ) {

            offset.xy += dir * 2.0 * forwardOffset;

        }

        // adjust for linewidth
        offset *= linewidth * 0.5;

        // set the world position
        worldPos = ( position.y < 0.5 ) ? start : end;
        worldPos.xyz += offset;

        // project the worldpos
        vec4 clip = projectionMatrix * worldPos;

        // shift the depth of the projected points so the line
        // segements overlap neatly
        vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
        clip.z = clipPose.z * clip.w;

    #else

        // perpendicular to dir
        vec2 offset = vec2( dir.y, - dir.x );

        // undo aspect ratio adjustment
        dir.x /= aspect;
        offset.x /= aspect;

        // sign flip
        if ( position.x < 0.0 ) offset *= - 1.0;

        // endcaps
        if ( position.y < 0.0 ) {

            offset += - dir;

        } else if ( position.y > 1.0 ) {

            offset += dir;

        }

        // adjust for linewidth
        offset *= linewidth;

        // adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
        offset /= resolution.y;

        // select end
        vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

        // back to clip space
        offset *= clip.w;

        clip.xy += offset;

    #endif

    gl_Position = clip;

    vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <fog_vertex>
}
