import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const SIZE = 200;
const TILE_SIZE = 0.2;

export default function SlicedPlane() {
    const meshRef = useRef();
    const materialRef = useRef();

    const displacementMap = useRef(
        new THREE.TextureLoader().load('/textures/city-landscape-displacement.png')
    ).current;

    useFrame(({ clock }) => {
        const sh = materialRef.current?.userData.shader;
        if (sh) sh.uniforms.uTime.value = clock.getElapsedTime();
    });

    useEffect(() => {
        const segments = SIZE;
        const geometry = new THREE.PlaneGeometry(
            TILE_SIZE * segments,
            TILE_SIZE * segments,
            segments,
            segments
        );
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.3,
            metalness: 0.0,
            flatShading: true,
            transparent: true,
            depthWrite: false,
        });

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uDisplacementMap = { value: displacementMap };

            shader.vertexShader = `
                uniform float uTime;
                uniform sampler2D uDisplacementMap;
                varying float vZ;

                ${shader.vertexShader}
            `.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = position;

                vec2 uv = uv;
                float disp = texture2D(uDisplacementMap, uv).r;
                float height = disp * 14.0;
                transformed.y += height;
                vZ = transformed.y;
                `
            );

            shader.fragmentShader = `
                varying float vZ;
                uniform float uTime;
                ${shader.fragmentShader}
            `.replace(
                '#include <dithering_fragment>',
                `
                float layerSpacing = 0.1;
                float thickness = 0.01;
                float lineDist = abs(mod(vZ + 0.5 * layerSpacing, layerSpacing) - 0.5 * layerSpacing);
                float sliceMask = smoothstep(thickness * 0.5, 0.0, lineDist);
                if (sliceMask < 0.01) discard;

                gl_FragColor.rgb = vec3(1.0);
                gl_FragColor.a = 1.0;
                #include <dithering_fragment>
                `
            );

            material.userData.shader = shader;
        };

        meshRef.current.geometry = geometry;
        meshRef.current.material = material;
        materialRef.current = material;
    }, [displacementMap]);

    return <mesh ref={meshRef} position={[0, 0.01, 0]} />;
}