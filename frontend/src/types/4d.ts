// 4D Visualization Types

export interface Vector4D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Shape4D {
  vertices: Vector4D[];
  edges: number[][]; // Pairs of vertex indices
  position: Vector4D;
}

export interface Transform4D {
  rotation_xy: number;
  rotation_xz: number;
  rotation_xw: number;
  rotation_yz: number;
  rotation_yw: number;
  rotation_zw: number;
  translation: Vector4D;
}

export interface ProjectionSettings {
  distance: number; // Distance from projection plane
  scale: number;
}

// Utility functions for 4D math
export class Vector4DUtils {
  static add(a: Vector4D, b: Vector4D): Vector4D {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
      w: a.w + b.w,
    };
  }

  static subtract(a: Vector4D, b: Vector4D): Vector4D {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
      w: a.w - b.w,
    };
  }

  static scale(v: Vector4D, s: number): Vector4D {
    return {
      x: v.x * s,
      y: v.y * s,
      z: v.z * s,
      w: v.w * s,
    };
  }

  // Project 4D point to 3D using perspective projection
  static projectTo3D(point: Vector4D, distance: number = 5): { x: number; y: number; z: number } {
    const factor = distance / (distance - point.w);
    return {
      x: point.x * factor,
      y: point.y * factor,
      z: point.z * factor,
    };
  }
}
