import { Plane } from '@react-three/drei'
import MetaverseFloor from './MetaverseFloor';
import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

function SkySphere() {
  const meshRef = useRef()
  const { size } = useThree()

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 glPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      
      // Skybox depth trick: Force the Z coordinate to be the same as W.
      // After perspective divide (z/w), this results in a depth of 1.0,
      // pushing it to the back and making it immune to the far clip plane.
      gl_Position = glPos.xyww;
    }
  `
  const fragmentShader = `
  precision highp float;

  varying vec3 vWorldPosition;

  uniform float uDensity;
  uniform float uVisibilityThreshold;
  uniform float uSeed;
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;
  uniform float uMinRadius;
  uniform float uMaxRadius;
  uniform vec3 uCameraPosition;

  const float PI = 3.141592653589793;

  float hash(vec2 p) { return fract(sin(dot(p + uSeed, vec2(127.1, 311.7))) * 43758.5453123); }
  vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + 1.0)); }

  // FRAGMENT SHADER FIX:
  // The function now takes 'tileUV' (a continuous coordinate) to avoid derivative
  // issues at the edges of the tiles created by fract().
  float billboardCircle(vec2 localUV, vec2 tileUV, vec2 center, float radius) {
    // We calculate the derivatives on the continuous 'tileUV' instead of the
    // discontinuous 'localUV'. This eliminates the seams.
    mat2 inv = mat2(dFdx(tileUV), dFdy(tileUV));
    inv = inverse(inv);

    // The rest of the logic remains the same.
    vec2 screenAlignedUV = inv * (localUV - center);
    float dist = length(screenAlignedUV);

    return smoothstep(radius, radius - 1.5, dist);
  }

  void main() {
    vec3 normal = normalize(vWorldPosition);
    float u = atan(normal.x, normal.z) / (2.0 * PI) + 0.5;
    float v = acos(normal.y) / PI;
    vec2 uv = vec2(u, v);

    vec2 tileUV = uv * uDensity;
    vec2 tileCoord = floor(tileUV);
    vec2 localUV = fract(tileUV);

    float seed = hash(tileCoord);
    float alpha = 0.0;
    if (seed > uVisibilityThreshold) {
      vec2 offs = (hash2(tileCoord + 13.7) - 0.5) * 0.6;
      vec2 center = 0.5 + offs;
      float r = mix(uMinRadius, uMaxRadius, hash(tileCoord + 4.2));
      
      // FRAGMENT SHADER FIX: Pass 'tileUV' to the updated function.
      alpha = billboardCircle(localUV, tileUV, center, r);
    }

    vec3 viewDir = normalize(vWorldPosition - uCameraPosition);
    float h = (viewDir.y + 0.5) / 2.0;
    vec3 bg = mix(uColorBottom, uColorTop, h);

    vec3 col = mix(bg, vec3(1.0), alpha);
    gl_FragColor = vec4(col, 1.0);
  }
`

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <sphereGeometry args={[1000, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={{
          uDensity: { value: 40.0 },
          uVisibilityThreshold: { value: 0.8 },
          uSeed: { value: 11.45 },
          uColorTop: { value: new THREE.Color(0.0, 0.737, 0.831) },
          uColorBottom: { value: new THREE.Color(0.914, 0.118, 0.388) },
          uMinRadius: { value: 1.0 },
          uMaxRadius: { value: 5.0 },
          uCameraPosition: { value: new THREE.Vector3() },
        }}

      />
    </mesh>
  )
}

export default function NonPlayers() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 30, 30]} intensity={0.5} />
      <directionalLight position={[-30, 30, -30]} intensity={0.5} />
      <SkySphere />
      <MetaverseFloor />
    </>
  )
}
