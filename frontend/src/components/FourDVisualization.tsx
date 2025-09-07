'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Shape4D, Vector4DUtils, Transform4D } from '@/types/4d';

interface FourDVisualizationProps {
  shape: Shape4D;
  transform: Transform4D;
  projectionDistance?: number;
}

// Component to render a single edge in 3D space
function Edge3D({
  start,
  end,
  color = '#ffffff'
}: {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  color?: string;
}) {
  const points = [
    new THREE.Vector3(start.x, start.y, start.z),
    new THREE.Vector3(end.x, end.y, end.z),
  ];

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
    />
  );
}

// Component to render a single vertex in 3D space
function Vertex3D({
  position,
  size = 0.05,
  color = '#ff6b6b'
}: {
  position: { x: number; y: number; z: number };
  size?: number;
  color?: string;
}) {
  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Main 4D shape renderer
function Shape4DRenderer({
  shape,
  transform,
  projectionDistance
}: {
  shape: Shape4D;
  transform: Transform4D;
  projectionDistance: number;
}) {
  const [projectedVertices, setProjectedVertices] = useState<{ x: number; y: number; z: number }[]>([]);

  // Project 4D vertices to 3D
  useEffect(() => {
    const projected = shape.vertices.map(vertex => {
      // Apply translation
      const translated = Vector4DUtils.add(vertex, shape.position);
      const withTransform = Vector4DUtils.add(translated, transform.translation);

      // For now, simple projection - in a full implementation we'd apply rotation matrices
      return Vector4DUtils.projectTo3D(withTransform, projectionDistance);
    });
    setProjectedVertices(projected);
  }, [shape, transform, projectionDistance]);

  return (
    <group>
      {/* Render edges */}
      {shape.edges.map((edge, index) => {
        if (projectedVertices[edge[0]] && projectedVertices[edge[1]]) {
          return (
            <Edge3D
              key={index}
              start={projectedVertices[edge[0]]}
              end={projectedVertices[edge[1]]}
            />
          );
        }
        return null;
      })}

      {/* Render vertices */}
      {projectedVertices.map((vertex, index) => (
        <Vertex3D key={index} position={vertex} />
      ))}
    </group>
  );
}

// Main visualization component
export default function FourDVisualization({
  shape,
  transform,
  projectionDistance = 5
}: FourDVisualizationProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 75 }}
        style={{ background: '#0a0a0a' }}
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
        />

        {/* Add coordinate axes for reference */}
        <group>
          <Line points={[new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0)]} color="#ff0000" />
          <Line points={[new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 2, 0)]} color="#00ff00" />
          <Line points={[new THREE.Vector3(0, 0, -2), new THREE.Vector3(0, 0, 2)]} color="#0000ff" />
        </group>
      </Canvas>
    </div>
  );
}
