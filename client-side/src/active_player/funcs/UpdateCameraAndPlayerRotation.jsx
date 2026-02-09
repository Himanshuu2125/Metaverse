import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Euler } from 'three';

export default function UpdateCameraAndPlayerRotation({
  orbiterRef,
  orbiterCameraDistance,
  activePlayerRef
}) {
  const { camera } = useThree();

  // Pre-allocate reusable objects
  const _orbiterWorldQuat = new Quaternion();
  const _yawEuler = new Euler();
  const _yawQuat = new Quaternion();

  useFrame(() => {
    const orbiter = orbiterRef.current;
    const activePlayer = activePlayerRef.current;
    if (!orbiter) return;

    // Position the camera behind the orbiter
    const orbiterPosition = orbiter.position.clone();
    const orbiterDirection = orbiter.getWorldDirection(new Vector3());
    orbiterDirection.multiplyScalar(-orbiterCameraDistance);
    orbiterPosition.add(orbiterDirection);
    camera.position.copy(orbiterPosition);
    
    const orbiterDirection2 = orbiter.getWorldDirection(new Vector3());
    const lookAtPoint = orbiter.position.clone()
    orbiterDirection.multiplyScalar(-orbiterCameraDistance+0.1);
    lookAtPoint.add(orbiterDirection2)
    camera.lookAt(lookAtPoint);

    // Copy only the Y rotation of the orbiter into the active player using quaternions
    if (activePlayer) {
      // Get the orbiter's world quaternion
      orbiter.getWorldQuaternion(_orbiterWorldQuat);
      // Convert to Euler to extract yaw (Y axis rotation)
      _yawEuler.setFromQuaternion(_orbiterWorldQuat, 'YXZ');
      // Build a quaternion around the Y axis
      _yawQuat.setFromAxisAngle(new Vector3(0, 1, 0), _yawEuler.y);
      // Apply to the player
      activePlayer.quaternion.copy(_yawQuat);
    }
  });
}
