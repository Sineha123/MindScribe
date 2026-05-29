import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float, Sphere } from '@react-three/drei';

function FloatingSpheres() {
  const spheres = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 5
      ],
      scale: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 2 + 0.5
    }));
  }, []);

  return (
    <>
      {spheres.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[s.scale, 32, 32]} position={s.position}>
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#cccccc" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <FloatingSpheres />
    </Canvas>
  );
}
