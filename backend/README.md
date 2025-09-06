# 4D Visualization Backend

FastAPI backend for the 4D visualization project.

## Features

- REST API for 4D shape generation
- 4D transformation endpoints
- CORS enabled for frontend communication
- Extensible architecture for future enhancements

## Getting Started

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Run the development server:
   ```bash
   poetry run uvicorn main:app --reload
   ```

3. API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /shapes/cube` - Get a 4D cube
- `POST /shapes/transform` - Apply transformation to a shape
- `GET /health` - Health check

## Development

The backend is built with:
- FastAPI for the web framework
- Pydantic for data validation
- Poetry for dependency management
