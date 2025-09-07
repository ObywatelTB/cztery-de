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
  // If true or undefined, global transforms apply. If false, shape stays static.
  affectedByGlobalTransform?: boolean;
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

  // New utility function to apply all rotations
  static rotate(point: Vector4D, transform: Transform4D): Vector4D {
    let rotated = { ...point };

    // XY rotation
    const cosXY = Math.cos(transform.rotation_xy);
    const sinXY = Math.sin(transform.rotation_xy);
    let tempX = rotated.x * cosXY - rotated.y * sinXY;
    let tempY = rotated.x * sinXY + rotated.y * cosXY;
    rotated.x = tempX;
    rotated.y = tempY;

    // XZ rotation
    const cosXZ = Math.cos(transform.rotation_xz);
    const sinXZ = Math.sin(transform.rotation_xz);
    tempX = rotated.x * cosXZ - rotated.z * sinXZ;
    let tempZ = rotated.x * sinXZ + rotated.z * cosXZ;
    rotated.x = tempX;
    rotated.z = tempZ;

    // XW rotation
    const cosXW = Math.cos(transform.rotation_xw);
    const sinXW = Math.sin(transform.rotation_xw);
    tempX = rotated.x * cosXW - rotated.w * sinXW;
    let tempW = rotated.x * sinXW + rotated.w * cosXW;
    rotated.x = tempX;
    rotated.w = tempW;
    
    // YZ rotation
    const cosYZ = Math.cos(transform.rotation_yz);
    const sinYZ = Math.sin(transform.rotation_yz);
    tempY = rotated.y * cosYZ - rotated.z * sinYZ;
    tempZ = rotated.y * sinYZ + rotated.z * cosYZ;
    rotated.y = tempY;
    rotated.z = tempZ;

    // YW rotation
    const cosYW = Math.cos(transform.rotation_yw);
    const sinYW = Math.sin(transform.rotation_yw);
    tempY = rotated.y * cosYW - rotated.w * sinYW;
    tempW = rotated.y * sinYW + rotated.w * cosYW;
    rotated.y = tempY;
    rotated.w = tempW;
    
    // ZW rotation
    const cosZW = Math.cos(transform.rotation_zw);
    const sinZW = Math.sin(transform.rotation_zw);
    tempZ = rotated.z * cosZW - rotated.w * sinZW;
    tempW = rotated.z * sinZW + rotated.w * cosZW;
    rotated.z = tempZ;
    rotated.w = tempW;

    return rotated;
  }

  // Project 4D point to 3D using perspective projection - optimized
  static projectTo3D(point: Vector4D, distance: number = 5): { x: number; y: number; z: number } {
    // Handle edge case where w approaches distance to prevent division by near-zero
    const denominator = distance - point.w;
    if (Math.abs(denominator) < 0.001) {
      return { x: point.x * 1000, y: point.y * 1000, z: point.z * 1000 };
    }

    const factor = distance / denominator;
    return {
      x: point.x * factor,
      y: point.y * factor,
      z: point.z * factor,
    };
  }
}
