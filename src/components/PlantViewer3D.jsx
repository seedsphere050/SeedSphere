// src/components/PlantViewer3D.jsx
// Three.js procedural models (Stage 1 + fallback) + GLB loader (Stage 2/3)
import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const PLANT_CONFIGS = {
  // Original
  aloe_vera:         { stemColor:'#2D6A4F', leafColor:'#52B788', accent:'#95D5B2' },
  tulsi:             { stemColor:'#386641', leafColor:'#6A994E', accent:'#A7C957' },
  rose:              { stemColor:'#386641', leafColor:'#52B788', accent:'#E63946' },
  money_plant:       { stemColor:'#386641', leafColor:'#52B788', accent:'#B7E4C7' },
  tomato:            { stemColor:'#386641', leafColor:'#52B788', accent:'#E63946' },
  // New 45 plants
  neem:              { stemColor:'#3B6E2A', leafColor:'#4CAF50', accent:'#A5D6A7' },
  apple:             { stemColor:'#5D4037', leafColor:'#388E3C', accent:'#F44336' },
  corn:              { stemColor:'#6D4C41', leafColor:'#8BC34A', accent:'#FFC107' },
  orange:            { stemColor:'#5D4037', leafColor:'#388E3C', accent:'#FF9800' },
  peach:             { stemColor:'#5D4037', leafColor:'#388E3C', accent:'#FF8A65' },
  pepper:            { stemColor:'#386641', leafColor:'#43A047', accent:'#E53935' },
  potato:            { stemColor:'#5D4037', leafColor:'#558B2F', accent:'#A1887F' },
  strawberry:        { stemColor:'#386641', leafColor:'#43A047', accent:'#E53935' },
  snake_plant:       { stemColor:'#2E5E2E', leafColor:'#2E7D32', accent:'#F9A825' },
  christmas_tree:    { stemColor:'#3B2F1A', leafColor:'#1B5E20', accent:'#F44336' },
  hibiscus:          { stemColor:'#386641', leafColor:'#43A047', accent:'#E91E63' },
  bougainvillea:     { stemColor:'#386641', leafColor:'#558B2F', accent:'#E91E63' },
  lavender:          { stemColor:'#6A5ACD', leafColor:'#7E57C2', accent:'#CE93D8' },
  peony:             { stemColor:'#386641', leafColor:'#43A047', accent:'#F48FB1' },
  hydrangea:         { stemColor:'#386641', leafColor:'#43A047', accent:'#90CAF9' },
  onion:             { stemColor:'#6D4C41', leafColor:'#8BC34A', accent:'#CE93D8' },
  garlic:            { stemColor:'#6D4C41', leafColor:'#8BC34A', accent:'#E8E8E8' },
  pineapple:         { stemColor:'#6D4C41', leafColor:'#8BC34A', accent:'#FFD600' },
  oats:              { stemColor:'#6D4C41', leafColor:'#AED581', accent:'#F9A825' },
  pot_marigold:      { stemColor:'#386641', leafColor:'#558B2F', accent:'#FF9800' },
  papaya:            { stemColor:'#5D4037', leafColor:'#388E3C', accent:'#FF9800' },
  blue_cornflower:   { stemColor:'#386641', leafColor:'#43A047', accent:'#42A5F5' },
  lemon:             { stemColor:'#5D4037', leafColor:'#388E3C', accent:'#FFD600' },
  coffee_tree:       { stemColor:'#5D4037', leafColor:'#2E7D32', accent:'#A1887F' },
  wild_carrot:       { stemColor:'#6D4C41', leafColor:'#8BC34A', accent:'#FFFFFF' },
  snowdrop:          { stemColor:'#386641', leafColor:'#81C784', accent:'#FFFFFF' },
  soyabean:          { stemColor:'#386641', leafColor:'#8BC34A', accent:'#F9A825' },
  english_ivy:       { stemColor:'#386641', leafColor:'#388E3C', accent:'#A5D6A7' },
  hops:              { stemColor:'#386641', leafColor:'#8BC34A', accent:'#A5D6A7' },
  lotus:             { stemColor:'#386641', leafColor:'#43A047', accent:'#F48FB1' },
  yarrow:            { stemColor:'#386641', leafColor:'#AED581', accent:'#FFFFFF' },
  feverfew:          { stemColor:'#386641', leafColor:'#8BC34A', accent:'#FFFFFF' },
  oleander:          { stemColor:'#386641', leafColor:'#43A047', accent:'#F48FB1' },
  oregano:           { stemColor:'#386641', leafColor:'#558B2F', accent:'#CE93D8' },
  avocado:           { stemColor:'#5D4037', leafColor:'#2E7D32', accent:'#558B2F' },
  beetroot:          { stemColor:'#386641', leafColor:'#558B2F', accent:'#880E4F' },
  vervain:           { stemColor:'#386641', leafColor:'#558B2F', accent:'#9575CD' },
  banyan:            { stemColor:'#5D4037', leafColor:'#2E7D32', accent:'#A5D6A7' },
  purple_coneflower: { stemColor:'#386641', leafColor:'#558B2F', accent:'#9C27B0' },
  basil:             { stemColor:'#386641', leafColor:'#43A047', accent:'#A5D6A7' },
};

// ── Stage 1: Seed (Three.js — always) ────────────────────────────────────────
function Seed() {
  return (
    <group>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.8, 1.0, 0.3, 12]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#52B788" roughness={0.5} />
      </mesh>
      <mesh position={[0.08, 0.28, 0]} rotation={[0, 0, -0.5]}>
        <planeGeometry args={[0.18, 0.25]} />
        <meshStandardMaterial color="#74C69D" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Stage 2: Medium Three.js fallback ────────────────────────────────────────
function MediumPlantFallback({ config }) {
  const leaves = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    angle:  (i / 15) * Math.PI * 2,
    height: 0.3 + (i % 5) * 0.35,
    size:   0.3 + Math.sin(i) * 0.1,
    spread: 0.2 + (i % 3) * 0.12,
  })), []);

  return (
    <group>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.55, 0.42, 0.65, 12]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 1.6, 8]} />
        <meshStandardMaterial color={config.stemColor} roughness={0.6} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i}
          position={[Math.cos(l.angle)*l.spread, l.height, Math.sin(l.angle)*l.spread]}
          rotation={[Math.PI/5, l.angle, 0]}>
          <planeGeometry args={[l.size, l.size * 1.8]} />
          <meshStandardMaterial color={i%3===0 ? config.accent : config.leafColor}
            side={THREE.DoubleSide} roughness={0.4} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── Stage 3: Fully grown Three.js fallback ────────────────────────────────────
function FullGrownFallback({ config, plantType }) {
  const leaves = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    angle:  (i/24)*Math.PI*2,
    height: 0.3 + (i%8)*0.3,
    size:   0.3 + Math.sin(i)*0.15,
    spread: 0.25 + (i%4)*0.15,
  })), []);

  return (
    <group>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.7, 0.55, 0.8, 14]} />
        <meshStandardMaterial color="#6D4C41" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 2.2, 8]} />
        <meshStandardMaterial color={config.stemColor} roughness={0.65} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i}
          position={[Math.cos(l.angle)*l.spread, l.height, Math.sin(l.angle)*l.spread]}
          rotation={[Math.PI/6, l.angle, 0]}>
          <planeGeometry args={[l.size, l.size*2]} />
          <meshStandardMaterial
            color={i%5===0 ? config.accent : config.leafColor}
            side={THREE.DoubleSide} roughness={0.35} transparent opacity={0.88} />
        </mesh>
      ))}
      {['rose','sunflower','tomato','cactus'].includes(plantType) &&
        [0,1,2].map(i => (
          <mesh key={i} position={[Math.cos(i*2.1)*0.4, 1.2+i*0.2, Math.sin(i*2.1)*0.4]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={config.accent} emissive={config.accent} emissiveIntensity={0.3} />
          </mesh>
        ))
      }
    </group>
  );
}

// ── GLB model component ───────────────────────────────────────────────────────
function GLBModel({ glbUrl, healthScore }) {
  const { scene } = useGLTF(glbUrl);
  const healthMod  = Math.max(0.6, healthScore / 100);
  const cloned     = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={[healthMod, healthMod, healthMod]} />;
}

function GLBModelSafe({ glbUrl, healthScore, onError }) {
  return (
    <Suspense fallback={null}>
      <GLBModel glbUrl={glbUrl} healthScore={healthScore} />
    </Suspense>
  );
}

// ── Animated wrapper ──────────────────────────────────────────────────────────
function AnimatedPlant({ plantType, stage, healthScore, glbUrl, useGlb }) {
  const ref        = useRef();
  const config     = PLANT_CONFIGS[plantType] || PLANT_CONFIGS.tulsi;
  const healthMod  = Math.max(0.6, healthScore / 100);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.05;
    ref.current.position.y = Math.sin(t * 0.8) * 0.02;
  });

  if (useGlb && glbUrl) {
    return (
      <Float speed={1.0} rotationIntensity={0.03} floatIntensity={0.08}>
        <group ref={ref}>
          <GLBModelSafe glbUrl={glbUrl} healthScore={healthScore} />
        </group>
      </Float>
    );
  }

  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={ref} scale={[healthMod, healthMod, healthMod]}>
        {(stage === 'seed' || stage === 'small_plant') && <Seed />}
        {stage === 'medium_plant' && <MediumPlantFallback config={config} />}
        {stage === 'fully_grown'  && <FullGrownFallback config={config} plantType={plantType} />}
      </group>
    </Float>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PlantViewer3D({ plantType = 'tulsi', stage = 'seed', healthScore = 70 }) {
  const [glbInfo, setGlbInfo] = useState({ checked: false, useGlb: false, url: null });

  // Determine stage key for DB lookup
  const stageKey = stage === 'fully_grown' ? 'stage3'
                 : stage === 'medium_plant' ? 'stage2'
                 : null; // seed/small_plant always Three.js

  useEffect(() => {
    if (!stageKey) {
      setGlbInfo({ checked: true, useGlb: false, url: null });
      return;
    }
    fetch(`http://localhost:8000/api/plants/models/${plantType}/${stageKey}/`)
      .then(r => r.json())
      .then(data => {
        setGlbInfo({
          checked: true,
          useGlb:  data.found === true,
          url:     data.glb_url || null,
        });
      })
      .catch(() => setGlbInfo({ checked: true, useGlb: false, url: null }));
  }, [plantType, stageKey]);

  if (!glbInfo.checked) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#050D05] rounded-xl">
        <div className="text-4xl animate-spin">🌱</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#050D05]">
      <Canvas shadows camera={{ position: [2.5, 2, 3.5], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} color="#B7E4C7" />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.5} color="#52B788" />
        <fog attach="fog" args={['#050D05', 8, 20]} />
        <Suspense fallback={null}>
          <AnimatedPlant
            plantType={plantType}
            stage={stage}
            healthScore={healthScore}
            glbUrl={glbInfo.url}
            useGlb={glbInfo.useGlb}
          />
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
            <circleGeometry args={[3, 32]} />
            <meshStandardMaterial color="#0D1F0D" roughness={1.0} />
          </mesh>
          <Environment preset="forest" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8}
          minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.1}
          autoRotate autoRotateSpeed={0.6} />
      </Canvas>

    </div>
  );
}
