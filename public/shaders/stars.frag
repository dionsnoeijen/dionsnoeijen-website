import { useLoader } from '@react-three/fiber'
import { ShaderMaterial, Vector2 } from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const vertexShader = ` // basic passthrough
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export function StarNestBackground() {
  const materialRef = useRef()

  const fragmentShader = useLoader(
    // als je via raw-loader of fs inlaadt:
    // RawShaderLoader or inline string hieronder
    () => fetch('/shaders/starNest.frag').then(r => r.text()),
    []
  )

  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    iMouse: { value: new Vector2(0, 0) }
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}