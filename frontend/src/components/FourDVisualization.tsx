'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Shape4D, Vector4DUtils, Transform4D } from '@/types/4d';

interface FourDVisualizationProps {
  shape: Shape4D;
  transform: Transform4D;
  projectionDistance?: number;
}

// Memoized component to render a single edge in 3D space
const Edge3D = React.memo(({
  start,
  end,
  color = '#ffffff'
}: {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  color?: string;
}) => {
  const points = useMemo(() => [
    new THREE.Vector3(start.x, start.y, start.z),
    new THREE.Vector3(end.x, end.y, end.z),
  ], [start.x, start.y, start.z, end.x, end.y, end.z]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
    />
  );
});

// Memoized component to render a single vertex in 3D space
const Vertex3D = React.memo(({
  position,
  size = 0.05,
  color = '#ff6b6b'
}: {
  position: { x: number; y: number; z: number };
  size?: number;
  color?: string;
}) => {
  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
});

// Main 4D shape renderer - optimized for performance
function Shape4DRenderer({
  shape,
  transform,
  projectionDistance
}: {
  shape: Shape4D;
  transform: Transform4D;
  projectionDistance: number;
}) {
  // Memoize projected vertices to avoid recalculation on every render
  const projectedVertices = useMemo(() => {
    const result = shape.vertices.map(vertex => {
      // Apply translation
      const translated = Vector4DUtils.add(vertex, shape.position);
      const withTransform = Vector4DUtils.add(translated, transform.translation);

      // For now, simple projection - in a full implementation we'd apply rotation matrices
      return Vector4DUtils.projectTo3D(withTransform, projectionDistance);
    });


    return result;
  }, [shape.vertices, shape.position, transform.translation, projectionDistance]);

  // Memoize edges to avoid recreating edge components
  const edges = useMemo(() => {
    return shape.edges.map((edge, index) => {
      const startVertex = projectedVertices[edge[0]];
      const endVertex = projectedVertices[edge[1]];

      if (!startVertex || !endVertex) return null;

      return (
        <Edge3D
          key={`edge-${index}`}
          start={startVertex}
          end={endVertex}
        />
      );
    });
  }, [shape.edges, projectedVertices]);

  // Memoize vertices to avoid recreating vertex components
  const vertices = useMemo(() => {
    return projectedVertices.map((vertex, index) => (
      <Vertex3D
        key={`vertex-${index}`}
        position={vertex}
      />
    ));
  }, [projectedVertices]);

  return (
    <group>
      {edges}
      {vertices}
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
      <Line points={xAxisPoints} color="#ff0000" lineWidth={1} />
      <Line points={yAxisPoints} color="#00ff00" lineWidth={1} />
      <Line points={zAxisPoints} color="#0000ff" lineWidth={1} />
    </group>
  );
});

// Main visualization component - optimized for high frame rates
const FourDVisualization = React.memo(({
  shape,
  transform,
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

        <Shape4DRenderer
          shape={shape}
          transform={transform}
          projectionDistance={projectionDistance}
        />

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
