# KFCV50 - Interactive Dependency Visualization Tool

**TikTok-TechJam-2025**  
Advanced visualization and analysis tool built for TikTok's Dependency Injection Framework Knit

## Problem Statement

Modern software development involves complex dependency relationships that are difficult to understand and navigate manually, particularly in large-scale enterprise applications using dependency injection frameworks. Developers face significant challenges when:

- **Analyzing Complex Dependencies**: Understanding intricate relationships between classes, providers, and consumers in dependency injection systems
- **Detecting Circular Dependencies**: Identifying problematic circular references that can cause build failures and runtime issues
- **Exploring Class Hierarchies**: Navigating inheritance patterns and provider-consumer relationships across large codebases
- **Impact Analysis**: Understanding how changes to one component affect interconnected modules and dependencies
- **Debugging DI Issues**: Troubleshooting dependency injection configuration problems and missing providers
- **Visualizing Large Systems**: Comprehending the overall architecture and dependency flow in complex applications

KFCV50 solves these problems by providing a comprehensive full-stack solution that analyzes Knit dependency injection data and presents it through an interactive, web-based visualization interface.

## Features & Functionality

### Backend API Services
- **RESTful API**: FastAPI-based backend providing comprehensive dependency analysis endpoints
- **JSON Data Processing**: Intelligent parsing and analysis of Knit dependency injection configuration files
- **Class Hierarchy Analysis**: Deep analysis of inheritance relationships, providers, and consumers
- **Dependency Graph Generation**: Automated creation of node-link graph structures for visualization
- **File Upload Management**: Secure handling of dependency configuration file uploads
- **Real-time Analysis**: Live processing and analysis of uploaded dependency data

### Frontend Visualization
- **Interactive Dependency Graph**: Force-directed graph layout using D3.js for intuitive dependency visualization
- **Auto-Fit Viewport**: Automatically adjusts zoom and positioning to fit all nodes in the view
- **Node Dragging**: Interactive drag-and-drop functionality for repositioning graph nodes
- **Zoom & Pan**: Seamless zoom in/out and pan navigation with synchronized transformations
- **Dynamic Layout**: Collision detection and optimized spacing for clear visualization of large graphs

### Data Analysis Capabilities
- **Circular Dependency Detection**: Identifies and highlights problematic circular dependencies
- **Statistical Analysis**: Calculates metrics including total modules, dependencies, maximum depth, and average dependencies
- **Provider-Consumer Mapping**: Detailed analysis of dependency injection provider and consumer relationships
- **Component Analysis**: Examination of composite components and their relationships
- **Injection Status Tracking**: Analysis of injection success/failure states and dependency resolution

### API Endpoints
- `GET /base-classes`: Fetch all base classes in the dependency system
- `GET /class-info/{class_name}`: Get detailed information for specific classes
- `GET /child-classes/{parent_class}`: Retrieve child classes and inheritance relationships
- `POST /upload-knit-data`: Upload and process Knit dependency configuration files

## Architecture Overview

### Backend (Python/FastAPI)
- **FastAPI Framework**: High-performance async API framework
- **Dependency Analysis Engine**: Custom algorithms for parsing Knit configuration data
- **Graph Processing**: Node-graph generation and relationship mapping
- **CORS Support**: Cross-origin resource sharing for frontend integration

### Frontend (React/Next.js)
- **Next.js 15.5.2**: React framework with App Router and Turbopack
- **React 19.1.0**: Latest React with concurrent features
- **Interactive Visualization**: D3.js-powered graph rendering
- **Modern UI**: Tailwind CSS for responsive design

## Development Tools

### Backend Development
- **Python 3.11+**: Core programming language
- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI applications
- **JSON Processing**: Built-in JSON parsing and validation

### Frontend Development
- **Next.js 15.5.2**: React framework with App Router and Turbopack for fast development
- **React 19.1.0**: Latest React with concurrent features and enhanced performance
- **Turbopack**: Ultra-fast bundler for development and build processes
- **ESLint 9**: Code linting with Next.js configuration for code quality
- **Tailwind CSS 4**: Utility-first CSS framework for modern styling
- **PostCSS**: CSS processing with Tailwind integration

### Development Environment
- **Git**: Version control with branch-based development workflow
- **VS Code**: Primary development environment with Python and JavaScript support
- **Node.js 18+**: JavaScript runtime for frontend development
- **Package Managers**: npm, yarn, pnpm, or bun support

## APIs Used

### Internal Backend APIs
- **Class Analysis API**: `/base-classes`, `/class-info/{name}`, `/child-classes/{name}`
- **File Upload API**: `/upload-knit-data` for processing dependency configuration files

### External APIs
- **CORS Integration**: Cross-origin resource sharing for frontend-backend communication
- **HTTP/REST**: Standard REST API communication between frontend and backend services
- **JSON API**: Structured data exchange using JSON format

### Frontend Integration APIs
- **Backend Communication**: RESTful communication with backend service on `localhost:8000`
- **File Upload Service**: Drag-and-drop file upload with progress tracking
- **Real-time Data Processing**: Live analysis and visualization updates

## Libraries Used

### Backend Libraries
- **fastapi**: Modern, fast web framework for building APIs with Python
- **uvicorn**: Lightning-fast ASGI server implementation
- **python-multipart**: Support for multipart form data and file uploads
- **json**: Built-in JSON processing and validation
- **os**: Operating system interface for file management
- **typing**: Type hints and annotations for better code quality
- **collections**: Advanced data structures (defaultdict, etc.)

### Frontend Libraries
- **D3.js 7.9.0**: Advanced data visualization library for graph rendering and interactions
- **React 19.1.0**: Frontend framework for component-based UI development
- **React DOM 19.1.0**: React rendering library for web applications
- **Next.js 15.5.2**: Full-stack React framework with server-side rendering
- **@eslint/eslintrc**: ESLint configuration management
- **eslint-config-next**: Next.js specific linting rules
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind CSS processing

## Assets Used

### Frontend Assets
- **SVG Icons**: Custom icons for file upload, globe/network visualization, Next.js branding, and UI elements
- **Geist Font Family**: Modern, optimized font family from Vercel for enhanced readability
- **Responsive Design**: Mobile-first design approach with adaptive layouts

### Backend Assets
- **JSON Configuration Files**: Knit dependency injection configuration data storage
- **API Documentation**: Automated FastAPI OpenAPI/Swagger documentation
- **CORS Configuration**: Cross-origin resource sharing setup for frontend integration
- **Requirements File**: Python dependencies specification (requirements.txt)

## Getting Started

### Prerequisites
- **Python 3.11+** for backend development
- **Node.js 18+** for frontend development
- **Package managers**: pip (Python), npm/yarn/pnpm (Node.js)
- **Git** for version control

### Backend Setup

1. **Navigate to project root**:
```bash
cd KFCV50
```

2. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

3. **Start the backend server**:
```bash
cd src
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. **API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd KFCV50_Frontend
```

2. **Install dependencies**:
```bash
npm install
# or yarn install / pnpm install
```

3. **Start development server**:
```bash
npm run dev
# or yarn dev / pnpm dev
```

4. **Access application**: Open `http://localhost:3000` in your browser

### Usage Workflow

1. **Start Backend**: Ensure the FastAPI backend is running on `localhost:8000`
2. **Start Frontend**: Launch the Next.js frontend on `localhost:3000`
3. **Upload Data**: Navigate to the upload page and select a Knit JSON configuration file
4. **Automatic Processing**: The system processes and analyzes the uploaded dependency data
5. **Interactive Visualization**: Explore the generated dependency graph with full interactivity
6. **Dependency Analysis**: Review detected issues, circular dependencies, and relationship insights

## Project Structure

```
KFCV50/
├── src/                          # Backend source code
│   ├── main.py                   # FastAPI application entry point
│   ├── convert.py                # Dependency analysis and parsing engine
│   ├── node_graph_parser.py      # Graph generation and node relationship mapping
│   └── data/                     # Data storage directory
│       └── knit.json            # Uploaded dependency configuration files
├── KFCV50_Frontend/             # Frontend application
│   ├── src/app/                 # Next.js application source
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API communication layer
│   │   ├── utils/               # Utility functions
│   │   └── upload/              # File upload interface
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
├── requirements.txt             # Python backend dependencies
├── .gitignore                   # Git ignore configuration
├── LICENSE                      # Project license
└── README.md                    # Project documentation
```

## Contributing

This project was developed for TikTok TechJam 2025. Contributions should follow the established patterns and maintain the high-quality standards set for enterprise-level dependency visualization tools.

## License

See LICENSE file for details.