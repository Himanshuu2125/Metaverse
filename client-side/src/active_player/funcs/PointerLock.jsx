import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
export function PointerLock({isLocked}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    function handleClick() {
      canvas.requestPointerLock();
    }

    function handlePointerLockChange() {
      isLocked.current = document.pointerLockElement === canvas;
    }

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl.domElement, isLocked]);

  return isLocked;
}