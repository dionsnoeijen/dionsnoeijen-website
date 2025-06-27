'use client'

import {Canvas} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'
import {Man} from '@/components/man'
import {Swirl} from '@/components/swirl'
import {StarNestBackground} from '@/components/startnest'
import {useRef} from 'react'
import * as THREE from 'three'
import {EffectComposer, Outline, ToneMapping} from '@react-three/postprocessing'
import {BlendFunction, ToneMappingMode, KernelSize} from 'postprocessing'
import {CameraControlPanel} from "@/components/cameracontrolpanel";
import {Glow} from "@/components/glow";

export default function Scene() {
    const controlsRef = useRef()
    const manRef = useRef<THREE.Group>(null)

    return (
        <Canvas
            style={{background: 'black'}}
            camera={{position: [0, 1, 5], fov: 50}}
            gl={{preserveDrawingBuffer: true, alpha: true}}
            onCreated={({gl}) => {
                gl.getContext().canvas.addEventListener('webglcontextlost', (e) => {
                    console.warn('⚠️ CONTEXT LOST!', e)
                })
            }}
        >
            <StarNestBackground/>

            <ambientLight intensity={0.5}/>
            <directionalLight position={[5, 5, 5]} intensity={1}/>

            <group ref={manRef} position={[0, -1, 0]} renderOrder={1}>
                <Man/>
            </group>

            <mesh position={[0, -1, 0]}>
                <Swirl/>
            </mesh>

            <Glow />

            <EffectComposer multisampling={0} autoClear={false}>
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC}/>
                <Outline
                    selection={[manRef]}
                    selectionLayer={1}
                    blendFunction={BlendFunction.ADD}
                    edgeStrength={20}
                    pulseSpeed={.1}
                    visibleEdgeColor={0xffffff}
                    hiddenEdgeColor={0xffffff}
                    kernelSize={KernelSize.SMALL}
                    blur
                    xRay={false}
                />
            </EffectComposer>

            <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate/>
            <CameraControlPanel controlsRef={controlsRef}/>
        </Canvas>
    )
}