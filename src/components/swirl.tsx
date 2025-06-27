import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useLoader, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

export function Swirl(props) {
  const { scene } = useGLTF('/models/swirl2.glb')
  const texture = useLoader(THREE.TextureLoader, '/textures/checkerboard.png')
  const swirlRef = useRef<THREE.Mesh>(null)
  const speed = 0.2
  const basePositions = useRef<Float32Array | null>(null)

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(100, 100)

  const textureRef = useRef(texture)

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        })

        // Bewaar originele posities als referentie
        const posAttr = child.geometry.attributes.position
        basePositions.current = posAttr.array.slice() // kopie maken
      }
    })
  }, [scene, texture])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (textureRef.current) {
      textureRef.current.offset.x = (t * speed) % 1
      // textureRef.current.offset.y = ((t * speed) % 1)/2
    }

    scene.traverse((child) => {
      if (!child.isMesh) return

      const geometry = child.geometry
      const pos = geometry.attributes.position

      if (!basePositions.current) return

      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3
        const x = basePositions.current[ix]
        const y = basePositions.current[ix + 1]
        const z = basePositions.current[ix + 2]

        // Golfbeweging over y gebaseerd op x en tijd
        pos.array[ix + 1] = y + Math.sin(x * 1.2 + t * 2) * 0.03
      }

      pos.needsUpdate = true
    })
  })

  return <primitive ref={swirlRef} object={scene} {...props} />
}