import { useEffect } from 'react';
export default function KeyboardControls({ isLocked, setKeys }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (!isLocked.current) return;
      setKeys((prev) => {
        switch (event.code) {
          case 'KeyW':   return { ...prev, forward:  true };
          case 'KeyS':   return { ...prev, backward: true };
          case 'KeyA':   return { ...prev, left:     true };
          case 'KeyD':   return { ...prev, right:    true };
          case 'Space':  return { ...prev, jump:     true };
          default:       return prev;
        }
      });
    }

    function handleKeyUp(event) {
      if (!isLocked.current) return;
      setKeys((prev) => {
        switch (event.code) {
          case 'KeyW':   return { ...prev, forward:  false };
          case 'KeyS':   return { ...prev, backward: false };
          case 'KeyA':   return { ...prev, left:     false };
          case 'KeyD':   return { ...prev, right:    false };
          case 'Space':  return { ...prev, jump:     false };
          default:       return prev;
        }
      });
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
    };
  }, [isLocked, setKeys]);
  return null;
}
