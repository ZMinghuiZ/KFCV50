/**
 * D3.js visualization utilities
 */
import * as d3 from 'd3';

/**
 * Get node color based on type and properties
 */
export const getNodeColor = (d) => {
  if (d.isProvider || d.type === "provider") {
    return "#ff9ff3"; // Pink for providers
  }
  
  switch (d.type) {
    case "module":
      return "#3498db"; // Blue for modules
    case "service":
      return "#e74c3c"; // Red for services
    case "repository":
      return "#2ecc71"; // Green for repositories
    case "class":
      return "#95a5a6"; // Gray for regular classes
    case "singleton":
      return "#f39c12"; // Orange for singletons
    default:
      return "#95a5a6"; // Default gray
  }
};

/**
 * Get link color based on relationship type and circular dependencies
 */
export const getLinkColor = (d, circularPairs = []) => {
  // Check if this link is part of a circular dependency
  const isCircular = circularPairs.some(pair => 
    (pair[0] === (d.source?.id || d.source) && pair[1] === (d.target?.id || d.target)) ||
    (pair[0] === (d.target?.id || d.target) && pair[1] === (d.source?.id || d.source))
  );
  
  if (isCircular) {
    return "#e74c3c"; // Red for circular dependencies
  }
  
  switch (d.type) {
    case "extends":
      return "#3498db"; // Blue for inheritance
    case "depends":
      return "#2ecc71"; // Green for dependencies
    case "provides":
      return "#9b59b6"; // Purple for providers
    case "injects":
      return "#f39c12"; // Orange for injections
    default:
      return "#7f8c8d"; // Default gray
  }
};

/**
 * Get marker type for arrows
 */
export const getMarkerType = (d, circularPairs = []) => {
  // Check if this link is part of a circular dependency
  const isCircular = circularPairs.some(pair => 
    (pair[0] === (d.source?.id || d.source) && pair[1] === (d.target?.id || d.target)) ||
    (pair[0] === (d.target?.id || d.target) && pair[1] === (d.source?.id || d.source))
  );
  
  if (isCircular) {
    return "circular";
  }
  
  switch (d.type) {
    case "extends":
      return "extends";
    case "depends":
      return "depends";
    case "provides":
      return "provides";
    case "injects":
      return "injects";
    default:
      return "default";
  }
};

/**
 * Create enhanced arrow markers with better visibility
 */
export const createArrowMarkers = (svg) => {
  const defs = svg.append("defs");
  
  // Enhanced arrow markers with different colors and better visibility
  const markerTypes = [
    { id: "extends", color: "#3498db" },
    { id: "depends", color: "#2ecc71" },
    { id: "provides", color: "#9b59b6" },
    { id: "injects", color: "#f39c12" },
    { id: "circular", color: "#e74c3c" },
    { id: "default", color: "#7f8c8d" }
  ];
  
  markerTypes.forEach(markerType => {
    const marker = defs.append("marker")
      .attr("id", `arrow-${markerType.id}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18) // Adjust distance from node
      .attr("refY", 0)
      .attr("markerWidth", 8) // Larger arrows
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .attr("markerUnits", "strokeWidth");
    
    // Create arrow with white outline for better visibility
    marker.append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "white")
      .attr("stroke", "white")
      .attr("stroke-width", 2);
    
    marker.append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", markerType.color)
      .attr("stroke", markerType.color)
      .attr("stroke-width", 1);
  });
};

/**
 * Setup zoom behavior for the SVG
 */
export const setupZoomBehavior = (svg, g) => {
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
  
  svg.call(zoom);
  
  // Enable panning by dragging
  svg.style("cursor", "grab")
    .on("mousedown", function() {
      d3.select(this).style("cursor", "grabbing");
    })
    .on("mouseup", function() {
      d3.select(this).style("cursor", "grab");
    });
};

/**
 * Create curved link arc for better visualization
 */
export const createLinkArc = (d, nodes) => {
  const sourceNode = nodes.find(n => n.id === (d.source?.id || d.source));
  const targetNode = nodes.find(n => n.id === (d.target?.id || d.target));
  
  if (!sourceNode || !targetNode) {
    return "M0,0L0,0"; // Return a minimal path if nodes not found
  }
  
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const dr = Math.sqrt(dx * dx + dy * dy);
  
  // Create a curved path for better visualization
  const curvature = 0.3;
  const controlPointOffset = dr * curvature;
  
  // Calculate control point for curve
  const midX = (sourceNode.x + targetNode.x) / 2;
  const midY = (sourceNode.y + targetNode.y) / 2;
  
  // Perpendicular offset for curve
  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  const controlX = midX + Math.cos(angle) * controlPointOffset;
  const controlY = midY + Math.sin(angle) * controlPointOffset;
  
  return `M${sourceNode.x},${sourceNode.y}Q${controlX},${controlY} ${targetNode.x},${targetNode.y}`;
};

/**
 * Get filtered data based on focus node
 */
export const getFilteredData = (projectData, focusedNode) => {
  if (!projectData || !projectData.nodes || !projectData.links) {
    return { visibleNodes: [], validLinks: [] };
  }
  
  let visibleNodes = [...projectData.nodes];
  let validLinks = [...projectData.links];
  
  if (focusedNode) {
    // When focusing on a specific node, show only related nodes
    const relatedNodeIds = new Set([focusedNode]);
    
    // Find all nodes directly connected to the focused node
    projectData.links.forEach(link => {
      const sourceId = link.source?.id || link.source;
      const targetId = link.target?.id || link.target;
      
      if (sourceId === focusedNode) {
        relatedNodeIds.add(targetId);
      }
      if (targetId === focusedNode) {
        relatedNodeIds.add(sourceId);
      }
    });
    
    // Filter nodes to only show related ones
    visibleNodes = projectData.nodes.filter(node => relatedNodeIds.has(node.id));
    
    // Filter links to only show connections between visible nodes
    validLinks = projectData.links.filter(link => {
      const sourceId = link.source?.id || link.source;
      const targetId = link.target?.id || link.target;
      return relatedNodeIds.has(sourceId) && relatedNodeIds.has(targetId);
    });
  } else {
    // Show all nodes and links when not focused
    validLinks = projectData.links.filter(link => {
      const sourceId = link.source?.id || link.source;
      const targetId = link.target?.id || link.target;
      
      // Ensure both source and target nodes exist
      const sourceExists = projectData.nodes.some(n => n.id === sourceId);
      const targetExists = projectData.nodes.some(n => n.id === targetId);
      
      return sourceExists && targetExists;
    });
  }
  
  return { visibleNodes, validLinks };
};

/**
 * Calculate optimal zoom transform to fit all nodes in viewport
 */
export function fitNodesToView(svg, nodes, padding = null) {
  const svgElement = svg.node();
  const rect = svgElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // If no nodes or dimensions, return default transform
  if (!nodes || nodes.length === 0 || width === 0 || height === 0) {
    return d3.zoomIdentity.translate(width / 2, height / 2).scale(1);
  }

  // Dynamic padding based on number of nodes and text length considerations
  if (padding === null) {
    padding = Math.max(40, Math.min(120, 70 + nodes.length * 0.8)); // Increased padding for longer text
  }

  // Calculate bounds of all nodes
  const bounds = {
    minX: Math.min(...nodes.map(d => d.x || 0)),
    maxX: Math.max(...nodes.map(d => d.x || 0)),
    minY: Math.min(...nodes.map(d => d.y || 0)),
    maxY: Math.max(...nodes.map(d => d.y || 0))
  };

  const graphWidth = bounds.maxX - bounds.minX;
  const graphHeight = bounds.maxY - bounds.minY;

  // Handle edge case where all nodes are at the same position
  if (graphWidth === 0 && graphHeight === 0) {
    return d3.zoomIdentity.translate(width / 2, height / 2).scale(1);
  }

  // Calculate scale to fit with padding, with reasonable limits
  const maxScale = nodes.length > 20 ? 1.5 : nodes.length > 10 ? 2.5 : 4;
  const scale = Math.min(
    (width - padding * 2) / Math.max(graphWidth, 1),
    (height - padding * 2) / Math.max(graphHeight, 1),
    maxScale // Dynamic maximum scale based on node count
  );

  // Calculate center of the graph
  const centerX = bounds.minX + graphWidth / 2;
  const centerY = bounds.minY + graphHeight / 2;

  // Calculate translation to center the graph in the viewport
  const translateX = width / 2 - centerX * scale;
  const translateY = height / 2 - centerY * scale;

  return d3.zoomIdentity.translate(translateX, translateY).scale(scale);
}