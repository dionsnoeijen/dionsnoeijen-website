'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'

const vertexShader = `
  varying vec2 vUv;
void main() {
  vUv = uv; // ← deze lijn is cruciaal
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
  uniform float iTime;
uniform vec2 iResolution;
uniform vec3 camDir;
varying vec2 vUv;

#define iterations 10
#define formuparam 0.53
#define volsteps 20
#define stepsize 0.1
#define zoom 8.0
#define tile 0.85
#define speed 0.0002
#define brightness 0.0015
#define darkmatter 0.3
#define distfading 0.73
#define saturation 0.85

void main() {
  vec2 uv = vUv - 0.5;
  uv.y *= iResolution.y / iResolution.x;

  vec3 dir = normalize(camDir + vec3(uv * zoom, 0.0));
  float time = iTime * speed + 0.25;

  vec3 from = vec3(time * 2.0, time, -2.0);

  float s = 0.1, fade = 1.0;
  vec3 v = vec3(0.0);

  for (int r = 0; r < volsteps; r++) {
    vec3 p = from + s * dir * 0.5;
    p = abs(vec3(tile) - mod(p, vec3(tile * 2.0)));

    float a = 0.0;
    float pa = 0.0;
    for (int i = 0; i < iterations; i++) {
      p = abs(p) / dot(p, p) - formuparam;
      a += abs(length(p) - pa);
      pa = length(p);
    }

    float dm = max(0.0, darkmatter - a * a * 0.001);
    a *= a * a;
    if (r > 6) fade *= 1.0 - dm;

    v += fade;
    v += vec3(s, s * s, s * s * s * s) * a * brightness * fade;
    fade *= distfading;
    s += stepsize;
  }

  v = mix(vec3(length(v)), v, saturation);
  // v *= vec3(1.4, 1.0, 0.5);
  v *= vec3(1.3, 0.6, 2.0);
  //v *= vec3(0.2, 0.2, 0.5);
  // v *= vec3(1.2, 0.7, 1.5);
  gl_FragColor = vec4(v * 0.01, 1.0);
}
`

export function StarNestBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()

  const uniforms = useMemo(() => ({
  iTime: { value: 0 },
  iResolution: { value: new THREE.Vector2(size.width, size.height) },
  camDir: { value: new THREE.Vector3() },
}), [size])

useFrame((state) => {
  uniforms.iTime.value = state.clock.getElapsedTime()
  camera.getWorldDirection(uniforms.camDir.value)

  if (meshRef.current) {
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    meshRef.current.position.copy(camera.position).add(dir.multiplyScalar(5))
    meshRef.current.quaternion.copy(camera.quaternion)
  }
})

  return (
    <mesh ref={meshRef} renderOrder={-100}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}