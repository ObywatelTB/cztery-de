'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Shape4D, Vector4DUtils, Transform4D } from '@/types/4d';
import { useTransformStore } from '@/store/transformStore';

interface FourDVisualizationProps {
  shapes: Shape4D[];
  projectionDistance?: number;
  show4DAxes?: boolean;
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


// 4D coordinate axes component with subtle colors
const CoordinateAxes4D = React.memo(({
  projectionDistance = 5,
  showAxes = true
}: {
  projectionDistance?: number;
  showAxes?: boolean;
}) => {
  const transform = useTransformStore((state) => state.transform);

  // Refs for the line geometries
  const xAxisGeo = useRef<THREE.BufferGeometry>(null!);
  const yAxisGeo = useRef<THREE.BufferGeometry>(null!);
  const zAxisGeo = useRef<THREE.BufferGeometry>(null!);
  const wAxisGeo = useRef<THREE.BufferGeometry>(null!);

  // State for axis endpoint positions (for text labels)
  const [xAxisEnd, setXAxisEnd] = React.useState(new THREE.Vector3(2, 0, 0));
  const [yAxisEnd, setYAxisEnd] = React.useState(new THREE.Vector3(0, 2, 0));
  const [zAxisEnd, setZAxisEnd] = React.useState(new THREE.Vector3(0, 0, 2));
  const [wAxisEnd, setWAxisEnd] = React.useState(new THREE.Vector3(1.5, 0, 0));

  // Create 4D axis vectors that will be projected to 3D
  const create4DAxis = (axisVector: {x: number, y: number, z: number, w: number}) => {
    const points = [
      { x: 0, y: 0, z: 0, w: 0 },
      axisVector
    ];

    return points.map(point => {
      // Apply global transform
      let tempPoint = Vector4DUtils.rotate(point, transform);
      tempPoint = Vector4DUtils.add(tempPoint, transform.translation);

      // Project to 3D
      return Vector4DUtils.projectTo3D(tempPoint, projectionDistance);
    });
  };

  // Update transformable axes positions in useFrame (only when enabled)
  useFrame(() => {
    if (showAxes) {
      // Update X axis
      const xPoints = create4DAxis({ x: 2, y: 0, z: 0, w: 0 });
      if (xAxisGeo.current) {
        const positions = xAxisGeo.current.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, xPoints[0].x, xPoints[0].y, xPoints[0].z);
        positions.setXYZ(1, xPoints[1].x, xPoints[1].y, xPoints[1].z);
        positions.needsUpdate = true;
      }
      setXAxisEnd(new THREE.Vector3(xPoints[1].x, xPoints[1].y, xPoints[1].z));

      // Update Y axis
      const yPoints = create4DAxis({ x: 0, y: 2, z: 0, w: 0 });
      if (yAxisGeo.current) {
        const positions = yAxisGeo.current.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, yPoints[0].x, yPoints[0].y, yPoints[0].z);
        positions.setXYZ(1, yPoints[1].x, yPoints[1].y, yPoints[1].z);
        positions.needsUpdate = true;
      }
      setYAxisEnd(new THREE.Vector3(yPoints[1].x, yPoints[1].y, yPoints[1].z));

      // Update Z axis
      const zPoints = create4DAxis({ x: 0, y: 0, z: 2, w: 0 });
      if (zAxisGeo.current) {
        const positions = zAxisGeo.current.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, zPoints[0].x, zPoints[0].y, zPoints[0].z);
        positions.setXYZ(1, zPoints[1].x, zPoints[1].y, zPoints[1].z);
        positions.needsUpdate = true;
      }
      setZAxisEnd(new THREE.Vector3(zPoints[1].x, zPoints[1].y, zPoints[1].z));

      // Update W axis - goes along both X and W dimensions for visibility
      const wPoints = create4DAxis({ x: 1.5, y: 0, z: 0, w: 2 });
      if (wAxisGeo.current) {
        const positions = wAxisGeo.current.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, wPoints[0].x, wPoints[0].y, wPoints[0].z);
        positions.setXYZ(1, wPoints[1].x, wPoints[1].y, wPoints[1].z);
        positions.needsUpdate = true;
      }
      setWAxisEnd(new THREE.Vector3(wPoints[1].x, wPoints[1].y, wPoints[1].z));
    }
  });

  // Always show fixed reference axes, transformable axes only when enabled

  return (
    <group>
      {/* Fixed reference axes at origin (always visible) */}
      <group>
        {/* Fixed X axis - bright red */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-1, 0, 0, 1, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff4444" linewidth={1} />
        </line>
        <Text
          position={[1.2, 0.1, 0]}
          fontSize={0.25}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
        >
          X0
        </Text>

        {/* Fixed Y axis - bright green */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -1, 0, 0, 1, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#44ff44" linewidth={1} />
        </line>
        <Text
          position={[0.1, 1.2, 0]}
          fontSize={0.25}
          color="#44ff44"
          anchorX="center"
          anchorY="middle"
        >
          Y0
        </Text>

        {/* Fixed Z axis - bright blue */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, -1, 0, 0, 1])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4444ff" linewidth={1} />
        </line>
        <Text
          position={[0.1, 0.1, 1.2]}
          fontSize={0.25}
          color="#4444ff"
          anchorX="center"
          anchorY="middle"
        >
          Z0
        </Text>

        {/* Fixed W axis - bright purple */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-0.8, 0, 0, 0.8, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#cc44ff" linewidth={1} />
        </line>
        <Text
          position={[0.9, 0.1, 0]}
          fontSize={0.25}
          color="#cc44ff"
          anchorX="center"
          anchorY="middle"
        >
          W0
        </Text>
      </group>

      {/* Transformable axes (when enabled) */}
      {showAxes && (
        <group>
          {/* X axis - subtle red */}
          <line>
            <bufferGeometry ref={xAxisGeo}>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 2, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff9999" />
          </line>
          <Text
            position={[xAxisEnd.x + 0.2, xAxisEnd.y + 0.1, xAxisEnd.z]}
            fontSize={0.3}
            color="#ff9999"
            anchorX="center"
            anchorY="middle"
          >
            X
          </Text>

          {/* Y axis - subtle green */}
          <line>
            <bufferGeometry ref={yAxisGeo}>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 0, 2, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#99ff99" />
          </line>
          <Text
            position={[yAxisEnd.x + 0.1, yAxisEnd.y + 0.3, yAxisEnd.z]}
            fontSize={0.3}
            color="#99ff99"
            anchorX="center"
            anchorY="middle"
          >
            Y
          </Text>

          {/* Z axis - subtle blue */}
          <line>
            <bufferGeometry ref={zAxisGeo}>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 0, 0, 2])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#9999ff" />
          </line>
          <Text
            position={[zAxisEnd.x + 0.1, zAxisEnd.y + 0.1, zAxisEnd.z + 0.3]}
            fontSize={0.3}
            color="#9999ff"
            anchorX="center"
            anchorY="middle"
          >
            Z
          </Text>

          {/* W axis - subtle purple */}
          <line>
            <bufferGeometry ref={wAxisGeo}>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 1.5, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#cc99ff" />
          </line>
          <Text
            position={[wAxisEnd.x + 0.3, wAxisEnd.y + 0.1, wAxisEnd.z]}
            fontSize={0.3}
            color="#cc99ff"
            anchorX="center"
            anchorY="middle"
          >
            W
          </Text>
        </group>
      )}
    </group>
  );
});

// Legacy 3D axes component for backward compatibility
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
  projectionDistance = 5,
  show4DAxes = false
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

        {/* 4D coordinate axes with subtle colors */}
        <CoordinateAxes4D
          projectionDistance={projectionDistance}
          showAxes={show4DAxes}
        />
      </Canvas>
    </div>
  );
});

// Add display name for debugging
FourDVisualization.displayName = 'FourDVisualization';

export default FourDVisualization;
