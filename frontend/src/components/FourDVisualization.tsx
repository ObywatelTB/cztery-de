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
      let rotated = Vector4DUtils.add(translated, transform.translation);

      // Apply all 6 rotation planes in 4D space (visible in 3D projection)

      // XY rotation - affects X and Y coordinates
      const cosXY = Math.cos(transform.rotation_xy);
      const sinXY = Math.sin(transform.rotation_xy);
      const newX = rotated.x * cosXY - rotated.y * sinXY;
      const newY = rotated.x * sinXY + rotated.y * cosXY;
      rotated = { ...rotated, x: newX, y: newY };

      // XZ rotation - affects X and Z coordinates
      const cosXZ = Math.cos(transform.rotation_xz);
      const sinXZ = Math.sin(transform.rotation_xz);
      const newX2 = rotated.x * cosXZ - rotated.z * sinXZ;
      const newZ = rotated.x * sinXZ + rotated.z * cosXZ;
      rotated = { ...rotated, x: newX2, z: newZ };

      // XW rotation - affects X and W coordinates
      const cosXW = Math.cos(transform.rotation_xw);
      const sinXW = Math.sin(transform.rotation_xw);
      const newX3 = rotated.x * cosXW - rotated.w * sinXW;
      const newW = rotated.x * sinXW + rotated.w * cosXW;
      rotated = { ...rotated, x: newX3, w: newW };

      // YZ rotation - affects Y and Z coordinates
      const cosYZ = Math.cos(transform.rotation_yz);
      const sinYZ = Math.sin(transform.rotation_yz);
      const newY2 = rotated.y * cosYZ - rotated.z * sinYZ;
      const newZ2 = rotated.y * sinYZ + rotated.z * cosYZ;
      rotated = { ...rotated, y: newY2, z: newZ2 };

      // YW rotation - affects Y and W coordinates
      const cosYW = Math.cos(transform.rotation_yw);
      const sinYW = Math.sin(transform.rotation_yw);
      const newY3 = rotated.y * cosYW - rotated.w * sinYW;
      const newW2 = rotated.y * sinYW + rotated.w * cosYW;
      rotated = { ...rotated, y: newY3, w: newW2 };

      // ZW rotation - affects Z and W coordinates
      const cosZW = Math.cos(transform.rotation_zw);
      const sinZW = Math.sin(transform.rotation_zw);
      const newZ3 = rotated.z * cosZW - rotated.w * sinZW;
      const newW3 = rotated.z * sinZW + rotated.w * cosZW;
      rotated = { ...rotated, z: newZ3, w: newW3 };

      // Apply 4D to 3D projection
      return Vector4DUtils.projectTo3D(rotated, projectionDistance);
    });

    return result;
  }, [shape.vertices, shape.position, transform.translation, transform.rotation_xy, transform.rotation_xz, transform.rotation_xw, transform.rotation_yz, transform.rotation_yw, transform.rotation_zw, projectionDistance]);

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
