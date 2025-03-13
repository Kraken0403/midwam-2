// Vendor
import gsap from 'gsap';
import { MeshStandardMaterial, Vector3, Euler, Matrix4, Texture, PMREMGenerator, sRGBEncoding, Color } from 'three';
import { component } from '@/vendor/bidello';

// Objects
import EnvironmentMap from '@/webgl/objects/EnvironmentMap';

// Utils
import ResourceLoader from '@/utils/ResourceLoader';
import Debugger from '@/utils/Debugger';

export default class ReflectiveMaterial extends component(MeshStandardMaterial) {
    constructor({ renderer, debugGui, thickness = 0, normalNoiseStrength = 0 }, materialOptions) {
        super(materialOptions);

        // Props
        this._renderer = renderer;
        this._thickness = thickness;

        this._normalNoiseScale = 0;
        this._normalNoiseOffsetSpeed = 0;
        this._normalNoiseStrength = normalNoiseStrength; // 1.68;
        this._normalNoiseSpeed = 0;

        this._blendColor = new Color(0xc1ff71);
        this._blendColorStrength = 0;

        this._envMapRotationZSpeed = 0.0024;

        // this.wireframe = true;
        this.transparent = true;

        // Data
        this._envMapRotation = new Euler(0, 4.67, 0);

        // Material props
        this.userData.uniforms = this._createUniforms();
        this.envMap = EnvironmentMap.texture;

        // Debug
        this._debugGui = this._createDebugGui(debugGui);
    }

    /**
     * Getters & Setters
     */
    get envMapRotationZSpeed() {
        return this._envMapRotationZSpeed;
    }

    set envMapRotationZSpeed(value) {
        this._envMapRotationZSpeed = value;
    }

    get blendColorStrength() {
        return this._blendColorStrength;
    }

    set blendColorStrength(value) {
        this._blendColorStrength = value;
        this.userData.uniforms.uBlendColorStrength.value = this._blendColorStrength;
    }

    /**
     * Public
     */
    onUpdate({ time }) {
        this.userData.uniforms.uTime.value = time;

        this._envMapRotation.z += this._envMapRotationZSpeed;
        this.userData.uniforms.uEnvMapRotation.value.makeRotationFromEuler(this._envMapRotation);
    }

    onBeforeCompile(shader) {
        shader.uniforms = Object.assign(shader.uniforms, this.userData.uniforms);

        // console.log(shader.vertexShader);

        const vertexShaderUniforms = `
            uniform float uThickness;
        `;

        shader.vertexShader = vertexShaderUniforms + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <uv_pars_vertex>',
            `
                varying vec2 vUv;
            `
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
                vec3 pos = position;
                pos += uThickness * normal;
                vec3 transformed = vec3( pos );

                vUv = uv;
            `
        );

        const fragmentShaderUniforms = `
            uniform mat4 uEnvMapRotation;
            // uniform vec3 uFunk;
            uniform float uTime;
            uniform vec3 uEmissiveColor;

            uniform float uNormalNoiseScale;
            uniform float uNormalNoiseOffsetSpeed;
            uniform float uNormalNoiseStrength;
            uniform float uNormalNoiseSpeed;

            uniform vec3 uBlendColor;
            uniform float uBlendColorStrength;

            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
              }

              vec4 mod289(vec4 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
              }

              vec4 permute(vec4 x) {
                   return mod289(((x*34.0)+1.0)*x);
              }

              vec4 taylorInvSqrt(vec4 r)
              {
                return 1.79284291400159 - 0.85373472095314 * r;
              }

              float snoise(vec3 v)
                {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

              // First corner
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 =   v - i + dot(i, C.xxx) ;

              // Other corners
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );

                //   x0 = x0 - 0.0 + 0.0 * C.xxx;
                //   x1 = x0 - i1  + 1.0 * C.xxx;
                //   x2 = x0 - i2  + 2.0 * C.xxx;
                //   x3 = x0 - 1.0 + 3.0 * C.xxx;
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
                vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

              // Permutations
                i = mod289(i);
                vec4 p = permute( permute( permute(
                           i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                         + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                         + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

              // Gradients: 7x7 points over a square, mapped onto an octahedron.
              // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
                float n_ = 0.142857142857; // 1.0/7.0
                vec3  ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );

                //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
                //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);

              //Normalise gradients
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

              // Mix final noise value
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                              dot(p2,x2), dot(p3,x3) ) );
                }
        `;

        shader.fragmentShader = fragmentShaderUniforms + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <envmap_physical_pars_fragment>',
            `
                #if defined( USE_ENVMAP )

                    #ifdef ENVMAP_MODE_REFRACTION
                        uniform float refractionRatio;
                    #endif

                    vec3 getLightProbeIndirectIrradiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel ) {

                        vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );

                        #ifdef ENVMAP_TYPE_CUBE

                            vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );

                            // TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
                            // of a specular cubemap, or just the default level of a specially created irradiance cubemap.

                            #ifdef TEXTURE_LOD_EXT

                                vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );

                            #else

                                // force the bias high to get the last LOD level as it is the most blurred.
                                vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );

                            #endif

                            envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

                        #elif defined( ENVMAP_TYPE_CUBE_UV )

                            vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );

                        #else

                            vec4 envMapColor = vec4( 0.0 );

                        #endif

                        return PI * envMapColor.rgb * envMapIntensity;
                        // return vec3(0.0, 0.0, 1.0);

                    }

                    // Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
                    float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {

                        float maxMIPLevelScalar = float( maxMIPLevel );

                        float sigma = PI * roughness * roughness / ( 1.0 + roughness );
                        float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

                        // clamp to allowable LOD ranges.
                        return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

                    }

                    vec3 getLightProbeIndirectRadiance( /*const in SpecularLightProbe specularLightProbe,*/ const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {

                        #ifdef ENVMAP_MODE_REFLECTION

                        vec3 n = normal;
                        // n += vec3(abs(snoise(n * 1.1 + uTime * 0.1))) * 0.1;

                        vec3 reflectVec = reflect( -viewDir, n );

                        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
                        reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

                        #else

                        vec3 reflectVec = refract( -viewDir, normal, refractionRatio );

                        #endif

                        reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

                        float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );

                        #ifdef ENVMAP_TYPE_CUBE

                            vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );

                            #ifdef TEXTURE_LOD_EXT

                                vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );

                            #else

                                vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );

                            #endif

                            envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

                        #elif defined( ENVMAP_TYPE_CUBE_UV )

                            vec3 reflectVecTransformed = (uEnvMapRotation * vec4(reflectVec, 0.0)).xyz;
                            // reflectVecTransformed += uFunk; // FUNK

                            vec4 envMapColor = textureCubeUV( envMap, reflectVecTransformed, roughness );

                        #elif defined( ENVMAP_TYPE_EQUIREC )

                            vec2 sampleUV = equirectUv( reflectVec );

                            #ifdef TEXTURE_LOD_EXT

                                vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );

                            #else

                                vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );

                            #endif

                            envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

                        #endif

                        return envMapColor.rgb * envMapIntensity;

                    }

                #endif
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <cube_uv_reflection_fragment>',
            `
                #ifdef ENVMAP_TYPE_CUBE_UV

                #define cubeUV_maxMipLevel 8.0
                #define cubeUV_minMipLevel 4.0
                #define cubeUV_maxTileSize 256.0
                #define cubeUV_minTileSize 16.0

                // These shader functions convert between the UV coordinates of a single face of
                // a cubemap, the 0-5 integer index of a cube face, and the direction vector for
                // sampling a textureCube (not generally normalized ).

                float getFace( vec3 direction ) {

                    vec3 absDirection = abs( direction );

                    float face = - 1.0;

                    if ( absDirection.x > absDirection.z ) {

                        if ( absDirection.x > absDirection.y )

                            face = direction.x > 0.0 ? 0.0 : 3.0;

                        else

                            face = direction.y > 0.0 ? 1.0 : 4.0;

                    } else {

                        if ( absDirection.z > absDirection.y )

                            face = direction.z > 0.0 ? 2.0 : 5.0;

                        else

                            face = direction.y > 0.0 ? 1.0 : 4.0;

                    }

                    return face;

                }

                // RH coordinate system; PMREM face-indexing convention
                vec2 getUV( vec3 direction, float face ) {

                    vec2 uv;

                    if ( face == 0.0 ) {

                        uv = vec2( direction.z, direction.y ) / abs( direction.x ); // pos x

                    } else if ( face == 1.0 ) {

                        uv = vec2( - direction.x, - direction.z ) / abs( direction.y ); // pos y

                    } else if ( face == 2.0 ) {

                        uv = vec2( - direction.x, direction.y ) / abs( direction.z ); // pos z

                    } else if ( face == 3.0 ) {

                        uv = vec2( - direction.z, direction.y ) / abs( direction.x ); // neg x

                    } else if ( face == 4.0 ) {

                        uv = vec2( - direction.x, direction.z ) / abs( direction.y ); // neg y

                    } else {

                        uv = vec2( direction.x, direction.y ) / abs( direction.z ); // neg z

                    }

                    return 0.5 * ( uv + 1.0 );

                }

                vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {

                    float face = getFace( direction );

                    float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );

                    mipInt = max( mipInt, cubeUV_minMipLevel );

                    float faceSize = exp2( mipInt );

                    float texelSize = 1.0 / ( 3.0 * cubeUV_maxTileSize );

                    vec2 uv = getUV( direction, face ) * ( faceSize - 1.0 );

                    vec2 f = fract( uv );

                    uv += 0.5 - f;

                    if ( face > 2.0 ) {

                        uv.y += faceSize;

                        face -= 3.0;

                    }

                    uv.x += face * faceSize;

                    if ( mipInt < cubeUV_maxMipLevel ) {

                        uv.y += 2.0 * cubeUV_maxTileSize;

                    }

                    uv.y += filterInt * 2.0 * cubeUV_minTileSize;

                    uv.x += 3.0 * max( 0.0, cubeUV_maxTileSize - 2.0 * faceSize );


                    // uv *= snoise(vec3(vec2(uv * 10.5), uTime * 0.1));

                    uv *= texelSize;

                    vec3 tl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;

                    uv.x += texelSize;

                    vec3 tr = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;

                    uv.y += texelSize;

                    vec3 br = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;

                    uv.x -= texelSize;

                    vec3 bl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;

                    vec3 tm = mix( tl, tr, f.x );

                    vec3 bm = mix( bl, br, f.x );

                    return mix( tm, bm, f.y );

                }

                // These defines must match with PMREMGenerator

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

                float roughnessToMip( float roughness ) {

                    float mip = 0.0;

                    if ( roughness >= r1 ) {

                        mip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;

                    } else if ( roughness >= r4 ) {

                        mip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;

                    } else if ( roughness >= r5 ) {

                        mip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;

                    } else if ( roughness >= r6 ) {

                        mip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;

                    } else {

                        mip = - 2.0 * log2( 1.16 * roughness ); // 1.16 = 1.79^0.25
                    }

                    return mip;

                }

                vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {

                    float mip = clamp( roughnessToMip( roughness ), m0, cubeUV_maxMipLevel );

                    float mipF = fract( mip );

                    float mipInt = floor( mip );

                    vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );

                    if ( mipF == 0.0 ) {

                        return vec4( color0, 1.0 );

                    } else {

                        vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );

                        return vec4( mix( color0, color1, mipF ), 1.0 );

                    }

                }

            #endif

            float blendDarken(float base, float blend) {
                return min(blend,base);
            }

            vec3 blendDarken(vec3 base, vec3 blend) {
                return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
            }

            vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
                return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
            }

            float blendOverlay(float base, float blend) {
                return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
            }

            vec3 blendOverlay(vec3 base, vec3 blend) {
                return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
            }

            vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
                return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
            }
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <uv_pars_fragment>',
            `
                varying vec2 vUv;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <normal_fragment_begin>',
            `
            #ifdef FLAT_SHADED

                // Workaround for Adreno/Nexus5 not able able to do dFdx( vViewPosition ) ...

                vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
                vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
                vec3 normal = normalize( cross( fdx, fdy ) );

            #else

                vec3 normal = normalize( vNormal );

                vec2 nUv = vUv;
                nUv.x += uTime * uNormalNoiseOffsetSpeed;
                nUv *= uNormalNoiseScale;

                // float noise = (1.0 + snoise(vec3(nUv, uTime * uNormalNoiseSpeed))) / 2.0;
                float noise = abs(snoise(vec3(nUv, uTime * uNormalNoiseSpeed)));
                normal.x += noise * uNormalNoiseStrength;
                normal.y += noise * uNormalNoiseStrength;
                normal.z += noise * uNormalNoiseStrength;

                #ifdef DOUBLE_SIDED

                    normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

                #endif

                #ifdef USE_TANGENT

                    vec3 tangent = normalize( vTangent );
                    vec3 bitangent = normalize( vBitangent );

                    #ifdef DOUBLE_SIDED

                        tangent = tangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
                        bitangent = bitangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

                    #endif

                    #if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )

                        mat3 vTBN = mat3( tangent, bitangent, normal );

                    #endif

                #endif

            #endif

            // non perturbed normal for clearcoat among others

            vec3 geometryNormal = normal;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
            `
                vec3 blendedColor = blendOverlay(outgoingLight, uBlendColor, uBlendColorStrength);
                gl_FragColor = vec4( blendedColor, diffuseColor.a );
            `
        );
    }

    /**
     * Private
     */
    _createUniforms() {
        const envMapRotationMatrix = new Matrix4();
        envMapRotationMatrix.makeRotationFromEuler(this._envMapRotation);

        return {
            uEnvMapRotation: { value: envMapRotationMatrix },
            // uFunk: { value: new Vector3() },
            uTime: { value: 0 },
            uThickness: { value: this._thickness },
            uNormalNoiseScale: { value: this._normalNoiseScale },
            uNormalNoiseSpeed: { value: this._normalNoiseSpeed },
            uNormalNoiseOffsetSpeed: { value: this._normalNoiseOffsetSpeed },
            uNormalNoiseStrength: { value: this._normalNoiseStrength },
            uBlendColor: { value: this._blendColor },
            uBlendColorStrength: { value: this._blendColorStrength },
        };
    }

    /**
     * Debug
     */
    _createDebugGui(gui) {
        if (!gui) return;

        const params = {
            color: this.color.getHex(),
            emissive: this.emissive.getHex(),
            blendColor: this._blendColor.getHex(),
        };

        const folder = gui.addFolder('ReflectiveMaterial');
        folder.addColor(params, 'color').onChange(() => {
            this.color = new Color(params.color);
        });
        folder.addColor(params, 'emissive').onChange(() => {
            this.emissive = new Color(params.emissive);
        });
        folder.add(this, 'roughness', 0, 1, 0.01);
        folder.add(this, 'metalness', 0, 1, 0.01);
        folder.add(this, 'envMapIntensity', 0, 5, 0.01);
        folder.add(this, 'emissiveIntensity', 0, 5, 0.001);
        folder.add(this, '_envMapRotationZSpeed', 0, 0.1, 0.0001).name('envMapRotationZSpeed');
        folder
            .add(this._envMapRotation, 'x', 0, Math.PI * 2, 0.01)
            .name('envMapRotationX')
            .onChange(() => {
                this.userData.uniforms.uEnvMapRotation.value.makeRotationFromEuler(this._envMapRotation);
            });
        folder
            .add(this._envMapRotation, 'y', 0, Math.PI * 2, 0.01)
            .name('envMapRotationY')
            .onChange(() => {
                this.userData.uniforms.uEnvMapRotation.value.makeRotationFromEuler(this._envMapRotation);
            });
        folder
            .add(this._envMapRotation, 'z', 0, Math.PI * 2, 0.01)
            .name('envMapRotationZ')
            .onChange(() => {
                this.userData.uniforms.uEnvMapRotation.value.makeRotationFromEuler(this._envMapRotation);
            });
        // folder.add(this.userData.uniforms.uFunk.value, 'x', 0, 20, 0.01).name('funkX');
        // folder.add(this.userData.uniforms.uFunk.value, 'y', 0, 20, 0.01).name('funkY');
        // folder.add(this.userData.uniforms.uFunk.value, 'z', 0, 20, 0.01).name('funkZ');
        folder.add(this.userData.uniforms.uThickness, 'value', 0, 1, 0.001).name('thickness');
        folder.add(this.userData.uniforms.uNormalNoiseScale, 'value', 0, 500, 0.1).name('normal noise scale');
        folder.add(this.userData.uniforms.uNormalNoiseOffsetSpeed, 'value', 0, 1, 0.001).name('normal noise offset speed');
        folder.add(this.userData.uniforms.uNormalNoiseStrength, 'value', 0, 20, 0.01).name('normal noise strength');
        folder.add(this.userData.uniforms.uNormalNoiseSpeed, 'value', 0, 1, 0.001).name('normal noise speed');
        folder
            .addColor(params, 'blendColor')
            .onChange(() => {
                this.userData.uniforms.uBlendColor.value = new Color(params.blendColor);
            })
            .name('blend color');
        folder.add(this.userData.uniforms.uBlendColorStrength, 'value', 0, 1, 0.01).name('blend color strength');
        // folder.open();

        return folder;
    }
}
