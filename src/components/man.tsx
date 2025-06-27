'use client'

import { forwardRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export const Man = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { scene } = useGLTF('/models/man.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: 'black' })
        child.layers.enable(1)
      }
    })
  }, [scene])

  if (!scene) return null

  return (
    <group ref={ref} {...props}>
      <primitive object={scene} />
    </group>
  )
})


// import * as THREE from 'three'
// import { useGLTF } from '@react-three/drei'
//
// const vertexShader = `
// varying vec3 vNormal;
// varying vec3 vViewPosition;
//
// void main() {
//   vNormal = normalize(normalMatrix * normal);
//   vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//   vViewPosition = -mvPosition.xyz;
//   gl_Position = projectionMatrix * mvPosition;
// }
// `
//
// const fragmentShader = `
// varying vec3 vNormal;
// varying vec3 vViewPosition;
//
// vec3 hsv2rgb(vec3 c) {
//   vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);
//   return c.z * mix(vec3(1.0), rgb, c.y);
// }
//
// void main() {
//   float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 3.0);
//   vec3 glow = hsv2rgb(vec3(fresnel * 2.0, 1.0, 1.0));
//   gl_FragColor = vec4(glow * fresnel, fresnel);
// }
// `
//
// export function Man(props) {
//   const { scene } = useGLTF('/models/man.glb')
//
//   scene.traverse((child) => {
//     if (child.isMesh) {
//       // child.material = new THREE.MeshStandardMaterial({ color: 'black' })
//       child.material = new THREE.ShaderMaterial({
//       vertexShader: vertexShader,
//       fragmentShader: fragmentShader,
//       uniforms: {
//         time: { value: 0 },
//         viewVector: { value: new THREE.Vector3() }
//       },
//       side: THREE.FrontSide,
//       transparent: true
//     })
//     }
//   })
//
//   return <primitive object={scene} {...props} />
// }