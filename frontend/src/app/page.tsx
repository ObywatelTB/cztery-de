'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FourDVisualization from '@/components/FourDVisualization';
import { Shape4D, Transform4D } from '@/types/4d';

const API_BASE_URL = 'http://localhost:8000';

export default function Home() {
  const [shape, setShape] = useState<Shape4D | null>(null);
  const [transform, setTransform] = useState<Transform4D>({
    rotation_xy: 0,
    rotation_xz: 0,
    rotation_xw: 0,
    rotation_yz: 0,
    rotation_yw: 0,
    rotation_zw: 0,
    translation: { x: 0, y: 0, z: 0, w: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch 4D cube from backend
  const fetchCube = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/shapes/cube`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cubeData = await response.json();
      setShape(cubeData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch 4D cube');
      console.error('Error fetching cube:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const moveSpeed = 0.1;
      const rotateSpeed = 0.1;

      setTransform(prev => {
        const newTransform = { ...prev };

        switch (event.key.toLowerCase()) {
          // Translation controls
          case 'w':
          case 'arrowup':
            newTransform.translation.z -= moveSpeed;
            break;
          case 's':
          case 'arrowdown':
            newTransform.translation.z += moveSpeed;
            break;
          case 'a':
          case 'arrowleft':
            newTransform.translation.x -= moveSpeed;
            break;
          case 'd':
          case 'arrowright':
            newTransform.translation.x += moveSpeed;
            break;
          case 'q':
            newTransform.translation.y += moveSpeed;
            break;
          case 'e':
            newTransform.translation.y -= moveSpeed;
            break;
          case 'z':
            newTransform.translation.w += moveSpeed;
            break;
          case 'x':
            newTransform.translation.w -= moveSpeed;
            break;

          // Rotation controls
          case 'i':
            newTransform.rotation_xy += rotateSpeed;
            break;
          case 'k':
            newTransform.rotation_xy -= rotateSpeed;
            break;
          case 'j':
            newTransform.rotation_xz += rotateSpeed;
            break;
          case 'l':
            newTransform.rotation_xz -= rotateSpeed;
            break;
          case 'u':
            newTransform.rotation_xw += rotateSpeed;
            break;
          case 'o':
            newTransform.rotation_xw -= rotateSpeed;
            break;

          default:
            return prev;
        }

        return newTransform;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
          <p><kbd className="bg-gray-700 px-1 rounded">IJKL</kbd> - Rotate</p>
        </div>
      </div>

      {/* Transform Info */}
      <div className="absolute top-20 right-4 z-10 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Position:</h3>
        <div className="space-y-1 text-gray-300 font-mono">
          <p>X: {transform.translation.x.toFixed(2)}</p>
          <p>Y: {transform.translation.y.toFixed(2)}</p>
          <p>Z: {transform.translation.z.toFixed(2)}</p>
          <p>W: {transform.translation.w.toFixed(2)}</p>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="w-full h-screen">
        {shape && (
          <FourDVisualization
            shape={shape}
            transform={transform}
            projectionDistance={5}
          />
        )}
      </div>
    </div>
  );
}
