// @ts-nocheck
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function PlanetSphere({ theme }: { theme: 'light' | 'dark' }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  const color = theme === 'light' ? '#f8fafc' : '#020617';

  // Apply continuous, extremely subtle rotation to the planet
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <>
      {/* 
        The secret to making a huge 160-radius sphere look 3D instead of a flat 2D gradient 
        is EXTREME side-lighting and a sharp specular highlight that traces the geometry.
      */}
      {theme === 'dark' ? (
        <>
          <ambientLight intensity={0.01} />
          {/* Main sun-like source far top-left forming the intense terminator and deep core shadow */}
          <directionalLight position={[-60, 40, 20]} intensity={4} color="#38bdf8" />
          {/* A close point-light grazing the sphere to cast an undeniable 3D glossy highlight mark */}
          <pointLight position={[-15, 12, 45]} intensity={80} distance={150} decay={2} color="#bae6fd" />
          {/* Very faint blue fill from the bottom right to barely illuminate the dark abyss */}
          <directionalLight position={[40, -20, -10]} intensity={0.4} color="#0f172a" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.15} />
          {/* Searing bright dawn light mimicking massive atmospheric scattering */}
          <directionalLight position={[-60, 40, 20]} intensity={3.5} color="#ffffff" />
          {/* Glossy specular highlight point right at the visual crest */}
          <pointLight position={[-15, 12, 45]} intensity={50} distance={150} decay={2} color="#fff1f2" />
          <directionalLight position={[40, -20, -10]} intensity={0.5} color="#cbd5e1" />
        </>
      )}

      {/* 
        Restored the massive scale (160) for the elegant sweeping horizon curve.
        Now illuminated by the hyper-aggressive multi-point 3D light setup above.
      */}
      <mesh ref={sphereRef} position={[0, -150, 0]} scale={160}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.15}  /* Highly polished surface for sharp specular reflections */
          metalness={0.85}  /* Metallic deep sheen */
        />
      </mesh>
    </>
  );
}

export default function Planet3D({ theme }: { theme: 'light' | 'dark' }) {
  /* 
    巨大的行星外延大气层光晕，位于 3D 渲染层的正后方，
    将冰冷/锐利的实体星球与深空背景完美柔和地过渡在一起，形成极度震撼的“日心/冷月”光斑。
  */
  const haloBackground = theme === 'dark' 
    ? 'radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.4) 0%, rgba(2, 132, 199, 0.15) 30%, transparent 60%)'
    : 'radial-gradient(ellipse at 50% 50%, rgba(251, 146, 60, 0.25) 0%, rgba(253, 186, 116, 0.08) 30%, transparent 60%)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      {/* 
        Halo Layer: 200% scale ensures the gradient is overwhelmingly huge and doesn't get clipped easily.
        Placed behind everything (z: 0 or absolute default).
      */}
      <div style={{ 
        position: 'absolute', 
        top: '-50%', left: '-50%', width: '200%', height: '200%', 
        background: haloBackground, 
        pointerEvents: 'none' 
      }} />

      {/* Camera kept safely at z=60 to capture the massive 160-radius sphere globally. */}
      <Canvas camera={{ position: [0, 5, 60], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <PlanetSphere theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
