import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float iTime;
varying vec2 vUv;

void main() {
    float time = iTime * 2.0; // Speed multiplier for time to make it more obvious if needed
    vec2 uv = vUv * 200.0;

    float scale = 50.0; 
    vec2 st = uv * scale;

    float thickness = 0.05; 
    vec2 grid = smoothstep(0.0, thickness, fract(st)) * smoothstep(1.0, 1.0 - thickness, fract(st));
    
    float lines = 1.0 - (grid.x * grid.y);
    
    float pulse = 0.6 + 0.4 * sin(time * 0.5 - (uv.x + uv.y) * 10.0); // Slowed down pulse slightly for visibility
    
    vec3 baseColor = vec3(0.03, 0.03, 0.05);
    vec3 lineColor = vec3(0.0, 0.8, 1.0);
    
    vec3 finalColor = mix(baseColor, lineColor, lines * pulse);

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const MetaverseFloor = () => {
    const materialRef = useRef();

    const uniforms = useMemo(
        () => ({
            iTime: { value: 0 },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <Plane args={[10000, 10000]} rotation={[-Math.PI / 2, 0, 0]}>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </Plane>
    );
};

export default MetaverseFloor;
