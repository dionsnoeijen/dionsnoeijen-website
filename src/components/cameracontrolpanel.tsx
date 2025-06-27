import {useThree} from "@react-three/fiber";
import {useControls} from "leva";

export function CameraControlPanel({controlsRef}) {
    const {camera} = useThree()

    useControls('Camera', {
        posX: {value: camera.position.x, min: -10, max: 10, onChange: v => camera.position.x = v},
        posY: {value: camera.position.y, min: -10, max: 10, onChange: v => camera.position.y = v},
        posZ: {value: camera.position.z, min: -10, max: 10, onChange: v => camera.position.z = v},
        targetX: {
            value: controlsRef.current?.target.x ?? 0,
            min: -10,
            max: 10,
            onChange: v => controlsRef.current?.target.setX(v)
        },
        targetY: {
            value: controlsRef.current?.target.y ?? 0,
            min: -10,
            max: 10,
            onChange: v => controlsRef.current?.target.setY(v)
        },
        targetZ: {
            value: controlsRef.current?.target.z ?? 0,
            min: -10,
            max: 10,
            onChange: v => controlsRef.current?.target.setZ(v)
        },
        fov: {
            value: camera.fov, min: 10, max: 120, onChange: v => {
                camera.fov = v
                camera.updateProjectionMatrix()
            }
        }
    })

    return null
}