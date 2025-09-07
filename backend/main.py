"""
4D Visualization Backend
FastAPI application for serving 4D visualization data and handling interactions.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math

app = FastAPI(
    title="4D Visualization API",
    description="Backend for interactive 4D space visualization",
    version="0.1.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3009"],  # Next.js dev server (new port)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Vector4D(BaseModel):
    """Represents a 4D vector/point"""
    x: float
    y: float
    z: float
    w: float


class Shape4D(BaseModel):
    """Represents a 4D shape with vertices and edges"""
    vertices: List[Vector4D]
    edges: List[List[int]]  # Pairs of vertex indices
    position: Vector4D = Vector4D(x=0, y=0, z=0, w=0)


class Transform4D(BaseModel):
    """Represents a 4D transformation"""
    rotation_xy: float = 0.0
    rotation_xz: float = 0.0
    rotation_xw: float = 0.0
    rotation_yz: float = 0.0
    rotation_yw: float = 0.0
    rotation_zw: float = 0.0
    translation: Vector4D = Vector4D(x=0, y=0, z=0, w=0)


def create_4d_cube(size: float = 1.0) -> Shape4D:
    """Create a 4D hypercube (tesseract)"""
    # Create vertices of a 4D cube
    vertices = []
    for i in range(16):  # 2^4 = 16 vertices
        x = size if (i & 1) else -size
        y = size if (i & 2) else -size
        z = size if (i & 4) else -size
        w = size if (i & 8) else -size
        vertices.append(Vector4D(x=x, y=y, z=z, w=w))

    # Create edges - connect vertices that differ by exactly one coordinate
    edges = []
    for i in range(16):
        for j in range(i + 1, 16):
            # Count differing bits
            diff = i ^ j
            if bin(diff).count('1') == 1:  # Exactly one bit differs
                edges.append([i, j])

    return Shape4D(vertices=vertices, edges=edges)


def apply_transform(shape: Shape4D, transform: Transform4D) -> Shape4D:
    """Apply 4D transformation to a shape"""
    # For now, just return the shape with updated position
    # In a full implementation, we'd apply rotation matrices
    return Shape4D(
        vertices=shape.vertices,
        edges=shape.edges,
        position=Vector4D(
            x=shape.position.x + transform.translation.x,
            y=shape.position.y + transform.translation.y,
            z=shape.position.z + transform.translation.z,
            w=shape.position.w + transform.translation.w
        )
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "4D Visualization API", "version": "0.1.0"}


@app.get("/shapes/cube")
async def get_4d_cube(size: float = 1.0):
    """Get a 4D cube (tesseract)"""
    return create_4d_cube(size)


@app.post("/shapes/transform")
async def transform_shape(shape: Shape4D, transform: Transform4D):
    """Apply transformation to a 4D shape"""
    return apply_transform(shape, transform)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3010)
