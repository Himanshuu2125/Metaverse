export default function ActivePlayerMesh({ gltf,  activePlayerRef,visible}) {

  return (
    <primitive
      object={gltf.current}
      ref={activePlayerRef}
      visible={visible}
    />
  );
}