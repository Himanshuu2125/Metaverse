import { Text, Billboard } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function OtherPlayersMesh({
  gltf,
  name,
  canTalk,
  position,
  quaternion
}) {
  const { camera } = useThree();
  const meshRef = useRef();
  const talkRef = useRef();
  const nameRef = useRef();

  // Update position and rotation from props
  useFrame(() => {
    if (meshRef.current) {
      if (position) meshRef.current.position.copy(position);
      if (quaternion) meshRef.current.quaternion.copy(quaternion);
    }

    if (talkRef.current && meshRef.current) {
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      dir.normalize().multiplyScalar(-0.7)

      talkRef.current.position.set(
        meshRef.current.position.x + dir.x,
        meshRef.current.position.y + 0.1,
        meshRef.current.position.z + dir.z
      )
    }
    if (meshRef.current && nameRef.current) {
      nameRef.current.position.set(meshRef.current.position.x, meshRef.current.position.y + 1.3, meshRef.current.position.z);
    }
  })

  return (
    <>
      <primitive object={gltf} ref={meshRef} />

      {meshRef.current && (
        <>
          <group ref={nameRef}>

            <Billboard

              follow
              lockX={false}
              lockY={false}
              lockZ={false}
            >
              <group>

                <mesh>
                  <planeGeometry args={[name.length * 0.15, 0.4]} />
                  <meshBasicMaterial
                    color="black"
                    transparent
                    opacity={0.75}
                  />
                </mesh>
                <Text
                  fontSize={0.2}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  position={[0, 0, 0.01]}
                >
                  {name}
                </Text>
              </group>
            </Billboard>
          </group>

          {canTalk && (
            // Wrap the Billboard in a group that we move toward the camera
            <group ref={talkRef}>
              <Billboard follow lockX={false} lockY={false} lockZ={false}>
                <group>
                  <mesh>
                    {/* Smaller background: width ~ text + minimal padding */}
                    <planeGeometry args={[1.0, 0.2]} />
                    <meshBasicMaterial
                      color="black"
                      transparent
                      opacity={0.75}
                    />
                  </mesh>
                  <Text
                    fontSize={0.1} // reduced font size
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, 0, 0.01]}
                  >
                    Press E to Talk
                  </Text>
                </group>
              </Billboard>
            </group>
          )}
        </>
      )}
    </>
  )
}
