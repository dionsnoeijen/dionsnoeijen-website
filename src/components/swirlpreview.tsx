'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function generateRibbonGeometry(points: THREE.Vector3[]) {
  const positions: number[] = []
  const indices: number[] = []

  const width = 0.2

  let prevLeft: THREE.Vector3 | null = null
  let prevRight: THREE.Vector3 | null = null

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]

    const dir = p2.clone().sub(p1).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const side = new THREE.Vector3().crossVectors(dir, up).normalize()

    const w = width * (Math.sin(i * 0.3) * 0.5 + 1)
    const left = p1.clone().add(side.clone().multiplyScalar(w))
    const right = p1.clone().add(side.clone().multiplyScalar(-w))

    if (prevLeft && prevRight) {
      const base = positions.length / 3
      positions.push(...prevLeft.toArray(), ...prevRight.toArray(), ...left.toArray())
      positions.push(...left.toArray(), ...prevRight.toArray(), ...right.toArray())
      indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3)
    }

    prevLeft = left
    prevRight = right
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

export default function SwirlPreview() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const pointsRef = useRef<THREE.Vector3[]>([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, -1),
    new THREE.Vector3(0, 2, -2),
    new THREE.Vector3(-1, 3, -1),
    new THREE.Vector3(0, 4, 0),
  ])

  useFrame(({ clock }) => {
    // const t = clock.getElapsedTime()
    //
    // // Simpele vervorming
    // pointsRef.current[1].x = Math.sin(t)
    // pointsRef.current[3].y = 3 + Math.sin(t * 0.5)

    const newCurve = new THREE.CatmullRomCurve3(pointsRef.current)
    const newPoints = newCurve.getPoints(100)
    const geo = generateRibbonGeometry(newPoints)

    meshRef.current.geometry = geo
    // if (meshRef.current) {
    //   meshRef.current.geometry.dispose()
    //   meshRef.current.geometry = geo
    // }
  })

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial color="cyan" side={THREE.DoubleSide} />
    </mesh>
  )
}