'use client'

import { useEffect, useState } from 'react'

export default function CameraDevPanel({ camera, controlsRef }) {
  const [pos, setPos] = useState([0, 0, 0])
  const [target, setTarget] = useState([0, 0, 0])
  const [fov, setFov] = useState(50)

  useEffect(() => {
    if (!camera || !controlsRef.current) return
    const loop = () => {
      setPos([...camera.position.toArray()])
      setTarget([...controlsRef.current.target.toArray()])
      setFov(camera.fov)
      requestAnimationFrame(loop)
    }
    loop()
  }, [camera, controlsRef])

  const copyConfig = () => {
    const code = `camera={{ position: [${pos.map(n => n.toFixed(2))}], fov: ${fov.toFixed(2)} }}\ncontrols.target.set(${target.map(n => n.toFixed(2))})`
    navigator.clipboard.writeText(code)
    alert('📋 Camera config copied to clipboard!')
  }

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      background: '#111',
      color: '#fff',
      padding: '1rem',
      fontSize: 12,
      borderRadius: 4,
      zIndex: 1000
    }}>
      <div>📷 <b>Camera</b></div>
      <div>Pos: {pos.map(n => n.toFixed(2)).join(', ')}</div>
      <div>Target: {target.map(n => n.toFixed(2)).join(', ')}</div>
      <div>FOV: {fov.toFixed(2)}</div>
      <button onClick={copyConfig} style={{ marginTop: 8 }}>Copy config</button>
    </div>
  )
}