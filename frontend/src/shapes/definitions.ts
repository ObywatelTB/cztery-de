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

export function createOrangePlane(options?: {
  size?: number;       // half-extent of plane in X and Z
  divisions?: number;  // grid divisions per axis
  y?: number;          // vertical placement below cube
  w?: number;          // 4th dimension slice
}): Shape4D {
  const size = options?.size ?? 10;
  const divisions = options?.divisions ?? 20;
  const y = options?.y ?? -3.5;
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
    color: '#ff8c00'
  };
}


