# KFCV50 - TikTok Knit DI Framework Visualization Tool

**TikTok-TechJam-2025**  
A comprehensive visualization tool for TikTok's open-source Knit Dependency Injection Framework, designed to help developers understand, analyze, and optimize dependency structures in any Knit-based project.

## Problem Statement

**TikTok TechJam 2025 Challenge**: Develop a visualization tool for TikTok's open-source dependency injection framework, Knit, that helps developers better understand, analyze, and optimize their projects' dependency structures.

### Background

Dependency injection (DI) is a crucial design pattern in modern software development, especially for large-scale applications. It promotes loose coupling, testability, and maintainability by providing objects with their dependencies rather than having them create or find dependencies themselves. As applications grow, managing these dependencies becomes increasingly complex and difficult to track.

**Knit** is TikTok's open-source dependency injection framework for JVM platforms, including Android. Unlike other DI frameworks such as Dagger or Koin, Knit uses a unique approach by directly modifying bytecode to inject dependencies without generating intermediate proxies. This results in better performance and cleaner code, with dependency injection that performs comparably to hand-written code.

### The Challenge

Knit delivers excellent performance through its unique bytecode manipulation approach. However, without proper visibility tools, critical issues may go undetected, leading to:

- **Tightly Coupled Code**: Dependencies become interconnected in ways that are hard to understand and modify
- **Performance Inefficiencies**: Circular or unnecessary dependencies that impact application performance
- **Slow Developer Onboarding**: New contributors struggle to understand complex dependency relationships
- **Hidden Structural Problems**: Dependency issues that only surface during runtime or under specific conditions

As Knit continues to evolve and support more complex use cases, there's a growing need for tooling that provides deeper visibility into how dependencies are wired and interact, especially for large or rapidly changing projects.

### Our Solution

KFCV50 addresses these challenges by providing a comprehensive visualization tool that offers:

- **Clear Visual Representations**: Intuitive dependency graphs that make complex relationships easy to understand
- **Issue Detection**: Automatic identification of circular dependencies, unused components, and structural problems
- **Performance Analysis**: Insights into dependency complexity and suggestions for optimization
- **Developer Productivity**: Tools that help both new and experienced developers understand and work with Knit-based projects more effectively

This tool is designed to work with any project that uses TikTok's Knit framework, making dependency relationships transparent and actionable to improve code quality, maintainability, and developer productivity.

## Features & Functionality

### Backend API Services
- **RESTful API**: FastAPI-based backend providing comprehensive analysis of Knit DI framework configurations
- **Knit JSON Data Processing**: Intelligent parsing and analysis of Knit dependency injection configuration files from any Knit-based project
- **Knit Class Hierarchy Analysis**: Deep analysis of inheritance relationships, providers, and consumers in Knit systems
- **Dependency Structure Visualization**: Automated creation of node-link graph structures optimized for Knit dependency visualization
- **Multi-Project Support**: Secure handling of Knit configuration file uploads from different projects
- **Real-time Analysis**: Live processing and analysis of uploaded Knit dependency data with performance insights

### Frontend Visualization
- **Interactive Knit Dependency Graph**: Force-directed graph layout using D3.js for intuitive Knit dependency visualization across any project
- **Multi-Project Support**: Seamlessly switch between and analyze different Knit-based projects
- **Auto-Fit Viewport**: Automatically adjusts zoom and positioning to fit all Knit nodes in the view
- **Node Dragging**: Interactive drag-and-drop functionality for repositioning Knit graph nodes
- **Zoom & Pan**: Seamless zoom in/out and pan navigation with synchronized transformations for large Knit dependency systems
- **Dynamic Layout**: Collision detection and optimized spacing for clear visualization of complex project structures

### Data Analysis Capabilities
- **Circular Dependency Detection**: Identifies and highlights problematic circular dependencies in any Knit-based project
- **Performance Analysis**: Calculates metrics including total modules, dependencies, maximum depth, and complexity scores
- **Structural Optimization Suggestions**: Provides recommendations for improving dependency structure and performance
- **Provider-Consumer Mapping**: Detailed analysis of Knit dependency injection relationships across project components
- **Component Usage Analysis**: Examination of Knit composite components and their utilization patterns
- **Injection Status Tracking**: Analysis of Knit injection success/failure states and dependency resolution across projects
- **Cross-Project Comparison**: Tools to compare dependency patterns between different Knit-based projects

### API Endpoints
- `GET /base-classes`: Fetch all base classes in any Knit-based project's dependency system
- `GET /class-info/{class_name}`: Get detailed information for specific Knit classes and their relationships
- `GET /child-classes/{parent_class}`: Retrieve child classes and inheritance relationships in Knit projects
- `POST /upload-knit-data`: Upload and process Knit dependency configuration files from any project using the framework

## Architecture Overview

### Backend (Python/FastAPI)
- **FastAPI Framework**: High-performance async API framework optimized for TikTok's Knit data processing
- **Knit Dependency Analysis Engine**: Custom algorithms specifically designed for parsing TikTok's Knit configuration data
- **Knit Graph Processing**: Node-graph generation and relationship mapping tailored for Knit dependency structures
- **CORS Support**: Cross-origin resource sharing for frontend integration with Knit visualization

### Frontend (React/Next.js)
- **Next.js 15.5.2**: React framework with App Router and Turbopack for TikTok Knit visualization
- **React 19.1.0**: Latest React with concurrent features optimized for Knit graph rendering
- **Interactive Knit Visualization**: D3.js-powered graph rendering specifically designed for TikTok's Knit dependencies
- **Modern UI**: Tailwind CSS for responsive design tailored to Knit dependency exploration

> 📖 **For detailed frontend documentation, see**: [Frontend README](KFCV50_Frontend/README.md)

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
3. **Upload Knit Configuration**: Navigate to the upload page and select a Knit JSON configuration file from any project using TikTok's Knit framework
4. **Automatic Analysis**: The system processes and analyzes the uploaded Knit dependency data, detecting structural issues and optimization opportunities
5. **Interactive Visualization**: Explore the generated Knit dependency graph with full interactivity, including zoom, pan, and node manipulation
6. **Dependency Insights**: Review detected issues, circular dependencies, performance suggestions, and structural insights for your Knit-based project
7. **Export & Share**: Save analysis results and share findings with your development team

## Project Structure

```
KFCV50/
├── src/                          # Backend source code for TikTok Knit analysis
│   ├── main.py                   # FastAPI application entry point for Knit API
│   ├── convert.py                # TikTok Knit dependency analysis and parsing engine
│   ├── node_graph_parser.py      # Knit graph generation and node relationship mapping
│   └── data/                     # TikTok Knit data storage directory
│       └── knit.json            # Uploaded TikTok Knit dependency configuration files
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

This project was developed for TikTok TechJam 2025 as a comprehensive solution for visualizing and analyzing TikTok's open-source Knit Dependency Injection Framework. The tool is designed to work with any project that uses Knit, providing developers with the visibility and insights needed to build better, more maintainable applications.

Contributions should follow the established patterns and maintain the high-quality standards set for enterprise-level dependency visualization tools. We welcome improvements that enhance the tool's ability to help developers understand and optimize their Knit-based projects.

## License

See LICENSE file for details.