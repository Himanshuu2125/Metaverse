export default function Orbiter({ref}) {
  return (
    <mesh  ref={ref}>
      <circleGeometry args={[0.1, 32]}/>
      <meshBasicMaterial color="white" transparent opacity={0} />
    </mesh>
  );
}