"""
Shared 4D mathematics utilities
These can be used by both backend and frontend (via Python/JS ports)
"""

from typing import List, Tuple
import math


def create_4d_cube_vertices(size: float = 1.0) -> List[Tuple[float, float, float, float]]:
    """Create vertices for a 4D hypercube (tesseract)"""
    vertices = []
    for i in range(16):  # 2^4 = 16 vertices
        x = size if (i & 1) else -size
        y = size if (i & 2) else -size
        z = size if (i & 4) else -size
        w = size if (i & 8) else -size
        vertices.append((x, y, z, w))
    return vertices


def create_4d_cube_edges() -> List[Tuple[int, int]]:
    """Create edges for a 4D hypercube"""
    edges = []
    for i in range(16):
        for j in range(i + 1, 16):
            # Count differing bits
            diff = i ^ j
            if bin(diff).count('1') == 1:  # Exactly one bit differs
                edges.append((i, j))
    return edges


def project_4d_to_3d(point: Tuple[float, float, float, float], distance: float = 5.0) -> Tuple[float, float, float]:
    """Project a 4D point to 3D using perspective projection"""
    x, y, z, w = point
    factor = distance / (distance - w)
    return (x * factor, y * factor, z * factor)


def rotation_matrix_4d_xy(angle: float) -> List[List[float]]:
    """Create 4D rotation matrix for XY plane"""
    c = math.cos(angle)
    s = math.sin(angle)
    return [
        [c, -s, 0, 0],
        [s, c, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]


def rotation_matrix_4d_xz(angle: float) -> List[List[float]]:
    """Create 4D rotation matrix for XZ plane"""
    c = math.cos(angle)
    s = math.sin(angle)
    return [
        [c, 0, -s, 0],
        [0, 1, 0, 0],
        [s, 0, c, 0],
        [0, 0, 0, 1]
    ]


def rotation_matrix_4d_xw(angle: float) -> List[List[float]]:
    """Create 4D rotation matrix for XW plane"""
    c = math.cos(angle)
    s = math.sin(angle)
    return [
        [c, 0, 0, -s],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [s, 0, 0, c]
    ]


def matrix_multiply_4d(matrix: List[List[float]], vector: Tuple[float, float, float, float]) -> Tuple[float, float, float, float]:
    """Multiply 4D matrix by 4D vector"""
    result = [0, 0, 0, 0]
    for i in range(4):
        for j in range(4):
            result[i] += matrix[i][j] * vector[j]
    return tuple(result)
