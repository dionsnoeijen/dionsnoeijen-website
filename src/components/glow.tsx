'use client'

import {useFrame, useThree} from '@react-three/fiber'
import * as THREE from 'three'
import {useMemo, useRef} from 'react'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
varying vec2 vUv;

#define PI 3.14159265359

void main() {
  vec2 uv = vUv - 0.5;
  uv *= vec2(iResolution.x / iResolution.y, 1.0);

  // 🔁 Lichte wobbel op UV
  float wobble = sin(iTime * 2.0 + uv.y * 10.0) * 0.01;
  uv.x += wobble;
  uv.y += sin(iTime * 1.5 + uv.x * 8.0) * 0.01;

  float len = length(uv);
  float angle = atan(uv.y, uv.x);

      // 🌈 Regenboogkleur (basis)
      float hue = angle + iTime * 0.3;
      vec3 color = vec3(
        0.5 + 0.5 * sin(hue),
        0.5 + 0.5 * sin(hue + 2.0),
        0.5 + 0.5 * sin(hue + 4.0)
      );

    // 🌀 Meerdere stralen met eigen snelheid & lengte
    float beamCount = 24.0;
vec3 beamColor = vec3(1.2, 0.9, 1.6);

for (float i = 0.0; i < beamCount; i++) {
  float fi = i / beamCount;
  float angleOffset = fi * PI * 2.0;

  float offset = i * 42.123;
  float speed = 0.3 + fract(sin(offset) * 1.0);
  float timeShift = iTime * speed + offset;

  // Dynamische richting (angle) en straallengte (radius)
  float beamAngle = angleOffset + sin(timeShift) * 0.2;
  float beamLength = 0.25 + 0.2 * sin(timeShift * 1.3 + 3.0);

  // Hoek-afstand (dun over hoek)
  float angleDiff = angle - beamAngle;
  angleDiff = mod(angleDiff + PI, PI * 2.0) - PI;
  float angleFalloff = exp(-pow(abs(angleDiff * beamCount), 1.0)); // soft oval width

  // Radius-falloff (langgerekt over radius)
  float radiusFalloff = exp(-pow((len - beamLength), 3.0) * 40.0);

  // Combineer tot 1 soft oval beam
  float beam = angleFalloff * radiusFalloff;

  color += beamColor * beam * 0.4; // zachter
}

  // 💡 Soft inner core
  float core = smoothstep(0.15, 0.0, len);
  color += vec3(1.0, 0.9, 1.2) * core * 0.5;

  // 🔥 Glow aan rand
  float glow = smoothstep(0.4, 0.1, len);

  // 🌫️ Alpha fade-out
  float alpha = smoothstep(0.4, 0.2, len);

  gl_FragColor = vec4(color * glow * 3.0, alpha * glow);
}
`

export function Glow() {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const {size} = useThree()

    const uniforms = useMemo(() => ({
        iTime: {value: 0},
        iResolution: {value: new THREE.Vector2(size.width, size.height)},
    }), [size])

    useFrame((state) => {
        uniforms.iTime.value = state.clock.getElapsedTime()
    })

    return (
        <mesh ref={meshRef} position={[0, 0, -.4]}>
            <planeGeometry args={[4, 4]}/>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}