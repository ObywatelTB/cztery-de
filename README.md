# Cztery-De: 4D Space Visualization

An interactive 4D space visualization project featuring a navigable 4D hypercube (tesseract) with real-time 3D projection.

```bash
files-to-prompt  . -o llm-data/concat.txt -e .py -e .tsx -e .ts
```

## 🚀 Features

- **Interactive 4D Visualization**: Navigate through 4D space with keyboard controls
- **Real-time 3D Projection**: See 4D shapes projected into 3D space
- **FastAPI Backend**: RESTful API for 4D shape generation and transformations
- **Next.js Frontend**: Modern React frontend with Three.js visualization
- **Extensible Architecture**: Built for easy expansion and future enhancements

## 🏗️ Architecture

```
cztery-de/
├── backend/          # FastAPI backend (Python/Poetry)
├── frontend/         # Next.js frontend (React/TypeScript)
└── shared/           # Shared utilities and types
```

## 🛠️ Tech Stack

- **Backend**: FastAPI, Poetry, Pydantic, Uvicorn
- **Frontend**: Next.js, React, TypeScript, Three.js, Tailwind CSS
- **Development**: Concurrently for running both services

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Poetry
- npm

### Installation

1. **Clone and setup the project**:
   ```bash
   git clone <repository-url>
   cd cztery-de
   ```

2. **Install dependencies**:
   ```bash
   npm install  # Installs concurrently and root dependencies
   npm run install  # Installs backend and frontend dependencies
   ```

### Running the Application

**Development Mode** (runs both frontend and backend):
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:8000`
- Frontend on `http://localhost:3000`

**Individual Services**:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## 🎮 Controls

### Movement (Translation)
- `WASD` - Move in X/Y plane
- `Q/E` - Move up/down (Z axis)
- `Z/X` - Move in 4th dimension (W axis)
- Arrow keys also work for basic movement

### Rotation
- `I/K` - Rotate in XY plane
- `J/L` - Rotate in XZ plane
- `U/O` - Rotate in XW plane

## 🔧 API Endpoints

- `GET /` - API root
- `GET /shapes/cube` - Get a 4D hypercube
- `POST /shapes/transform` - Apply transformations to shapes
- `GET /health` - Health check

## 🏗️ Project Structure

### Backend (`/backend`)
```
backend/
├── main.py           # FastAPI application
├── pyproject.toml    # Poetry configuration
├── README.md         # Backend documentation
└── venv/            # Virtual environment
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application
│   │   └── layout.tsx        # App layout
│   ├── components/
│   │   └── FourDVisualization.tsx  # 4D visualization component
│   └── types/
│       └── 4d.ts             # TypeScript type definitions
├── package.json
└── next.config.ts
```

## 🔮 Future Enhancements

- Full 4D rotation matrices implementation
- Multiple 4D shapes (spheres, cylinders, etc.)
- Animation and interpolation
- VR/AR support
- Collaborative multi-user visualization
- Advanced projection techniques
- Shape morphing and deformation

## 📝 Development

### Adding New 4D Shapes

1. Add shape generation logic to `backend/main.py`
2. Update TypeScript types in `frontend/src/types/4d.ts`
3. Create new API endpoints as needed

### Extending Visualizations

1. Modify `FourDVisualization.tsx` for new rendering techniques
2. Add new controls in `page.tsx`
3. Implement additional transformation matrices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
