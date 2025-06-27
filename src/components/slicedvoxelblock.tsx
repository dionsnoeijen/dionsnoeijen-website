import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useRef, useEffect } from 'react';

const TILE_SIZE = 1.0;
const TILE_COUNT = 10;
const SLICE_COUNT = 5;
const SLICE_HEIGHT = 0.2;

function SlicedVoxelBlock() {
  const meshRef = useRef();
  const { clock } = useThree();

  useFrame(() => {
    const shader = meshRef.current.material.userData.shader;
    if (shader) {
      shader.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const verts = [];
    const idxs = [];
    const sliceHeights = Array.from({ length: SLICE_COUNT + 1 }, (_, i) => i * SLICE_HEIGHT);

    let offset = 0;

    for (let x = 0; x < TILE_COUNT; x++) {
      for (let y = 0; y < TILE_COUNT; y++) {
        for (let s = 0; s < SLICE_COUNT; s++) {
          const zLow = 0.0;
          const zHigh = sliceHeights[s + 1];
          const baseX = x * TILE_SIZE;
          const baseY = y * TILE_SIZE;

          // 4 vertices per slice corner (bottom to top vertically extruded)
          verts.push(
            baseX, baseY, zLow,
            baseX + TILE_SIZE, baseY, zLow,
            baseX + TILE_SIZE, baseY + TILE_SIZE, zLow,
            baseX, baseY + TILE_SIZE, zLow,
            baseX, baseY, zHigh,
            baseX + TILE_SIZE, baseY, zHigh,
            baseX + TILE_SIZE, baseY + TILE_SIZE, zHigh,
            baseX, baseY + TILE_SIZE, zHigh
          );

          // side faces
          const faces = [
            [0, 1, 5, 4],
            [1, 2, 6, 5],
            [2, 3, 7, 6],
            [3, 0, 4, 7]
          ];

          faces.forEach(([a, b, c, d]) => {
            idxs.push(offset + a, offset + b, offset + d);
            idxs.push(offset + b, offset + c, offset + d);
          });

          offset += 8;
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geometry.setIndex(idxs);
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;

    // Setup dummy shader uniform to animate if needed later
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      material.userData.shader = shader;
    };
  }, []);

  return <mesh ref={meshRef} position={[-TILE_COUNT * 0.5, -TILE_COUNT * 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} />;
}

export default function SliceTestScene() {
  return (
    <Canvas style={{ background: 'black' }} camera={{ position: [0, 20, 40], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <SlicedVoxelBlock />
      <OrbitControls enableZoom enableRotate enablePan />
      <Stats />
    </Canvas>
  );
}
