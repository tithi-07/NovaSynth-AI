import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

const Node = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <sphereGeometry args={[0.12, 32, 32]} />
    <meshStandardMaterial
      color="#06B6D4"
      emissive="#06B6D4"
      emissiveIntensity={3}
      toneMapped={false}
      roughness={0.1}
    />
  </mesh>
);

const Connection = ({ start, end }: { start: [number, number, number]; end: [number, number, number] }) => (
  <Line
    points={[start, end]}
    color="#22D3EE"
    lineWidth={1}
    transparent
    opacity={0.2}
  />
);

const MoleculeStructure = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const { nodes, connections } = useMemo(() => {
    const nodeCount = 15;
    const generatedNodes: [number, number, number][] = [];
    const generatedConnections: [[number, number, number], [number, number, number]][] = [];

    // Generate random nodes in a sphere
    for (let i = 0; i < nodeCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 2 + Math.random() * 1.5;
        generatedNodes.push([
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        ]);
    }
    // Add core
    generatedNodes.push([0, 0, 0]);

    // Create connections based on distance
    generatedNodes.forEach((node, i) => {
        generatedNodes.forEach((otherNode, j) => {
            if (i < j) {
                const dist = Math.sqrt(
                    Math.pow(node[0] - otherNode[0], 2) +
                    Math.pow(node[1] - otherNode[1], 2) +
                    Math.pow(node[2] - otherNode[2], 2)
                );
                if (dist < 3.5) {
                    generatedConnections.push([node, otherNode]);
                }
            }
        });
    });

    return { nodes: generatedNodes, connections: generatedConnections };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.1;
        groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => <Node key={i} position={pos} />)}
      {connections.map((conn, i) => <Connection key={i} start={conn[0]} end={conn[1]} />)}
    </group>
  );
};

const Molecule3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06B6D4" />
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <MoleculeStructure />
        </Float>
      </Canvas>
    </div>
  );
};

export default Molecule3D;