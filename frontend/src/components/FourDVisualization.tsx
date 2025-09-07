'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Shape4D, Vector4DUtils, Transform4D } from '@/types/4d';
import { useTransformStore } from '@/store/transformStore';

interface FourDVisualizationProps {
  shapes: Shape4D[];
  projectionDistance?: number;
}

// Main 4D shape renderer - highly optimized for performance
function Shape4DRenderer({
  shape,
  projectionDistance
}: {
  shape: Shape4D;
  projectionDistance: number;
}) {
  const { vertices, edges } = shape;
  const transform = useTransformStore((state) => state.transform);

  // Create refs for the geometries that we will mutate directly
  const lineGeo = useRef<THREE.BufferGeometry>(null!);
  const pointGeo = useRef<THREE.BufferGeometry>(null!);

  // Memoize the initial vertex positions to avoid recalculating
  const initialPositions = useMemo(() => {
    const pos = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
      pos[i * 3] = vertices[i].x;
      pos[i * 3 + 1] = vertices[i].y;
      pos[i * 3 + 2] = vertices[i].z;
    }
    return pos;
  }, [vertices]);

  useFrame(() => {
    if (!lineGeo.current || !pointGeo.current) return;

    // This is the core animation loop, running at 60fps
    // It directly manipulates the geometry, bypassing React's render cycle
    const linePositions = lineGeo.current.attributes.position as THREE.BufferAttribute;
    const pointPositions = pointGeo.current.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      let tempVertex = Vector4DUtils.add(vertex, shape.position);

      if (shape.affectedByGlobalTransform !== false) {
        tempVertex = Vector4DUtils.rotate(tempVertex, transform);
        tempVertex = Vector4DUtils.add(tempVertex, transform.translation);
      }

      const p3d = Vector4DUtils.projectTo3D(tempVertex, projectionDistance);

      linePositions.setXYZ(i, p3d.x, p3d.y, p3d.z);
      pointPositions.setXYZ(i, p3d.x, p3d.y, p3d.z);
    }

    // Tell Three.js to update the geometries
    linePositions.needsUpdate = true;
    pointPositions.needsUpdate = true;
  });

  // Create the line segments geometry once
  const lineSegments = useMemo(() => {
    const indices: number[] = [];
    edges.forEach(edge => {
      indices.push(edge[0], edge[1]);
    });
    return (
      <lineSegments>
        <bufferGeometry ref={lineGeo} attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={vertices.length}
            array={initialPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            array={new Uint16Array(indices)}
            itemSize={1}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={shape.color || "#ffffff"} />
      </lineSegments>
    );
  }, [edges, initialPositions, vertices.length, shape.color]);
  
  // Create the points geometry once
  const points = useMemo(() => {
     return (
        <points>
            <bufferGeometry ref={pointGeo} attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={vertices.length}
                    array={initialPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial attach="material" color="#ff6b6b" size={0.05} />
        </points>
     )
  }, [initialPositions, vertices.length]);

  return (
    <group>
      {lineSegments}
      {points}
    </group>
  );
}


// Static coordinate axes component - only created once
const CoordinateAxes = React.memo(() => {
  const xAxisPoints = useMemo(() => [
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(2, 0, 0)
  ], []);

  const yAxisPoints = useMemo(() => [
    new THREE.Vector3(0, -2, 0),
    new THREE.Vector3(0, 2, 0)
  ], []);

  const zAxisPoints = useMemo(() => [
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(0, 0, 2)
  ], []);

  return (
    <group>
      <line points={xAxisPoints} color="#ff0000" lineWidth={1} />
      <line points={yAxisPoints} color="#00ff00" lineWidth={1} />
      <line points={zAxisPoints} color="#0000ff" lineWidth={1} />
    </group>
  );
});

// Main visualization component - optimized for high frame rates
const FourDVisualization = React.memo(({
  shapes,
  projectionDistance = 5
}: FourDVisualizationProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 75 }}
        style={{ background: '#0a0a0a' }}
        frameloop="always" // Ensure continuous rendering
        dpr={[1, 2]} // Adaptive pixel ratio for performance
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {shapes.map((shape, idx) => (
          <Shape4DRenderer
            key={idx}
            shape={shape}
            projectionDistance={projectionDistance}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={false} // Disable damping for immediate response
        />

        {/* Static coordinate axes */}
        <CoordinateAxes />
      </Canvas>
    </div>
  );
});

// Add display name for debugging
FourDVisualization.displayName = 'FourDVisualization';

export default FourDVisualization;
