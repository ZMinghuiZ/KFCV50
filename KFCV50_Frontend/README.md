# KFCV50 Frontend - Interactive Dependency Visualizer

An advanced React-based frontend service for visualizing and analyzing software dependency graphs with interactive features, built to solve the complex problem of understanding large-scale codebase dependencies and relationships.

## Problem Statement

Modern software development involves complex dependency relationships that are difficult to understand and navigate manually. Developers need a visual, interactive tool to:
- Analyze dependency structures and identify potential issues
- Detect circular dependencies that can cause build problems
- Explore class hierarchies and inheritance patterns
- Understand the impact of changes across interconnected modules
- Visualize large-scale codebases in an intuitive, navigable format

This frontend service provides an interactive solution for dependency visualization, allowing developers to upload dependency data and explore it through an intuitive graph-based interface.

## Features & Functionality

### Core Visualization Features
- **Interactive Dependency Graph**: Force-directed graph layout using D3.js for intuitive dependency visualization
- **Auto-Fit Viewport**: Automatically adjusts zoom and positioning to fit all nodes in the view
- **Node Dragging**: Interactive drag-and-drop functionality for repositioning graph nodes
- **Zoom & Pan**: Seamless zoom in/out and pan navigation with synchronized node and link transformations
- **Dynamic Layout**: Collision detection and optimized spacing for clear visualization of large graphs

### Data Analysis Capabilities
- **Circular Dependency Detection**: Identifies and highlights problematic circular dependencies
- **Statistical Analysis**: Calculates metrics including total modules, dependencies, maximum depth, and average dependencies
- **Issue Detection**: Automatically identifies potential problems in the dependency structure
- **Hierarchical Level Calculation**: Determines dependency depth levels for better organization

### User Interface Features
- **JSON File Upload**: Drag-and-drop or click-to-upload interface for dependency data files
- **Real-time Processing**: Live analysis and visualization of uploaded dependency data
- **Clean Modern Design**: Streamlined interface built with Tailwind CSS
- **Responsive Layout**: Optimized for various screen sizes and devices
- **Auto-Navigation**: Automatic redirect to visualization after successful data upload

### Interactive Elements
- **Node Tooltips**: Hover information showing node details and relationships
- **Link Visualization**: Curved link paths with directional arrows and relationship labels
- **Color-Coded Elements**: Visual distinction between different types of nodes and relationships
- **Text Truncation**: Smart handling of long node names with ellipsis for better layout

## Development Tools

- **Next.js 15.5.2**: React framework with App Router and Turbopack for fast development
- **React 19.1.0**: Latest React with concurrent features and enhanced performance
- **Turbopack**: Ultra-fast bundler for development and build processes
- **ESLint 9**: Code linting with Next.js configuration for code quality
- **Tailwind CSS 4**: Utility-first CSS framework for modern styling
- **PostCSS**: CSS processing with Tailwind integration

## APIs Used

### Internal APIs
- Custom hooks for state management and data processing
- Client-side routing and navigation services

### External APIs
- **Backend Integration**: RESTful communication with backend dependency analysis service running on `localhost:8000`
  - `http://localhost:8000/base-classes`: Fetches base class information for dependency analysis
  - `http://localhost:8000/class-info/[name]`: Retrieves detailed information for specific classes
  - `http://localhost:8000/child-classes/[name]`: Fetches child classes and inheritance relationships
  - `http://localhost:8000/upload-knit-data`: Handles JSON file uploads for dependency data processing

## Libraries Used

### Core Dependencies
- **D3.js 7.9.0**: Advanced data visualization library for graph rendering and interactions
- **React 19.1.0**: Frontend framework for component-based UI development
- **React DOM 19.1.0**: React rendering library for web applications
- **Next.js 15.5.2**: Full-stack React framework with server-side rendering

### Development Dependencies
- **@eslint/eslintrc**: ESLint configuration management
- **eslint-config-next**: Next.js specific linting rules
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind CSS processing

## Assets Used

### SVG Icons
- `file.svg`: File upload and document icons
- `globe.svg`: Global/network visualization icons
- `next.svg`: Next.js branding and framework icons
- `vercel.svg`: Deployment platform icons
- `window.svg`: UI window and interface icons

### Fonts
- **Geist Font Family**: Modern, optimized font family from Vercel for enhanced readability

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── Visualizer.jsx        # Main visualization component
│   ├── hooks/
│   │   └── useVisualizerState.js  # State management hooks
│   ├── services/
│   │   └── apiService.js          # API communication layer
│   ├── utils/
│   │   ├── dataUtils.js          # Data processing utilities
│   │   └── d3Utils.js            # D3.js visualization utilities
│   ├── upload/
│   │   └── page.js               # File upload interface
│   ├── layout.js                 # Application layout
│   └── page.js                   # Main application page
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Backend service running on `localhost:8000` for file uploads

### Installation & Development

1. Clone the repository:
```bash
git clone <repository-url>
cd KFCV50_Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Upload Dependency Data**: Navigate to the upload page and select a JSON file containing dependency information
2. **Automatic Analysis**: The system will automatically process and analyze the uploaded data
3. **Interactive Visualization**: Explore the generated dependency graph with drag, zoom, and pan capabilities
4. **Dependency Analysis**: Review detected issues, circular dependencies, and statistical insights

### Building for Production

```bash
npm run build
npm run start
```

## Deployment

The application is optimized for deployment on [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

For more deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [D3.js Documentation](https://d3js.org/) - Data visualization library documentation
- [React Documentation](https://react.dev/) - React framework documentation
