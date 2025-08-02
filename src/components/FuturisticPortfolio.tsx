import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import { Bluetooth, Zap, Globe, Cpu } from 'lucide-react';
import * as THREE from 'three';

// 3D Earth Component
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[2.5, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshDistortMaterial
        color={hovered ? "#00ffff" : "#0088ff"}
        attach="material"
        distort={0.6}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        emissive={hovered ? "#004444" : "#002244"}
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

// Floating Mesh Nodes
function MeshNode({ position, delay = 0 }: { position: [number, number, number], delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.5;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#00ffff" 
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// Connection Lines Component
function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (linesRef.current) {
      linesRef.current.rotation.y += 0.001;
    }
  });

  const points = [
    new THREE.Vector3(-4, 2, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(4, -2, 0),
    new THREE.Vector3(-2, -3, 2),
    new THREE.Vector3(3, 1, -2),
  ];

  return (
    <group ref={linesRef}>
      {points.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      ))}
    </group>
  );
}

// Main Portfolio Component
export const FuturisticPortfolio = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerOpacity = Math.min(scrollY / 300, 1);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Light Spots Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-cyan-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-48 right-20 w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Sticky Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-sm"
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${headerOpacity * 0.8})`,
          borderBottom: `1px solid rgba(0, 255, 255, ${headerOpacity * 0.3})`
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bluetooth 
              className="w-8 h-8 transition-all duration-300" 
              style={{ 
                color: `rgba(0, 255, 255, ${0.5 + headerOpacity * 0.5})`,
                filter: `drop-shadow(0 0 ${headerOpacity * 20}px rgba(0, 255, 255, 0.8))`
              }}
            />
            <span className="text-white font-bold text-xl">Mesh TV Network</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-white/70 hover:text-cyan-400 transition-colors">About</a>
            <a href="#projects" className="text-white/70 hover:text-cyan-400 transition-colors">Projects</a>
            <a href="#contact" className="text-white/70 hover:text-cyan-400 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center">
        {/* 3D Background */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <Suspense fallback={null}>
              {/* Lighting */}
              <ambientLight intensity={0.3} color="#001122" />
              <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
              
              {/* Main Earth */}
              <Earth />
              
              {/* Floating Mesh Nodes */}
              <MeshNode position={[-5, 2, -2]} delay={0} />
              <MeshNode position={[5, -1, 1]} delay={1} />
              <MeshNode position={[-3, -2, 3]} delay={2} />
              <MeshNode position={[4, 3, -1]} delay={1.5} />
              
              {/* Connection Lines */}
              <ConnectionLines />
              
              {/* Orbit Controls */}
              <OrbitControls 
                enablePan={false}
                enableZoom={false}
                autoRotate={true}
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 text-center">
          {/* Transparent Bluetooth Symbol */}
          <div className="mb-8 flex justify-center">
            <Bluetooth 
              className="w-24 h-24 text-cyan-400/30 animate-pulse"
              style={{ 
                filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.3))'
              }}
            />
          </div>
          
          {/* Hero Text */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-wider">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              MESH TV
            </span>
          </h1>
          <h2 className="text-2xl md:text-4xl text-white/80 mb-8 font-light">
            NETWORK
          </h2>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Pioneering the future of decentralized streaming through 
            innovative mesh networking technology
          </p>
          
          {/* CTA Button */}
          <button className="group relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Explore Network</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
          </button>
        </div>

        {/* Animated Mesh Network Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <defs>
              <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#0088ff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Animated mesh lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={i}
                x1={Math.random() * 1000}
                y1={Math.random() * 1000}
                x2={Math.random() * 1000}
                y2={Math.random() * 1000}
                stroke="url(#meshGradient)"
                strokeWidth="1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-8">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  Revolutionary
                </span> Technology
              </h2>
              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                Mesh TV Network represents the cutting edge of decentralized streaming technology, 
                creating seamless peer-to-peer connections that redefine how content flows across digital landscapes.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-cyan-400/20">
                  <Globe className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Global Reach</h3>
                  <p className="text-white/60 text-sm">Worldwide mesh connectivity</p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-purple-400/20">
                  <Zap className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Ultra Fast</h3>
                  <p className="text-white/60 text-sm">Lightning speed transfers</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Cpu className="w-32 h-32 text-cyan-400/50" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};