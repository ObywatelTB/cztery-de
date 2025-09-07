import { Shape4D, Vector4D } from '@/types/4d';

function bitCount(n: number): number {
  let count = 0;
  while (n) {
    n &= (n - 1);
    count++;
  }
  return count;
}

export function createCube(size: number = 1): Shape4D {
  const vertices: Vector4D[] = [];
  for (let i = 0; i < 16; i++) {
    const x = (i & 1) ? size : -size;
    const y = (i & 2) ? size : -size;
    const z = (i & 4) ? size : -size;
    const w = (i & 8) ? size : -size;
    vertices.push({ x, y, z, w });
  }

  const edges: number[][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if (bitCount(diff) === 1) {
        edges.push([i, j]);
      }
    }
  }

  return {
    vertices,
    edges,
    position: { x: 0, y: 0, z: 0, w: 0 }
  };
}

export function createGroundPlane(options?: {
  size?: number;       // half-extent of plane in X and Z
  divisions?: number;  // grid divisions per axis
  y?: number;          // vertical placement below cube
  w?: number;          // 4th dimension slice
}): Shape4D {
  const size = options?.size ?? 10;
  const divisions = options?.divisions ?? 20;
  const y = options?.y ?? -1.5;
  const w = options?.w ?? 0;

  const step = (size * 2) / divisions;

  // Build grid vertices at constant y and w
  const vertices: Vector4D[] = [];
  for (let iz = 0; iz <= divisions; iz++) {
    const z = -size + iz * step;
    for (let ix = 0; ix <= divisions; ix++) {
      const x = -size + ix * step;
      vertices.push({ x, y, z, w });
    }
  }

  const index = (ix: number, iz: number) => iz * (divisions + 1) + ix;

  const edges: number[][] = [];
  // Connect horizontal neighbors (along X)
  for (let iz = 0; iz <= divisions; iz++) {
    for (let ix = 0; ix < divisions; ix++) {
      edges.push([index(ix, iz), index(ix + 1, iz)]);
    }
  }
  // Connect vertical neighbors (along Z)
  for (let ix = 0; ix <= divisions; ix++) {
    for (let iz = 0; iz < divisions; iz++) {
      edges.push([index(ix, iz), index(ix, iz + 1)]);
    }
  }

  return {
    vertices,
    edges,
    position: { x: 0, y: 0, z: 0, w: 0 },
    affectedByGlobalTransform: false,
    color: '#ffffff'
  };
}

export function createHillsPlane(options?: {
  size?: number;       // half-extent of plane in X and Z
  divisions?: number;  // grid divisions per axis
  baseY?: number;      // base vertical placement below cube
  amplitude?: number;  // height variation amplitude
  w?: number;          // 4th dimension slice
}): Shape4D {
  const size = options?.size ?? 10;
  const divisions = options?.divisions ?? 24;
  const baseY = options?.baseY ?? -3.5;
  const amplitude = options?.amplitude ?? 0.8;
  const w = options?.w ?? 0;

  const step = (size * 2) / divisions;

  // Build grid vertices with hills using sine waves
  const vertices: Vector4D[] = [];
  for (let iz = 0; iz <= divisions; iz++) {
    const z = -size + iz * step;
    for (let ix = 0; ix <= divisions; ix++) {
      const x = -size + ix * step;

      // Create hills using multiple sine waves for natural look
      const hill1 = Math.sin(x * 0.5) * Math.cos(z * 0.3) * amplitude;
      const hill2 = Math.sin(x * 0.2 + z * 0.4) * amplitude * 0.6;
      const hill3 = Math.sin((x + z) * 0.15) * amplitude * 0.4;

      const height = baseY + hill1 + hill2 + hill3;

      vertices.push({ x, y: height, z, w });
    }
  }

  const index = (ix: number, iz: number) => iz * (divisions + 1) + ix;

  const edges: number[][] = [];
  // Connect horizontal neighbors (along X)
  for (let iz = 0; iz <= divisions; iz++) {
    for (let ix = 0; ix < divisions; ix++) {
      edges.push([index(ix, iz), index(ix + 1, iz)]);
    }
  }
  // Connect vertical neighbors (along Z)
  for (let ix = 0; ix <= divisions; ix++) {
    for (let iz = 0; iz < divisions; iz++) {
      edges.push([index(ix, iz), index(ix, iz + 1)]);
    }
  }

  return {
    vertices,
    edges,
    position: { x: 0, y: 0, z: 0, w: 0 },
    affectedByGlobalTransform: false,
    // color: '#ff8c00'
    color: 'green'
  };
}

export function createGreenPlane(options?: {
  size?: number;        // half-extent along X and Z
  divisions?: number;   // grid divisions (per X/Z axis)
  y?: number;           // base Y placement of hills
  w?: number;           // legacy: single W slice (kept for compatibility)
  wSize?: number;       // half-extent along W to extrude the surface
  wDivisions?: number;  // grid divisions along W
}): Shape4D {
  const size = options?.size ?? 10;
  const baseSize = 10;
  const baseDivisions = 24;
  // Keep fragment density constant by scaling divisions with size
  const divisions = options?.divisions ?? Math.max(8, Math.round(baseDivisions * (size / baseSize)));
  const baseY = options?.y ?? -3.5;
  const amplitude = 0.8;

  // If wSize is not provided, fall back to a single-slice plane at provided w (legacy behavior)
  const wSize = options?.wSize;
  const wDivisions = options?.wDivisions ?? (wSize ? Math.max(2, Math.round(baseDivisions * ((wSize * 2) / baseSize))) : 0);
  const legacyW = options?.w ?? 0;

  // Helpers
  const stepXZ = (size * 2) / divisions;
  const stepW = wSize ? (wSize * 2) / wDivisions : 0;

  const vertices: Vector4D[] = [];
  const edges: number[][] = [];

  const computeHeight = (x: number, z: number) => {
    const hill1 = Math.sin(x * 0.5) * Math.cos(z * 0.3) * amplitude;
    const hill2 = Math.sin(x * 0.2 + z * 0.4) * amplitude * 0.6;
    const hill3 = Math.sin((x + z) * 0.15) * amplitude * 0.4;
    return baseY + hill1 + hill2 + hill3;
  };

  if (!wSize) {
    // Legacy: single W slice
    for (let iz = 0; iz <= divisions; iz++) {
      const z = -size + iz * stepXZ;
      for (let ix = 0; ix <= divisions; ix++) {
        const x = -size + ix * stepXZ;
        const y = computeHeight(x, z);
        vertices.push({ x, y, z, w: legacyW });
      }
    }

    const index = (ix: number, iz: number) => iz * (divisions + 1) + ix;
    // Connect along X
    for (let iz = 0; iz <= divisions; iz++) {
      for (let ix = 0; ix < divisions; ix++) {
        edges.push([index(ix, iz), index(ix + 1, iz)]);
      }
    }
    // Connect along Z
    for (let ix = 0; ix <= divisions; ix++) {
      for (let iz = 0; iz < divisions; iz++) {
        edges.push([index(ix, iz), index(ix, iz + 1)]);
      }
    }
  } else {
    // Extruded along W: 3D lattice in X, Z, W
    const verticesPerSlice = (divisions + 1) * (divisions + 1);
    const index = (ix: number, iz: number, iw: number) => iw * verticesPerSlice + iz * (divisions + 1) + ix;

    for (let iw = 0; iw <= wDivisions; iw++) {
      const w = -wSize + iw * stepW;
      for (let iz = 0; iz <= divisions; iz++) {
        const z = -size + iz * stepXZ;
        for (let ix = 0; ix <= divisions; ix++) {
          const x = -size + ix * stepXZ;
          const y = computeHeight(x, z);
          vertices.push({ x, y, z, w });
        }
      }
    }

    // Connect along X within each (Z,W) row
    for (let iw = 0; iw <= wDivisions; iw++) {
      for (let iz = 0; iz <= divisions; iz++) {
        for (let ix = 0; ix < divisions; ix++) {
          edges.push([index(ix, iz, iw), index(ix + 1, iz, iw)]);
        }
      }
    }
    // Connect along Z within each (X,W) column
    for (let iw = 0; iw <= wDivisions; iw++) {
      for (let ix = 0; ix <= divisions; ix++) {
        for (let iz = 0; iz < divisions; iz++) {
          edges.push([index(ix, iz, iw), index(ix, iz + 1, iw)]);
        }
      }
    }
    // Connect along W between slices for each (X,Z) point
    for (let iw = 0; iw < wDivisions; iw++) {
      for (let iz = 0; iz <= divisions; iz++) {
        for (let ix = 0; ix <= divisions; ix++) {
          edges.push([index(ix, iz, iw), index(ix, iz, iw + 1)]);
        }
      }
    }
  }

  return {
    vertices,
    edges,
    position: { x: 0, y: 0, z: 0, w: 0 },
    affectedByGlobalTransform: false,
    color: 'green'
  };
}

export { createGreenPlane as createOrangePlane };

export function createBluePlane(options?: {
  size?: number;       // half-extent of plane in X and Z
  divisions?: number;  // grid divisions per axis
  y?: number;          // vertical placement below cube
  w?: number;          // 4th dimension slice
}): Shape4D {
  const size = options?.size ?? 10;
  const divisions = options?.divisions ?? 20;
  const y = options?.y ?? -1;
  const w = options?.w ?? 1;

  const step = (size * 2) / divisions;

  // Build grid vertices at constant y and w
  const vertices: Vector4D[] = [];
  for (let iz = 0; iz <= divisions; iz++) {
    const z = -size + iz * step;
    for (let ix = 0; ix <= divisions; ix++) {
      const x = -size + ix * step;
      vertices.push({ x, y, z, w });
    }
  }

  const index = (ix: number, iz: number) => iz * (divisions + 1) + ix;

  const edges: number[][] = [];
  // Connect horizontal neighbors (along X)
  for (let iz = 0; iz <= divisions; iz++) {
    for (let ix = 0; ix < divisions; ix++) {
      edges.push([index(ix, iz), index(ix + 1, iz)]);
    }
  }
  // Connect vertical neighbors (along Z)
  for (let ix = 0; ix <= divisions; ix++) {
    for (let iz = 0; iz < divisions; iz++) {
      edges.push([index(ix, iz), index(ix, iz + 1)]);
    }
  }

  return {
    vertices,
    edges,
    position: { x: 0, y: 0, z: 0, w: 0 },
    affectedByGlobalTransform: false,
    color: '#0066ff'
  };
}


