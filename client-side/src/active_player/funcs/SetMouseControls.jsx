import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function SetMouseControls({
  orbiterRef,
  isLocked,
  mouseSensitivity = 0.002,
  verticalPitchRange = Math.PI / 2 - 0.01,
}) {
  const pitchRef = useRef(0);
  useEffect(() => {
    function handleMouseMove(e) {
      if (!isLocked.current) return;
      const mx = e.movementX || 0;
      const my = e.movementY || 0;

      // YAW around world up
      const yawDelta = -mx * mouseSensitivity;
      const qYaw = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        yawDelta
      );
      orbiterRef.current.quaternion.premultiply(qYaw);

      // compute new right axis
      const rightWorld = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(orbiterRef.current.quaternion)
        .normalize();

      // PITCH with clamp
      const nextPitch = THREE.MathUtils.clamp(
        pitchRef.current + my * mouseSensitivity,
        -verticalPitchRange,
        verticalPitchRange
      );
      const pitchDelta = nextPitch - pitchRef.current;
      pitchRef.current = nextPitch;

      const qPitch = new THREE.Quaternion().setFromAxisAngle(
        rightWorld,
        pitchDelta
      );
      orbiterRef.current.quaternion.premultiply(qPitch);
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [orbiterRef, isLocked, mouseSensitivity, verticalPitchRange]);
}