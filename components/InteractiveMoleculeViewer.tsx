import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Center, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Cuboid, Hexagon, ShieldCheck, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { MoleculeStructure, Atom3D, Atom2D, Bond3D, Structure2D } from '../types';
import Tooltip from './Tooltip';

interface Props {
  moleculeName: string;
  structureData?: MoleculeStructure;
  height?: string;
  className?: string;
}

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

// CPK Coloring Standard
const ATOM_COLORS: Record<string, string> = {
  'H': '#FFFFFF', 'C': '#909090', 'N': '#3050F8', 'O': '#FF0D0D',
  'F': '#90E050', 'Cl': '#1FF01F', 'Br': '#A62929', 'I': '#940094',
  'P': '#FF8000', 'S': '#FFFF30', 'B': '#FFB5B5', 'default': '#DA70D6'
};

// Atomic Number to Symbol Map for PubChem Parsing
const ATOMIC_NUMBER_MAP: Record<number, string> = {
  1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
  11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 19: 'K', 20: 'Ca',
  26: 'Fe', 29: 'Cu', 30: 'Zn', 35: 'Br', 47: 'Ag', 53: 'I', 79: 'Au', 80: 'Hg'
};

const getAtomColor = (el: string) => ATOM_COLORS[el] || ATOM_COLORS[el.charAt(0).toUpperCase() + el.slice(1)] || ATOM_COLORS['default'];

// ----------------------------------------------------------------------
// 3D COMPONENTS
// ----------------------------------------------------------------------

const Bond = ({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) => {
    const ref = useRef<THREE.Mesh>(null);
    useLayoutEffect(() => {
        if (ref.current) {
            const mid = start.clone().add(end).multiplyScalar(0.5);
            ref.current.position.copy(mid);
            ref.current.lookAt(end);
            ref.current.rotateX(Math.PI / 2);
        }
    }, [start, end]);
    const dist = start.distanceTo(end);
    return (
        <mesh ref={ref}>
            <cylinderGeometry args={[0.1, 0.1, dist, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
        </mesh>
    );
};

const MoleculeStructure3D = ({ moleculeName, structureData }: { moleculeName: string, structureData?: MoleculeStructure }) => {
    const { nodes, connections } = useMemo(() => {
        let atomsList: any[] = [];
        let bondsList: any[] = [];
        if (structureData && structureData.atoms && structureData.atoms.length > 0) {
            const centroid = new THREE.Vector3();
            structureData.atoms.forEach(a => centroid.add(new THREE.Vector3(a.x, a.y, a.z)));
            centroid.divideScalar(structureData.atoms.length);

            let maxDist = 0;
            structureData.atoms.forEach(a => {
                const dist = new THREE.Vector3(a.x, a.y, a.z).distanceTo(centroid);
                if(dist > maxDist) maxDist = dist;
            });
            const scale = maxDist > 0 ? 5.5 / maxDist : 1;

            atomsList = structureData.atoms.map(a => ({
                pos: new THREE.Vector3(a.x, a.y, a.z).sub(centroid).multiplyScalar(scale),
                element: a.element,
                color: getAtomColor(a.element)
            }));
            bondsList = structureData.bonds.map(b => [b.from, b.to]);
        }
        return { nodes: atomsList, connections: bondsList };
    }, [moleculeName, structureData]);

    if (nodes.length === 0) return null;

    return (
        <group>
            {nodes.map((node, i) => (
                <mesh key={i} position={node.pos}>
                    <sphereGeometry args={[node.element === 'H' ? 0.2 : 0.35, 32, 32]} />
                    <meshStandardMaterial color={node.color} roughness={0.2} metalness={0.2} />
                </mesh>
            ))}
            {connections.map((conn, i) => (
                <Bond key={i} start={nodes[conn[0]].pos} end={nodes[conn[1]].pos} />
            ))}
        </group>
    )
}

// ----------------------------------------------------------------------
// 2D COMPONENT (With Zoom/Pan & PubChem Support)
// ----------------------------------------------------------------------

const MoleculeStructure2D = ({ moleculeName, structureData }: { moleculeName: string, structureData?: MoleculeStructure }) => {
    const [pubChemData, setPubChemData] = useState<Structure2D | null>(null);
    const [isLoadingPubChem, setIsLoadingPubChem] = useState(false);
    
    // Zoom/Pan State
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch from PubChem
    useEffect(() => {
        const fetchPubChem = async () => {
            if (!moleculeName) return;
            // Don't re-fetch if we already have data for this molecule (basic check)
            setPubChemData(null);
            setIsLoadingPubChem(true);

            try {
                // Fetch 2D JSON record from PubChem
                const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(moleculeName)}/JSON?record_type=2d`);
                const data = await response.json();

                if (data.PC_Compounds && data.PC_Compounds[0]) {
                    const record = data.PC_Compounds[0];
                    const atoms = record.atoms;
                    const coords = record.coords[0].conformers[0]; // 2D coords
                    const bonds = record.bonds;

                    if (atoms && coords) {
                        const parsedAtoms: Atom2D[] = atoms.aid.map((aid: number, i: number) => ({
                            id: aid, // PubChem AIDs are often 1-based, we keep them as IDs
                            element: ATOMIC_NUMBER_MAP[atoms.element[i]] || 'X',
                            x: coords.x[i],
                            y: coords.y[i] * -1 // Flip Y for SVG rendering
                        }));

                        const parsedBonds = bonds ? bonds.aid1.map((from: number, i: number) => ({
                            from: from,
                            to: bonds.aid2[i],
                            order: bonds.order[i]
                        })) : [];

                        setPubChemData({
                            atoms: parsedAtoms,
                            bonds: parsedBonds
                        });
                    }
                }
            } catch (err) {
                console.warn("PubChem 2D fetch failed, falling back to AI data.", err);
            } finally {
                setIsLoadingPubChem(false);
            }
        };

        fetchPubChem();
    }, [moleculeName]);

    // Derived Data for Rendering
    const { nodes, connections, viewBox, isFallback } = useMemo(() => {
        let atomsList: Atom2D[] = [];
        let bondsList: any[] = [];
        let isFallbackData = false;
        let isOfficial = false;

        // 1. Priority: PubChem Data
        if (pubChemData) {
            atomsList = pubChemData.atoms;
            bondsList = pubChemData.bonds;
            isOfficial = true;
        }
        // 2. Fallback: AI Generated 2D Data
        else if (structureData?.structure2D?.atoms?.length && structureData.structure2D.atoms.length > 0) {
             atomsList = structureData.structure2D.atoms;
             bondsList = structureData.structure2D.bonds || [];
        }
        // 3. Last Resort: Project 3D atoms
        else if (structureData?.atoms?.length && structureData.atoms.length > 0) {
             isFallbackData = true;
             atomsList = structureData.atoms.map((a, i) => ({ 
                 id: i, 
                 element: a.element, 
                 x: a.x * 20, 
                 y: a.y * 20 
             }));
             bondsList = structureData.bonds || [];
        }

        if (atomsList.length === 0) {
            return { nodes: [], connections: [], viewBox: "0 0 100 100", isFallback: false, isOfficial: false };
        }

        // Normalize IDs to indices for rendering map
        // PubChem IDs are arbitrary integers. We need to map them to positions.
        const idMap = new Map<number, { x: number, y: number }>();
        atomsList.forEach(a => idMap.set(a.id, { x: a.x, y: a.y }));

        // Calculate ViewBox
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        atomsList.forEach(a => {
            if (a.x < minX) minX = a.x;
            if (a.x > maxX) maxX = a.x;
            if (a.y < minY) minY = a.y;
            if (a.y > maxY) maxY = a.y;
        });

        const padding = isOfficial ? 1.5 : 20; // PubChem coords are tighter
        const width = (maxX - minX) + (padding * 2);
        const height = (maxY - minY) + (padding * 2);
        const vBoxX = minX - padding;
        const vBoxY = minY - padding;

        return { 
            nodes: atomsList, 
            connections: bondsList, 
            viewBox: `${vBoxX} ${vBoxY} ${width} ${height}`,
            isFallback: isFallbackData,
            isOfficial,
            idMap
        };
    }, [moleculeName, structureData, pubChemData]);

    // Zoom Handlers
    const handleZoomIn = () => setTransform(t => ({ ...t, k: Math.min(t.k * 1.2, 5) }));
    const handleZoomOut = () => setTransform(t => ({ ...t, k: Math.max(t.k / 1.2, 0.5) }));
    const handleReset = () => setTransform({ k: 1, x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault(); // React synthetic events can't prevent default easily on wheel for scrolling
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.5, transform.k + scaleAmount), 5);
        setTransform(prev => ({ ...prev, k: newScale }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTransform(prev => ({
            ...prev,
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y
        }));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-700/50 font-mono text-[10px]">
                <span className="opacity-50">{isLoadingPubChem ? "Fetching structure..." : "Structure unavailable"}</span>
            </div>
        );
    }

    const vbWidth = parseFloat(viewBox.split(' ')[2]);
    const strokeScale = (Math.max(0.3, vbWidth / 100)) / transform.k; // Adjust stroke based on zoom

    return (
        <div 
            className="w-full h-full relative bg-[#0B0F19] overflow-hidden cursor-move group"
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Subtle Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', 
                     backgroundSize: '20px 20px',
                     transform: `scale(${transform.k}) translate(${transform.x}px, ${transform.y}px)`,
                     transformOrigin: '0 0'
                 }}>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleZoomIn} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:border-scifi-accent shadow-lg"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={handleZoomOut} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:border-scifi-accent shadow-lg"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={handleReset} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:border-scifi-accent shadow-lg"><RotateCcw className="w-4 h-4" /></button>
            </div>

            {/* SMILES / Source Badge */}
            <div className="absolute bottom-3 left-4 flex gap-2 pointer-events-none z-10">
                {structureData?.smiles && (
                    <div className="text-[9px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 truncate max-w-[200px]">
                        SMILES: <span className="text-slate-400">{structureData.smiles}</span>
                    </div>
                )}
                <div className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${pubChemData ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {pubChemData ? 'PubChem Source' : 'AI Generated'}
                </div>
            </div>
            
            <svg 
                viewBox={viewBox} 
                preserveAspectRatio="xMidYMid meet" 
                className="w-full h-full overflow-visible drop-shadow-xl animate-fade-in"
                style={{ 
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    transformOrigin: 'center'
                }}
            >
                {/* BONDS */}
                {connections.map((conn, i) => {
                    const fromNode = nodes.find(n => n.id === conn.from);
                    const toNode = nodes.find(n => n.id === conn.to);
                    
                    if (!fromNode || !toNode) return null;

                    const isDouble = conn.order === 2;
                    const isTriple = conn.order === 3;
                    const isAromatic = conn.order === 4;
                    const baseWidth = 0.6 * strokeScale * (pubChemData ? 0.1 : 5); // Scale down significantly for PubChem coords
                    const bondColor = "#94a3b8"; // Slate-400

                    return (
                        <g key={`bond-${i}`} stroke={bondColor} strokeLinecap="round">
                             {isDouble ? (
                                <>
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} strokeWidth={baseWidth * 2.5} />
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="#0B0F19" strokeWidth={baseWidth * 0.8} />
                                </>
                             ) : isTriple ? (
                                <>
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} strokeWidth={baseWidth * 3.5} />
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="#0B0F19" strokeWidth={baseWidth * 1.5} />
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke={bondColor} strokeWidth={baseWidth * 0.5} />
                                </>
                             ) : isAromatic ? (
                                 <>
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} strokeWidth={baseWidth} strokeDasharray={`${baseWidth * 2}, ${baseWidth}`} />
                                    <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} strokeWidth={baseWidth} opacity="0.5" />
                                 </>
                             ) : (
                                <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} strokeWidth={baseWidth} />
                             )}
                        </g>
                    )
                })}
                
                {/* ATOMS - Now EXPLICIT (Showing ALL atoms) */}
                {nodes.map((node, i) => {
                    const color = getAtomColor(node.element);
                    
                    const fontSize = (pubChemData ? 0.4 : 8) * strokeScale * 4;
                    const radius = fontSize * 0.5;

                    return (
                        <g key={`node-${i}`}>
                             {/* Background to clear bonds behind text */}
                             <circle cx={node.x} cy={node.y} r={radius} fill="#0B0F19" />
                             
                             <text 
                                x={node.x} 
                                y={node.y} 
                                dy=".35em" 
                                textAnchor="middle" 
                                fontSize={fontSize} 
                                fill={color} 
                                fontWeight="bold"
                                fontFamily="sans-serif"
                                className="select-none"
                            >
                                {node.element}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const InteractiveMoleculeViewer: React.FC<Props> = ({ moleculeName, structureData, height = '300px', className = '' }) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#0B0F19] border border-slate-800 shadow-xl group ${className}`} style={{ height }}>
      {/* HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-2 pointer-events-auto shadow-lg">
            <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === '3D' ? 'bg-scifi-success' : 'bg-scifi-accent'}`}></div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider truncate max-w-[150px]">
                {moleculeName || 'Structure'}
            </span>
          </div>

          <div className="flex bg-slate-900/90 backdrop-blur rounded-lg border border-slate-700/50 p-1 pointer-events-auto shadow-lg gap-1">
              <button 
                  onClick={() => setViewMode('3D')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === '3D' 
                      ? 'bg-scifi-accent/20 text-scifi-accent shadow-sm border border-scifi-accent/20' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
              >
                  <Cuboid className="w-3.5 h-3.5" /> 3D
              </button>
              <button 
                  onClick={() => setViewMode('2D')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === '2D' 
                      ? 'bg-scifi-accent/20 text-scifi-accent shadow-sm border border-scifi-accent/20' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
              >
                  <Hexagon className="w-3.5 h-3.5" /> 2D
              </button>
          </div>
      </div>

      {viewMode === '3D' ? (
          <Canvas dpr={[1, 2]} className="w-full h-full">
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={40} />
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -5, -10]} intensity={0.5} color="#06b6d4" />
            <directionalLight position={[5, 10, 7]} intensity={0.8} />
            <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
            <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} minDistance={5} maxDistance={40} />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2} floatingRange={[-0.2, 0.2]}>
                <Center>
                    <MoleculeStructure3D moleculeName={moleculeName} structureData={structureData} />
                </Center>
            </Float>
          </Canvas>
      ) : (
          <MoleculeStructure2D moleculeName={moleculeName} structureData={structureData} />
      )}
      
      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent flex justify-between items-end pointer-events-none z-20">
          <div className="flex flex-col gap-0.5">
             <div className="text-[9px] text-slate-500 font-mono">
                {viewMode === '3D' ? 'MMFF94 FORCE-FIELD GEOMETRY' : 'STANDARD EXPLICIT STRUCTURE'}
             </div>
             {structureData?.verificationNote && (
                 <div className="mt-1 animate-fade-in self-start pointer-events-auto">
                     <Tooltip 
                        content={structureData.verificationNote}
                        trigger={
                             <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 cursor-help hover:bg-emerald-500/20 transition-colors">
                                <ShieldCheck className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{structureData.verificationNote}</span>
                             </div>
                        }
                     />
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default InteractiveMoleculeViewer;