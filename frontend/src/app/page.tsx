'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FourDVisualization from '@/components/FourDVisualization';
import { Shape4D } from '@/types/4d';
import { createGroundPlane } from '@/shapes/definitions';
import { useTransformForUI } from '@/store/transformStore';
import { KeyboardControls } from '@/components/KeyboardControls';


const API_BASE_URL = 'http://localhost:3010';

export default function Home() {
  const [shapes, setShapes] = useState<Shape4D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const transform = useTransformForUI();

  // Fetch 4D cube from backend
  const fetchCube = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/shapes/cube`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cubeData = await response.json();
      const plane = createGroundPlane({ size: 10, divisions: 24, y: -2, w: 0 });
      setShapes([cubeData, plane]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch 4D cube');
      console.error('Error fetching cube:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize cube on component mount
  useEffect(() => {
    fetchCube();
  }, [fetchCube]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading 4D Cube...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchCube}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <KeyboardControls />
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
        <h1 className="text-2xl font-bold text-center">4D Space Visualization</h1>
        <p className="text-center text-gray-300 mt-1">
          Use keyboard controls to navigate the 4D hypercube
        </p>
      </div>

      {/* Controls Info */}
      <div className="absolute top-20 left-4 z-10 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Controls:</h3>
        <div className="space-y-1 text-gray-300">
          <p><kbd className="bg-gray-700 px-1 rounded">WASD</kbd> - Move X/Y</p>
          <p><kbd className="bg-gray-700 px-1 rounded">QE</kbd> - Move Z</p>
          <p><kbd className="bg-gray-700 px-1 rounded">ZX</kbd> - Move W (4th dimension)</p>
          <div className="mt-2">
            <p className="text-gray-400 text-xs mb-1">4D Rotations:</p>
            <p><kbd className="bg-gray-700 px-1 rounded">I/K</kbd> - XY plane</p>
            <p><kbd className="bg-gray-700 px-1 rounded">J/L</kbd> - XZ plane</p>
            <p><kbd className="bg-gray-700 px-1 rounded">U/O</kbd> - XW plane</p>
            <p><kbd className="bg-gray-700 px-1 rounded">7/8</kbd> - YZ plane</p>
            <p><kbd className="bg-gray-700 px-1 rounded">9/0</kbd> - YW plane</p>
            <p><kbd className="bg-gray-700 px-1 rounded">;/'</kbd> - ZW plane</p>
          </div>
        </div>
      </div>

      {/* Transform Info - memoized for performance */}
      <div className="absolute top-20 right-4 z-10 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-sm max-w-xs">
        <h3 className="font-semibold mb-2">Position:</h3>
        <div className="space-y-1 text-gray-300 font-mono mb-3">
          <p>X: {transform.translation.x.toFixed(1)}</p>
          <p>Y: {transform.translation.y.toFixed(1)}</p>
          <p>Z: {transform.translation.z.toFixed(1)}</p>
          <p>W: {transform.translation.w.toFixed(1)}</p>
        </div>

        <h3 className="font-semibold mb-2">Rotations:</h3>
        <div className="space-y-1 text-gray-300 font-mono text-xs">
          <p>XY: {(transform.rotation_xy * 180 / Math.PI).toFixed(0)}°</p>
          <p>XZ: {(transform.rotation_xz * 180 / Math.PI).toFixed(0)}°</p>
          <p>XW: {(transform.rotation_xw * 180 / Math.PI).toFixed(0)}°</p>
          <p>YZ: {(transform.rotation_yz * 180 / Math.PI).toFixed(0)}°</p>
          <p>YW: {(transform.rotation_yw * 180 / Math.PI).toFixed(0)}°</p>
          <p>ZW: {(transform.rotation_zw * 180 / Math.PI).toFixed(0)}°</p>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="w-full h-screen">
        {shapes.length > 0 && (
          <FourDVisualization
            shapes={shapes}
            projectionDistance={5}
          />
        )}
      </div>
    </div>
  );
}
