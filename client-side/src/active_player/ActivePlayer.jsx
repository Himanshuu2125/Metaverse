import { useFrame } from "@react-three/fiber";
import ActivePlayerMesh from "./components/ActivePlayerMesh";
import Orbiter from "./components/Orbiter";
import { PointerLock } from "./funcs/PointerLock";
import { SetMouseControls } from "./funcs/SetMouseControls";
import { useThree } from "@react-three/fiber";
import UpdateCameraAndPlayerRotation from "./funcs/UpdateCameraAndPlayerRotation";
import ActivePlayerMovement from "./funcs/ActivePlayerMovement";
import KeyboardControls from "./funcs/KeyboardControls";
import PlayerInteractionDetector from "./funcs/PlayerInteractionDetector";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

export default function ActivePlayer({ gltf, activePlayerRef, isLocked, gravity, orbiterRef, orbiterCameraDistance = 0, setKeys, keys, isGrounded, velocity, jumpForce, moveSpeed, setOtherPlayers, otherPlayers, setInteractablePlayerId }) {

  // Mouse Sensitivity State
  const [sensitivityMultiplier, setSensitivityMultiplier] = useState(() => {
    const saved = localStorage.getItem('mouseSensitivity');
    return saved ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    const handleSensitivityChange = (e) => {
      setSensitivityMultiplier(e.detail);
    };
    window.addEventListener('sensitivityChanged', handleSensitivityChange);
    return () => window.removeEventListener('sensitivityChanged', handleSensitivityChange);
  }, []);

  UpdateCameraAndPlayerRotation({ orbiterRef: orbiterRef, orbiterCameraDistance: orbiterCameraDistance, activePlayerRef: activePlayerRef });
  PointerLock({ isLocked: isLocked });
  SetMouseControls({ orbiterRef: orbiterRef, isLocked: isLocked, mouseSensitivity: 0.002 * sensitivityMultiplier });
  KeyboardControls({ isLocked: isLocked, setKeys: setKeys });
  ActivePlayerMovement({ orbitorRef: orbiterRef, activePlayerRef: activePlayerRef, keys: keys, moveSpeed: moveSpeed, jumpForce: jumpForce, gravity: gravity, velocityRef: velocity, isGroundedRef: isGrounded })
  useEffect(() => {
    orbiterRef.current.position.copy(new Vector3(0, 1.6, 0));
  }, [])


  return (
    <>
      <ActivePlayerMesh gltf={gltf} activePlayerRef={activePlayerRef} visible={Boolean(orbiterCameraDistance)} />
      <Orbiter ref={orbiterRef} />
      <PlayerInteractionDetector
        otherPlayers={otherPlayers}
        setOtherPlayers={setOtherPlayers}
        setInteractablePlayerId={setInteractablePlayerId}
        detectionDistance={5}
      />
    </>
  );
}