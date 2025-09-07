'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FourDVisualization from '@/components/FourDVisualization';
import { Shape4D } from '@/types/4d';
import { createGroundPlane, createGreenPlane, createBluePlane } from '@/shapes/definitions';
import { useTransformForUI } from '@/store/transformStore';
import { KeyboardControls } from '@/components/KeyboardControls';


const API_BASE_URL = 'http://localhost:3010';

export default function Home() {
  const [allShapes, setAllShapes] = useState<Shape4D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWhitePlane, setShowWhitePlane] = useState(false);
  const [showOrangePlane, setShowOrangePlane] = useState(true);
  const [showBluePlane, setShowBluePlane] = useState(false);
  const [show4DAxes, setShow4DAxes] = useState(true);
  const transform = useTransformForUI();

  // Fetch 4D cube from backend and create planes once
  const fetchCube = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/shapes/cube?size=1.5`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cubeData = await response.json();

      // Create all shapes once and store them
      const cube = cubeData;
      const whitePlane = createGroundPlane({ size: 10, divisions: 24, y: -3, w: 0 });
      const greenPlane = createGreenPlane({ size: 15, y: -2, w: 0 });
      const bluePlane = createBluePlane({ size: 10, divisions: 24, y: -1, w: 1 });

      setAllShapes([cube, whitePlane, greenPlane, bluePlane]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch 4D cube');
      console.error('Error fetching cube:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter shapes based on visibility state
  const shapes = allShapes.filter((shape, index) => {
    if (index === 0) return true; // Always show cube
    if (index === 1) return showWhitePlane; // White plane
    if (index === 2) return showOrangePlane; // Green plane
    if (index === 3) return showBluePlane; // Blue plane
    return true;
  });

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
          <p><kbd className="bg-gray-700 px-1 rounded">Z</kbd> - Move W deeper (+W)</p>
          <p><kbd className="bg-gray-700 px-1 rounded">X</kbd> - Move W shallower (-W)</p>
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

      {/* Visibility Controls */}
      <div className="absolute top-96 left-4 z-10 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-sm">
        <div className="space-y-4">
          {/* Plane Visibility */}
          <div>
            <h3 className="font-semibold mb-3">Plane Visibility:</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWhitePlane}
                  onChange={(e) => setShowWhitePlane(e.target.checked)}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">White Plane</span>
                <div className="w-3 h-3 bg-white rounded border"></div>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOrangePlane}
                  onChange={(e) => setShowOrangePlane(e.target.checked)}
                  className="rounded border-gray-600 text-green-500 focus:ring-green-500"
                />
                <span className="text-gray-300">Green Plane</span>
                <div className="w-3 h-3 bg-green-400 rounded border"></div>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBluePlane}
                  onChange={(e) => setShowBluePlane(e.target.checked)}
                  className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">Blue Plane (w=1)</span>
                <div className="w-3 h-3 bg-blue-400 rounded border"></div>
              </label>
            </div>
          </div>

          {/* 4D Axes Control */}
          <div>
            <h3 className="font-semibold mb-3">4D Axes:</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={show4DAxes}
                onChange={(e) => setShow4DAxes(e.target.checked)}
                className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-300">Show 4D Axes</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-300 rounded border"></div>
                <div className="w-2 h-2 bg-green-300 rounded border"></div>
                <div className="w-2 h-2 bg-blue-300 rounded border"></div>
                <div className="w-2 h-2 bg-purple-300 rounded border"></div>
              </div>
            </label>
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
            projectionDistance={7}
            show4DAxes={show4DAxes}
          />
        )}
      </div>
    </div>
  );
}
