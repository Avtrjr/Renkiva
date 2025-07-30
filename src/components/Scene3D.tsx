import { useRef, useState, useEffect } from 'react';
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

// Animated Connection Lines
function ConnectionLine({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const lineRef = useRef<THREE.BufferGeometry>(null);
  
  useFrame((state) => {
    if (lineRef.current) {
      const positions = lineRef.current.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      }
      lineRef.current.attributes.position.needsUpdate = true;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <line>
      <bufferGeometry ref={lineRef}>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00ffff" transparent opacity={0.6} />
    </line>
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
function DataPacket({ path }: { path: [number, number, number][] }) {
  const packetRef = useRef<THREE.Mesh>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useFrame(() => {
    if (packetRef.current && path.length > 1) {
      const progress = (Date.now() * 0.003) % 1;
      const currentPoint = path[currentIndex];
      const nextPoint = path[(currentIndex + 1) % path.length];
      
      if (currentPoint && nextPoint) {
        packetRef.current.position.lerpVectors(
          new THREE.Vector3(...currentPoint),
          new THREE.Vector3(...nextPoint),
          progress
        );
        
        if (progress > 0.9) {
          setCurrentIndex((currentIndex + 1) % path.length);
        }
      }
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

  const connections = [
    { start: [0, 0, 0] as [number, number, number], end: [-3, 2, 0] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [3, 1, 0] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [-2, -2, 2] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [2, -1, -2] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [0, 3, 1] as [number, number, number] },
  ];

  const dataPath = [
    [-3, 2, 0] as [number, number, number],
    [0, 0, 0] as [number, number, number],
    [3, 1, 0] as [number, number, number],
    [0, 0, 0] as [number, number, number],
    [-2, -2, 2] as [number, number, number],
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
      
      {/* Connection Lines */}
      {connections.map((connection, index) => (
        <ConnectionLine key={index} start={connection.start} end={connection.end} />
      ))}
      
      {/* Data Packets */}
      <DataPacket path={dataPath} />
      
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
        autoRotateSpeed={1}
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
        <Scene3DContent />
      </Canvas>
    </div>
  );
};