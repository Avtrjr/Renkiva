import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Floating Mesh Node Component
function MeshNode({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.3, 16, 16]}>
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

// Rotating Central Hub
function CentralHub() {
  const hubRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (hubRef.current) {
      hubRef.current.rotation.x += 0.005;
      hubRef.current.rotation.y += 0.01;
      hubRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Torus ref={hubRef} args={[1, 0.3, 16, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial 
        color="#8b5cf6" 
        emissive="#8b5cf6" 
        emissiveIntensity={0.4}
        wireframe
      />
    </Torus>
  );
}

// Data Packet Animation
function DataPacket({ startPos, endPos }: { startPos: [number, number, number], endPos: [number, number, number] }) {
  const packetRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (packetRef.current) {
      const progress = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      const start = new THREE.Vector3(...startPos);
      const end = new THREE.Vector3(...endPos);
      packetRef.current.position.lerpVectors(start, end, progress);
    }
  });

  return (
    <Box ref={packetRef} args={[0.1, 0.1, 0.1]}>
      <meshStandardMaterial 
        color="#fbbf24" 
        emissive="#fbbf24" 
        emissiveIntensity={0.5}
      />
    </Box>
  );
}

// Main 3D Scene Component
function Scene3DContent() {
  const nodes = [
    { position: [-3, 2, 0] as [number, number, number], color: "#00ffff" },
    { position: [3, 1, 0] as [number, number, number], color: "#00ff00" },
    { position: [-2, -2, 2] as [number, number, number], color: "#ff00ff" },
    { position: [2, -1, -2] as [number, number, number], color: "#ffff00" },
    { position: [0, 3, 1] as [number, number, number], color: "#ff6600" },
  ];

  return (
    <>
      {/* Ambient lighting for dark theme */}
      <ambientLight intensity={0.3} color="#1e1b4b" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Central Hub */}
      <CentralHub />
      
      {/* Mesh Nodes */}
      {nodes.map((node, index) => (
        <MeshNode key={index} position={node.position} color={node.color} />
      ))}
      
      {/* Data Packets */}
      <DataPacket startPos={[-3, 2, 0]} endPos={[0, 0, 0]} />
      <DataPacket startPos={[3, 1, 0]} endPos={[0, 0, 0]} />
      
      {/* Floating Text */}
      <Text
        position={[0, -4, 0]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        MeshTV Network
      </Text>
      
      {/* Orbit Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export const Scene3D = () => {
  return (
    <div className="w-full h-96 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene3DContent />
        </Suspense>
      </Canvas>
    </div>
  );
};