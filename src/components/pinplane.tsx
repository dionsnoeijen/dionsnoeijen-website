import * as THREE from 'three';
import {useRef, useEffect, useCallback} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {OrbitControls, Stats} from '@react-three/drei';
import {EffectComposer, Bloom, ToneMapping} from '@react-three/postprocessing';
import {ToneMappingMode} from "postprocessing";
import SlicedPlane from "@/components/sliced-plane";

/* ─── grid-constantes ─────────────────────────────────────────── */
const SIZE = 200;
const TILE_SIZE = 0.2;
const INSET = 0.009;

function PinVoxelGrid() {
    const meshRef = useRef();
    const materialRef = useRef();
    const {gl} = useThree();
    const mouse = useRef(new THREE.Vector2());

    /* displacement-map */
    const displacementMap = useRef(
        new THREE.TextureLoader().load('/textures/city-landscape-displacement.png')
    ).current;
    displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.minFilter = THREE.LinearFilter;

    /* kleur-texture refs */
    const bufRef = useRef();
    const texRef = useRef();

    /* helper om één pin te kleuren */
    const setPinColor = useCallback((ix, iy, r, g, b) => {
        const buf = bufRef.current, tex = texRef.current;
        if (!buf || !tex) return;
        const texSize = SIZE * 2;
        const idx = (iy * texSize + ix) * 4;      // RGBA
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = 255;
        tex.needsUpdate = true;
    }, []);

    /* klok-uniform */
    useFrame(({clock}) => {
        const sh = materialRef.current?.userData.shader;
        if (sh) {
            sh.uniforms.uTime.value = clock.getElapsedTime();
            sh.uniforms.uDisplacementMap.value = displacementMap;
        }
    });

    /* pointer-move → NDC */
    useEffect(() => {
        const cvs = gl.domElement;
        const move = (e) => {
            const r = cvs.getBoundingClientRect();
            mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            mouse.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        };
        cvs.addEventListener('pointermove', move);
        return () => cvs.removeEventListener('pointermove', move);
    }, [gl]);

    /* raycast & live kleuren */
    useFrame(({camera}) => {
        if (!meshRef.current) return;

        const ray = new THREE.Ray();
        ray.origin.copy(camera.position);
        ray.direction.set(mouse.current.x, mouse.current.y, 0.5)
            .unproject(camera)
            .sub(camera.position)
            .normalize();

        const planeY = meshRef.current.position.y;
        const t = (planeY - camera.position.y) / ray.direction.y;
        const point = camera.position.clone().add(ray.direction.clone().multiplyScalar(t));
        const local = meshRef.current.worldToLocal(point);

        /* muis uniform */
        const sh = materialRef.current?.userData.shader;
        if (sh) sh.uniforms.uMouse.value.set(local.x, 0, local.y);

        /* index & kleur */
        const ix = Math.floor(local.x / TILE_SIZE + SIZE);
        const iy = Math.floor(local.y / TILE_SIZE + SIZE);
        if (ix >= 0 && ix < SIZE * 2 && iy >= 0 && iy < SIZE * 2) {
            setPinColor(ix, iy, 255, 60, 60);      // rood highlight
        }
    });

    /* éénmalige setup */
    useEffect(() => {
        /* RGBA kleur-texture aanmaken */
        const texSize = SIZE * 2;
        const data = new Uint8Array(texSize * texSize * 4);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = 170; // donkergrijs
            data[i + 3] = 255;
        }
        const colorTex = new THREE.DataTexture(data, texSize, texSize, THREE.RGBAFormat);
        colorTex.colorSpace = THREE.SRGBColorSpace;
        colorTex.minFilter = colorTex.magFilter = THREE.NearestFilter;
        colorTex.needsUpdate = true;
        bufRef.current = data;
        texRef.current = colorTex;

        /* geometry */
        const verts = [], uvs = [], idxs = [], ids = [];
        let offset = 0, blockId = 0;
        for (let x = -SIZE; x < SIZE; x++) {
            for (let y = -SIZE; y < SIZE; y++) {
                const x0 = x * TILE_SIZE, y0 = y * TILE_SIZE;
                const x1 = (x + 1) * TILE_SIZE, y1 = (y + 1) * TILE_SIZE;

                verts.push(
                    x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y1, 0,
                    x0 + INSET, y0 + INSET, 0.2,
                    x1 - INSET, y0 + INSET, 0.2,
                    x1 - INSET, y1 - INSET, 0.2,
                    x0 + INSET, y1 - INSET, 0.2
                );
                for (let i = 0; i < 8; i++) ids.push(blockId);

                idxs.push(
                    offset + 4, offset + 5, offset + 6, offset + 4, offset + 6, offset + 7,
                    offset + 4, offset, offset + 5, offset + 5, offset, offset + 1,
                    offset + 5, offset + 1, offset + 6, offset + 6, offset + 1, offset + 2,
                    offset + 6, offset + 2, offset + 7, offset + 7, offset + 2, offset + 3,
                    offset + 7, offset + 3, offset + 4, offset + 4, offset + 3, offset
                );
                offset += 8;
                blockId++;

                const u = (x + SIZE) / (SIZE * 2);
                const v = (y + SIZE) / (SIZE * 2);
                for (let i = 0; i < 8; i++) uvs.push(u, v);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('aBlockId', new THREE.Float32BufferAttribute(ids, 1));
        geometry.setIndex(idxs);
        geometry.computeVertexNormals();

        /* materiaal */
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.0,
            flatShading: true,
            map: colorTex,
            toneMapped: false,
            emissive: 0x000000,
            emissiveIntensity: 1.0,
            transparent: true,
            depthWrite: true
        });

        /* shader-patch */
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = {value: 0};
            shader.uniforms.uDisplacementMap = {value: displacementMap};
            shader.uniforms.uMouse = {value: new THREE.Vector3()};

            /* vertex extra */
            shader.vertexShader = `
        varying float vEnergy;
        uniform float uTime;
        uniform sampler2D uDisplacementMap;
        uniform vec3 uMouse;
        attribute float aBlockId;
        varying float vHeight;
        varying float vIsTop;   
        varying float vZ;
        ${shader.vertexShader}
      `.replace(
                '#include <begin_vertex>',
                `
        vec3 transformed = position;

        float blockY = mod(aBlockId, ${SIZE * 2}.0);
        float blockX = floor(aBlockId / ${SIZE * 2}.0);

        // vec2 uvCenter = vec2(0.5);
        // originele UV
        vec2 uvRaw = vec2(blockX, blockY) / ${SIZE * 2}.0;

        // inverse zoom: texture wordt groter onder grid
        float zoom = 2.0 + sin(uTime * 0.01) * 0.3;  // standaard 1.5x uitgerekt
        // float zoom = 2.0;
        float uvAngle = sin(uTime * 0.1) * 0.01;
        // float uvAngle = 0.0;
        mat2 rot = mat2(cos(uvAngle), -sin(uvAngle), sin(uvAngle), cos(uvAngle));
        
        // overscan offset zodat we altijd “binnen de veilige zone” kijken
        vec2 uvCenter = vec2(0.5);
        vec2 uvZoomed = (uvRaw - uvCenter) / zoom;      // zoom out from center
        vec2 uv = rot * uvZoomed + uvCenter;            // rotate around center

        float disp = texture2D(uDisplacementMap, uv).r;

        vec2 center   = vec2(${SIZE}.0);
        vec2 blockPos = vec2(blockX, blockY);
        float baseDist= distance(blockPos, center);
        float angle   = atan(blockPos.y - center.y, blockPos.x - center.x);
        float wobble  = sin(angle * 10.0 + uTime * 2.0) * 3.0;
        float dist    = baseDist + wobble;

        float t       = mod(uTime, 50.0);
        float delay   = dist * 0.005;
        float act     = smoothstep(0.0, 0.1, t - delay);
        float wave    = disp * act * 14.0;

        vec2 blockCenter = (blockPos - center) * ${TILE_SIZE.toFixed(2)};
        vec3 basePos     = vec3(blockCenter.x, 0.6, blockCenter.y);
        float mDist      = distance(basePos, uMouse);

        float rand  = fract(sin(dot(blockCenter, vec2(12.9898,78.233))) * 43758.5453);
        float phase = sin(uTime * 3.0 - mDist * 8.0);
        float lift  = smoothstep(5.0, 0.0, mDist) * phase * 0.6;
        float spike = smoothstep(3.0, 0.0, mDist) * rand * 2.0;

        float height = 0.6 + wave + lift + spike;
        vHeight = wave;                    // 0-14  (zelfde schaal)
        vEnergy = max(lift + spike, 0.0);

        if (position.z > 0.1) transformed.z = height;
        vIsTop = step(0.11, position.z);
        vZ = transformed.z;
        `
            );

/* fragment extra */
shader.fragmentShader = `
  varying float vIsTop;
  varying float vEnergy;
  varying float vHeight;
  uniform float uTime;
  varying float vZ;
  ${shader.fragmentShader}
`.replace(
  '#include <emissivemap_fragment>',
  `#include <emissivemap_fragment>

    /* ---- hue: deep turquoise ➜ icy white ---- */
    if (vHeight < 0.01) discard;
    float h = clamp(vHeight / 14.0, 0.0, 1.0);      // 0-1 from height
    h = pow(h, 0.55);                               // extra contrast
    // float t = uTime;
    float t  = uTime / 10.0;                
    float a = sin(vHeight * 0.4 + t * 1.3);
    float b = cos(vHeight * 0.5 - t * 1.1);
    float c = sin(vHeight * 0.2 + t * 0.7);
    
    vec3 topCol = 0.7 + 0.7 * vec3(a, b, c);
    
    /* ---- brightness boost from mouse energy ---- */
    float boost = 1.0 + vEnergy * 3.4;             // brighter on interaction
    
    /* ---- subtle Fresnel rim for depth ---- */
    float fres = pow(1.0 - dot(normalize(vViewPosition), normal), 2.0);
    
    /* emissive for top-faces */
    vec3 neon = topCol * boost * (0.4 + fres * 0.8);
    
    /* side-faces stay dark so pin shape is readable */
    vec3 side = diffuse * 0.25;
    
    // ------
    float layerSpacing = 0.5; // afstand tussen lijnen (speel hiermee)
    float thickness = 0.1;  // dikte van elke lijn
    
    // slice effect gebaseerd op absolute hoogte, niet per pin
    float lineDist = abs(mod(vZ + 0.5 * layerSpacing, layerSpacing) - 0.5 * layerSpacing);
    float sliceMask = smoothstep(thickness * 0.5, 0.0, lineDist);
    if (sliceMask < 0.01) discard;
    // ------
    
    /* blend: vIsTop ≈ 1 on pin-tops, 0 on side-quads */
    totalEmissiveRadiance += mix(side, neon, vIsTop);
    `
    );

            material.userData.shader = shader;
        };

        meshRef.current.geometry = geometry;
        meshRef.current.material = material;
        materialRef.current = material;
    }, []);

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
        />
    );
}

/* scene-wrapper */
export default function PinGridScene() {
    return (
        <Canvas style={{ background: 'black' }} camera={{position: [0, 25, 90], fov: 30, near: 0.1, far: 1000}}>
            <ambientLight intensity={0.5}/>
            <directionalLight position={[5, 10, 5]} intensity={10}/>
            {/*<PinVoxelGrid/>*/}
            <SlicedPlane />
            <OrbitControls enablePan enableZoom enableRotate/>
            <EffectComposer multisampling={0} resolutionScale={0.5}>
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC}/>
                <Bloom threshold={0.15} intensity={0.9} mipmapBlur/>
            </EffectComposer>
            <Stats/>
        </Canvas>
    );
}