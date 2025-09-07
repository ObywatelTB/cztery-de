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
  // Color for rendering (hex string)
  color?: string;
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

  // 4x4 rotation matrices for each plane
  static rotationMatrixXY(angle: number): number[][] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, -s, 0, 0],
      [s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotationMatrixXZ(angle: number): number[][] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, 0, -s, 0],
      [0, 1, 0, 0],
      [s, 0, c, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotationMatrixXW(angle: number): number[][] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, 0, 0, -s],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [s, 0, 0, c]
    ];
  }

  static rotationMatrixYZ(angle: number): number[][] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [1, 0, 0, 0],
      [0, c, -s, 0],
      [0, s, c, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotationMatrixYW(angle: number): number[][] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [1, 0, 0, 0],
      [0, c, 0, -s],
      [0, 0, 1, 0],
      [0, s, 0, c]
    ];
  }

  static rotationMatrixZW(angle: number): number[][] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, c, -s],
      [0, 0, s, c]
    ];
  }

  // Matrix multiplication for 4x4 matrices
  static matrixMultiplyMatrix(a: number[][], b: number[][]): number[][] {
    const result: number[][] = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  // Matrix-vector multiplication for 4D
  static matrixMultiplyVector(matrix: number[][], vector: Vector4D): Vector4D {
    return {
      x: matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z + matrix[0][3] * vector.w,
      y: matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z + matrix[1][3] * vector.w,
      z: matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z + matrix[2][3] * vector.w,
      w: matrix[3][0] * vector.x + matrix[3][1] * vector.y + matrix[3][2] * vector.z + matrix[3][3] * vector.w,
    };
  }

  // Compose all rotation matrices into a single transformation matrix
  static composeTransformMatrix(transform: Transform4D): number[][] {
    // Start with identity matrix
    let result: number[][] = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    // Apply rotations in sequence: XY, XZ, XW, YZ, YW, ZW
    // Matrix multiplication order: result = R_zw * R_yw * R_yz * R_xw * R_xz * R_xy
    const matrices = [
      this.rotationMatrixXY(transform.rotation_xy),
      this.rotationMatrixXZ(transform.rotation_xz),
      this.rotationMatrixXW(transform.rotation_xw),
      this.rotationMatrixYZ(transform.rotation_yz),
      this.rotationMatrixYW(transform.rotation_yw),
      this.rotationMatrixZW(transform.rotation_zw),
    ];

    // Multiply matrices in reverse order to match sequential application
    for (let i = matrices.length - 1; i >= 0; i--) {
      result = this.matrixMultiplyMatrix(matrices[i], result);
    }

    return result;
  }

  // Apply all rotations using matrix-based approach
  static rotate(point: Vector4D, transform: Transform4D): Vector4D {
    const matrix = this.composeTransformMatrix(transform);
    return this.matrixMultiplyVector(matrix, point);
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
