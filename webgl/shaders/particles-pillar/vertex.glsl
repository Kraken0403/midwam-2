attribute vec3 aStartPosition;
attribute vec3 aEndPosition;
attribute float aOffset;
attribute vec3 aNormal;
attribute float aSize;
attribute float aSpeed;
attribute float aAlpha;

uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uRotation;

varying float vAlpha;
varying float vProgress;
varying vec3 vSurfaceNormal;
varying vec3 vToLightVector;

#define PI 3.141592653589793

vec3 rotateVector(vec4 q, vec3 v) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {
    float halfAngle = angle * 0.5;
    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main() {

    // Progress
    float progress = mod(uTime * uSpeed * aSpeed + aOffset, 1.0) / 1.0;

    // Interpolate between start and end value
    vec3 position = mix(aStartPosition, aEndPosition, progress);

    // Rotation
    position = rotateVector(quatFromAxisAngle(vec3(0, 1, 0), PI * 2.0 * -progress), position);

    // mvPostion
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Position output
    gl_Position = projectionMatrix * mvPosition;

    // Point size
    gl_PointSize = uSize * aSize;
    gl_PointSize *= (1.0 / -mvPosition.z);

    // Particle light
    mat4 rotationMatrix = rotationMatrix(vec3(1.0), uRotation);
    vec3 lightPosition = vec3(0.0, position.y, 0.0);
    vSurfaceNormal = (rotationMatrix * vec4(aNormal, 0.0)).xyz;
    vToLightVector = lightPosition - position;

    // Shared values
    vAlpha = aAlpha;
    vProgress = progress;
}
