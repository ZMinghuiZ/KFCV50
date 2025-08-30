/**
 * Data processing utilities for the visualizer
 */

/**
 * Calculate project statistics
 */
export const calculateStatistics = (projectData, focusedNode = null) => {
  if (!projectData || !projectData.nodes || !projectData.links) {
    return {
      totalModules: 0,
      totalDependencies: 0,
      circularDeps: 0,
      maxDepth: 0,
      avgDeps: 0
    };
  }

  const totalModules = projectData.nodes.length;
  const totalDependencies = projectData.links.length;
  
  // Detect circular dependencies
  const circularPairs = detectCircularDependencies(projectData);
  const circularDeps = circularPairs.length;
  
  // Calculate max dependency depth
  const depthMap = new Map();
  const calculateDepth = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) return 0; // Avoid infinite loops
    if (depthMap.has(nodeId)) return depthMap.get(nodeId);
    
    visited.add(nodeId);
    const dependencies = projectData.links.filter(link => link.source === nodeId || link.source?.id === nodeId);
    
    let maxChildDepth = 0;
    dependencies.forEach(dep => {
      const targetId = dep.target?.id || dep.target;
      if (targetId !== nodeId) {
        const childDepth = calculateDepth(targetId, new Set(visited));
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
    });
    
    const depth = maxChildDepth + 1;
    depthMap.set(nodeId, depth);
    return depth;
  };

  let maxDepth = 0;
  projectData.nodes.forEach(node => {
    const depth = calculateDepth(node.id);
    maxDepth = Math.max(maxDepth, depth);
  });

  // Calculate average dependencies per node
  const avgDeps = totalModules > 0 ? (totalDependencies / totalModules).toFixed(1) : 0;

  return {
    totalModules,
    totalDependencies,
    circularDeps,
    maxDepth,
    avgDeps: parseFloat(avgDeps)
  };
};

/**
 * Detect circular dependencies in the project
 */
export const detectCircularDependencies = (projectData) => {
  if (!projectData || !projectData.links) return [];
  
  const circularPairs = [];
  const visited = new Set();
  const recursionStack = new Set();
  
  const dfs = (nodeId, path = []) => {
    if (recursionStack.has(nodeId)) {
      // Found a cycle, extract the circular portion
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        cycle.push(nodeId); // Complete the cycle
        
        // Add pairs from the cycle
        for (let i = 0; i < cycle.length - 1; i++) {
          const pair = [cycle[i], cycle[i + 1]];
          const reverseCheck = circularPairs.find(p => 
            (p[0] === pair[1] && p[1] === pair[0]) || 
            (p[0] === pair[0] && p[1] === pair[1])
          );
          if (!reverseCheck) {
            circularPairs.push(pair);
          }
        }
      }
      return;
    }
    
    if (visited.has(nodeId)) return;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    // Find all outgoing edges
    const outgoingEdges = projectData.links.filter(link => {
      const sourceId = link.source?.id || link.source;
      return sourceId === nodeId;
    });
    
    outgoingEdges.forEach(link => {
      const targetId = link.target?.id || link.target;
      dfs(targetId, [...path]);
    });
    
    recursionStack.delete(nodeId);
    path.pop();
  };
  
  // Start DFS from each node
  projectData.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });
  
  return circularPairs;
};

/**
 * Detect various issues in the project structure
 */
export const detectIssues = (projectData, focusedNode = null) => {
  if (!projectData || !projectData.nodes || !projectData.links) return [];
  
  const issues = [];
  
  // Detect circular dependencies
  const circularDeps = detectCircularDependencies(projectData);
  if (circularDeps.length > 0) {
    issues.push({
      type: 'error',
      title: 'Circular Dependencies Detected',
      description: `Found ${circularDeps.length} circular dependency relationships that could cause injection failures.`
    });
  }
  
  // Detect nodes with too many dependencies
  const dependencyCounts = new Map();
  projectData.links.forEach(link => {
    const sourceId = link.source?.id || link.source;
    dependencyCounts.set(sourceId, (dependencyCounts.get(sourceId) || 0) + 1);
  });
  
  const highDependencyNodes = [];
  dependencyCounts.forEach((count, nodeId) => {
    if (count > 5) { // Threshold for too many dependencies
      highDependencyNodes.push(`${nodeId} (${count} deps)`);
    }
  });
  
  if (highDependencyNodes.length > 0) {
    issues.push({
      type: 'warning',
      title: 'High Dependency Count',
      description: `These nodes have many dependencies: ${highDependencyNodes.join(', ')}. Consider refactoring.`
    });
  }
  
  // Detect isolated nodes (no incoming or outgoing dependencies)
  const connectedNodes = new Set();
  projectData.links.forEach(link => {
    const sourceId = link.source?.id || link.source;
    const targetId = link.target?.id || link.target;
    connectedNodes.add(sourceId);
    connectedNodes.add(targetId);
  });
  
  const isolatedNodes = projectData.nodes.filter(node => !connectedNodes.has(node.id));
  if (isolatedNodes.length > 0) {
    issues.push({
      type: 'info',
      title: 'Isolated Components',
      description: `Found ${isolatedNodes.length} components with no dependencies: ${isolatedNodes.map(n => n.id).join(', ')}`
    });
  }
  
  return issues;
};
const convertDotToSlash = (name) => {
    if (!name) return name;
    return name.replace(/\./g, '/');
};
/**
 * Transform base classes data from API response
 */
export const transformBaseClasses = (apiData) => {
    console.log('API Response:', apiData);
    let nodes = [];
    let links = [];

    // Iterate over each parent class key
    Object.keys(apiData).forEach(parent => {
      // Skip count keys
      if (parent.endsWith('_count') || parent === 'group_count') return;
      const children = apiData[parent];
      if (!Array.isArray(children)) return;

      // Add parent node
      if (parent !== 'null' && parent !== 'None') {
        nodes.push({
          id: convertDotToSlash(parent),
          type: "class",
          scope: "module",
          isProvider: false,
          fullName: convertDotToSlash(parent)
        });
      }

      // Add child nodes and links
      children.forEach(child => {
        nodes.push({
          id: convertDotToSlash(child.name),
          type: child.is_provider ? "provider" : "class",
          scope: "module",
          isProvider: child.is_provider,
          fullName: convertDotToSlash(child.name)
        });
        // Link from child to parent
        if (parent !== 'null' && parent !== 'None') {
          links.push({
            source: convertDotToSlash(child.name),
            target: convertDotToSlash(parent),
            type: "extends"
          });
        }
      });
    });

    console.log('Transformed data:', { nodes, links }); // Debug log
    return { nodes, links };
  };

/**
 * Calculate node levels for hierarchical layout
 */
export const calculateNodeLevels = (projectData) => {
  if (!projectData || !projectData.nodes || !projectData.links) return {};
  
  const levels = {};
  const visited = new Set();
  const inProgress = new Set();
  
  const calculateLevel = (nodeId) => {
    if (levels[nodeId] !== undefined) return levels[nodeId];
    if (inProgress.has(nodeId)) return 0; // Break cycles
    
    inProgress.add(nodeId);
    
    // Find all nodes that this node depends on
    const dependencies = projectData.links.filter(link => {
      const sourceId = link.source?.id || link.source;
      return sourceId === nodeId;
    });
    
    let maxDependencyLevel = -1;
    dependencies.forEach(dep => {
      const targetId = dep.target?.id || dep.target;
      if (targetId !== nodeId) {
        const depLevel = calculateLevel(targetId);
        maxDependencyLevel = Math.max(maxDependencyLevel, depLevel);
      }
    });
    
    const level = maxDependencyLevel + 1;
    levels[nodeId] = level;
    inProgress.delete(nodeId);
    visited.add(nodeId);
    
    return level;
  };
  
  // Calculate levels for all nodes
  projectData.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      calculateLevel(node.id);
    }
  });
  
  return levels;
};