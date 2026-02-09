import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

export default function ActivePlayerMovement({
  orbitorRef,
  activePlayerRef,
  keys,
  moveSpeed,
  jumpForce,
  gravity,
  velocityRef,
  isGroundedRef
}) {
    const { camera } = useThree();
    
    
    useFrame(() => {
      if (!orbitorRef.current || !activePlayerRef.current || !camera) return;
      
      // Apply gravity
      if (!isGroundedRef.current) {
          velocityRef.current.y -= gravity;
        }
        
        // Calculate movement directions on XZ plane
        const forwardVector = new Vector3();
        orbitorRef.current.getWorldDirection(forwardVector);
        forwardVector.y = 0;
        forwardVector.normalize();
    
    const rightVector = new Vector3().crossVectors(forwardVector, new Vector3(0, 1, 0)).normalize();
    
    // Reset horizontal velocity
    velocityRef.current.x = 0;
    velocityRef.current.z = 0;
    
    // Apply directional movement
    if (keys.forward) {
        velocityRef.current.addScaledVector(forwardVector, moveSpeed);
    }
    if (keys.backward) {
        velocityRef.current.addScaledVector(forwardVector, -moveSpeed);
    }
    if (keys.left) {
        velocityRef.current.addScaledVector(rightVector, -moveSpeed);
    }
    if (keys.right) {
        velocityRef.current.addScaledVector(rightVector, moveSpeed);
    }
    
    // Jump logic
    if (keys.jump && isGroundedRef.current) {
        velocityRef.current.y = jumpForce;
        isGroundedRef.current = false;
    }
    
    // Move camera, orbitor, and player
    const delta = velocityRef.current.clone();
    camera.position.add(delta);
    orbitorRef.current.position.add(delta);
    activePlayerRef.current.position.add(delta);

    // Ground collision
    if (activePlayerRef.current.position.y <= 1) {
        activePlayerRef.current.position.y = 1;
        orbitorRef.current.position.y=1.6
        velocityRef.current.y = 0;
        isGroundedRef.current = true;
    }
});

return null;
}
