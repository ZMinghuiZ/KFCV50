import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import Link from 'next/link';
import { 
  useProjectData, 
  useClassExploration, 
  useFocusNavigation
} from '../hooks/useVisualizerState';
import { 
  calculateStatistics, 
  detectIssues, 
  detectCircularDependencies,
  calculateNodeLevels
} from '../utils/dataUtils';
import { 
  getNodeColor, 
  getLinkColor, 
  getMarkerType, 
  createArrowMarkers,
  setupZoomBehavior,
  createLinkArc,
  getFilteredData,
  fitNodesToView
} from '../utils/d3Utils';

const Visualizer = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const simulationRef = useRef();
  const initializedRef = useRef(false); // Track if component has been initialized
  
  // State from custom hooks
  const { 
    projectData, 
    setProjectData, 
    loading, 
    setLoading, 
    error, 
    setError, 
    statistics, 
    setStatistics, 
    issues, 
    setIssues, 
    analyzeProject,
    convertDotToSlash 
  } = useProjectData();
  
  const { 
    selectedNode, 
    setSelectedNode, 
    classInfo, 
    setClassInfo, 
    loadingClassInfo, 
    setLoadingClassInfo,
    exploredNodes, 
    setExploredNodes, 
    isExploring, 
    setIsExploring,
    fetchClassInfo 
  } = useClassExploration();
  
  const { 
    historyStack, 
    setHistoryStack, 
    focusedNode, 
    setFocusedNode, 
    loadingFocus, 
    setLoadingFocus,
    focusOnNode,
    goBack,
    clearHistory,
    canGoBack 
  } = useFocusNavigation();

  // Local state
  const [currentLayout, setCurrentLayout] = useState('force');
  const [hidePreviewSteps, setHidePreviewSteps] = useState(true); // Toggle for hiding previous steps

  // Focus function with exact original behavior
  const handleFocusOnNode = async (nodeId) => {
    const result = await focusOnNode(nodeId, projectData);
    if (result) {
      setProjectData(result);
      // Reset view after focusing
      setTimeout(() => {
        resetView();
      }, 100);
    }
  };

  // Go back function with exact original behavior  
  const handleGoBack = () => {
    const result = goBack();
    if (result) {
      setProjectData(result);
      // Reset view after going back
      setTimeout(() => {
        resetView();
      }, 100);
    }
  };

  // Reset view function to fit all nodes in viewport
  const resetView = () => {
    if (svgRef.current && projectData && projectData.nodes && projectData.nodes.length > 0) {
      const svg = d3.select(svgRef.current);
      
      // Get filtered data to work with visible nodes
      const { visibleNodes } = getFilteredData(projectData, focusedNode);
      
      // Calculate optimal zoom transform to fit all visible nodes
      const transform = fitNodesToView(svg, visibleNodes, 80);
      
      svg.transition()
        .duration(750)
        .call(d3.zoom().transform, transform);
    }
  };

  // Fetch class info with exact original behavior
  const handleFetchClassInfo = async (className, hideSteps = hidePreviewSteps) => {
    // Set loading state for class info
    setLoadingClassInfo(true);
    setSelectedNode(className);
    
    try {
      // Save current state to history stack if we're hiding previous steps
      if (hideSteps && projectData && projectData.nodes && projectData.nodes.length > 0) {
        setHistoryStack(prevStack => [
          ...prevStack,
          {
            nodes: [...projectData.nodes],
            links: [...projectData.links],
            focusedNode: focusedNode
          }
        ]);
      }
      
      const updatedProjectData = await fetchClassInfo(className, convertDotToSlash, projectData, hideSteps);
      
      // Update project data with explored relationships
      if (updatedProjectData) {
        setProjectData(updatedProjectData);
      }
      
      // Highlight selected node (exact original styling)
      d3.selectAll(".node circle")
        .style("stroke", "#fff")
        .style("stroke-width", node => node.id === className ? 4 : 2);
    } catch (error) {
      console.error('Error handling class info fetch:', error);
    } finally {
      // Always clear loading state
      setLoadingClassInfo(false);
    }
  };

  // Update statistics when project data changes (exact original)
  const updateStatistics = useCallback(() => {
    if (!projectData || !projectData.nodes) {
      return;
    }
    const newStatistics = calculateStatistics(projectData, focusedNode);
    setStatistics(newStatistics);
  }, [projectData, focusedNode, setStatistics]);

  // Detect issues function (exact original)
  const detectIssuesLocal = useCallback(() => {
    if (!projectData || !projectData.nodes) {
      return;
    }
    const detectedIssues = detectIssues(projectData, focusedNode);
    setIssues(detectedIssues);
  }, [projectData, focusedNode, setIssues]);

  // Circular dependencies detection (exact original)
  const detectCircularDependenciesLocal = useCallback(() => {
    if (!projectData || !projectData.nodes) {
      return [];
    }
    return detectCircularDependencies(projectData);
  }, [projectData]);

  // Node levels calculation (exact original)
  const calculateNodeLevelsLocal = useCallback(() => {
    if (!projectData || !projectData.nodes) {
      return {};
    }
    return calculateNodeLevels(projectData);
  }, [projectData]);

  // Render graph function - preserving all original D3 logic
  const renderGraph = useCallback(() => {
    if (!svgRef.current) return;

    // Check if projectData exists and has nodes
    if (!projectData || !projectData.nodes || !projectData.links) {
      console.log('ProjectData not ready yet, skipping render');
      return;
    }

    // Stop previous simulation if it exists
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");
    const tooltip = d3.select(tooltipRef.current);

    // Get filtered data using utility function
    const { visibleNodes, validLinks } = getFilteredData(projectData, focusedNode);

    console.log(`Showing ${visibleNodes.length} out of ${projectData.nodes.length} nodes`);

    // Setup zoom behavior
    setupZoomBehavior(svg, g);

    // Detect circular dependencies
    const circularPairs = detectCircularDependenciesLocal();

    console.log('Valid links after filtering:', validLinks.length, 'out of', projectData.links.length);

    // Create arrow markers with different colors for different relationship types
    createArrowMarkers(svg);

    // Create links
    const link = g.append("g")
      .selectAll("path")
      .data(validLinks)
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", d => getLinkColor(d, circularPairs))
      .attr("stroke-width", 2.5) // Slightly thicker lines
      .attr("stroke-opacity", 0.8) // Higher opacity for better visibility
      .attr("marker-end", d => `url(#arrow-${getMarkerType(d, circularPairs)})`)
      .classed("circular", d => {
        return circularPairs.some(pair => 
          (pair[0] === d.source && pair[1] === d.target) ||
          (pair[0] === d.target && pair[1] === d.source)
        );
      })
      .on("mouseover", function(event, d) {
        // Highlight arrow on hover
        d3.select(this)
          .attr("stroke-width", 4)
          .attr("stroke-opacity", 1);
      })
      .on("mouseout", function(event, d) {
        // Reset arrow styling
        d3.select(this)
          .attr("stroke-width", 2.5)
          .attr("stroke-opacity", 0.8);
      });

    // Add relationship labels on links
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(validLinks)
      .enter().append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("fill", "#555")
      .attr("pointer-events", "none")
      .style("user-select", "none")
      .text(d => d.type || "");

    // Create nodes within the zoom container
    const node = g.selectAll(".node")
      .data(visibleNodes)
      .enter().append("g")
      .attr("class", "node");

    // Add circles for nodes
    node.append("circle")
      .attr("r", d => d.type === "module" ? 15 : 12)
      .attr("fill", getNodeColor)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="font-semibold">${d.id}</div>
          <div>Type: ${d.type}</div>
          <div>Scope: ${d.scope}</div>
          ${d.isProvider ? '<div class="text-purple-400">Provider</div>' : ''}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(200).style("opacity", 0);
      })
      .on("click", function(event, d) {
        // Async function to handle the click
        (async () => {
          try {
            // Only fetch class info and explore relationships
            // The focusing should happen after exploration is complete
            await handleFetchClassInfo(d.id);
          } catch (error) {
            console.error('Error handling node click:', error);
          }
        })();
      });

    // Add labels with smart text handling
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      const maxLength = 20; // Maximum characters before truncation
      let displayText = d.id;
      
      // Truncate very long names
      if (d.id.length > maxLength) {
        displayText = d.id.substring(0, maxLength) + '...';
      }
      
      // Add main label
      nodeGroup.append("text")
        .attr("dy", 30) // Moved further down to avoid overlap
        .attr("text-anchor", "middle")
        .text(displayText)
        .style("fill", "#333")
        .style("font-size", "11px") // Slightly smaller for better fit
        .style("font-weight", "500")
        .style("pointer-events", "none")
        .style("user-select", "none")
        .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)"); // Add text shadow for better readability
      
      // Add full name as title for truncated text (shows on hover)
      if (d.id.length > maxLength) {
        nodeGroup.select("text").append("title").text(d.id);
      }
    });

    // Link arc function for curved links
    const linkArc = (d) => createLinkArc(d, visibleNodes);

    // Enhanced drag behavior that works with all layout types
    const dragBehavior = d3.drag()
      .on("start", function(event, d) {
        // For force layouts, restart simulation
        if (currentLayout === 'force' && simulationRef.current) {
          if (!event.active) {
            simulationRef.current.alphaTarget(0.3).restart();
          }
          d.fx = d.x;
          d.fy = d.y;
        }
        // Change cursor during drag
        d3.select(this).style("cursor", "grabbing");
      })
      .on("drag", function(event, d) {
        // Update position
        d.x = event.x;
        d.y = event.y;
        
        // For force layouts, fix position
        if (currentLayout === 'force') {
          d.fx = event.x;
          d.fy = event.y;
        }
        
        // Update visual position immediately
        d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        
        // Update connected links
        g.selectAll(".link").attr("d", linkArc);
      })
      .on("end", function(event, d) {
        // For force layouts, allow natural forces to resume
        if (currentLayout === 'force' && simulationRef.current) {
          if (!event.active) {
            simulationRef.current.alphaTarget(0);
          }
          // Release fixed position to allow natural forces
          d.fx = null;
          d.fy = null;
        }
        // Reset cursor
        d3.select(this).style("cursor", "grab");
      });

    // Apply enhanced drag behavior to nodes
    node.call(dragBehavior).style("cursor", "grab");

    // Setup simulation based on layout
    if (currentLayout === 'force') {
      const simulation = d3.forceSimulation(visibleNodes)
        .force("link", d3.forceLink(validLinks)
          .id(d => d.id)
          .distance(120) // Increased from 80 to give more space for long names
          .strength(0.5)) // Slightly reduced for less rigid connections
        .force("charge", d3.forceManyBody().strength(-800)) // Increased back to spread nodes more
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => {
          // Dynamic collision radius based on text length
          const textLength = d.id.length;
          return Math.max(35, Math.min(80, textLength * 3));
        }))
        .force("x", d3.forceX(width / 2).strength(0.05)) // Reduced centering force
        .force("y", d3.forceY(height / 2).strength(0.05)); // Reduced centering force

      simulationRef.current = simulation;

      let tickCount = 0;
      simulation.on("tick", () => {
        link.attr("d", linkArc);
        
        // Position link labels at the midpoint of each link
        linkLabels.attr("x", d => {
          const sourceNode = visibleNodes.find(n => n.id === (d.source?.id || d.source));
          const targetNode = visibleNodes.find(n => n.id === (d.target?.id || d.target));
          if (sourceNode && targetNode) {
            return (sourceNode.x + targetNode.x) / 2;
          }
          return 0;
        })
        .attr("y", d => {
          const sourceNode = visibleNodes.find(n => n.id === (d.source?.id || d.source));
          const targetNode = visibleNodes.find(n => n.id === (d.target?.id || d.target));
          if (sourceNode && targetNode) {
            return (sourceNode.y + targetNode.y) / 2 - 5; // Offset slightly above the line
          }
          return 0;
        });
        
        node.attr("transform", d => `translate(${d.x},${d.y})`);

        // Auto-fit view after simulation has run for a few ticks (when nodes have positions)
        tickCount++;
        if (tickCount === 50) { // After 50 ticks, the simulation should be stable enough
          setTimeout(() => {
            resetView();
          }, 100);
        }
      });

      // Also fit view when simulation ends
      simulation.on("end", () => {
        setTimeout(() => {
          resetView();
        }, 100);
      });
    } else {
      // Static layouts
      if (currentLayout === 'circular') {
        // Increase radius for better spacing with long names
        const radius = Math.min(width, height) / 2.5; // Increased from /3
        const angleStep = (2 * Math.PI) / visibleNodes.length;
        
        visibleNodes.forEach((node, i) => {
          node.x = width / 2 + radius * Math.cos(i * angleStep);
          node.y = height / 2 + radius * Math.sin(i * angleStep);
        });
      } else if (currentLayout === 'hierarchical') {
        const levels = calculateNodeLevelsLocal();
        const levelGroups = {};
        
        visibleNodes.forEach(node => {
          const level = levels[node.id] || 0;
          if (!levelGroups[level]) levelGroups[level] = [];
          levelGroups[level].push(node);
        });
        
        Object.keys(levelGroups).forEach(level => {
          const nodesInLevel = levelGroups[level];
          const levelY = (parseInt(level) + 1) * (height / (Object.keys(levelGroups).length + 1));
          // Increase spacing to accommodate longer text
          const spacing = Math.max(150, width / (nodesInLevel.length + 1)); // Minimum 150px spacing
          
          nodesInLevel.forEach((node, i) => {
            node.x = (i + 1) * spacing;
            node.y = levelY;
          });
        });
      }
      
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      link.attr("d", linkArc);
      
      // Position link labels for static layouts
      linkLabels.attr("x", d => {
        const sourceNode = visibleNodes.find(n => n.id === (d.source?.id || d.source));
        const targetNode = visibleNodes.find(n => n.id === (d.target?.id || d.target));
        if (sourceNode && targetNode) {
          return (sourceNode.x + targetNode.x) / 2;
        }
        return 0;
      })
      .attr("y", d => {
        const sourceNode = visibleNodes.find(n => n.id === (d.source?.id || d.source));
        const targetNode = visibleNodes.find(n => n.id === (d.target?.id || d.target));
        if (sourceNode && targetNode) {
          return (sourceNode.y + targetNode.y) / 2 - 5;
        }
        return 0;
      });
      
      // Auto-fit view for static layouts
      setTimeout(() => {
        resetView();
      }, 100);
    }

  }, [projectData, currentLayout, detectCircularDependenciesLocal, calculateNodeLevelsLocal, focusedNode, handleFocusOnNode, handleFetchClassInfo, setLoadingClassInfo, setSelectedNode]);

  // Update statistics when project data changes (exact original)
  useEffect(() => {
    updateStatistics();
  }, [updateStatistics]);

  // Render graph when dependencies change (exact original)
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  // Auto-load base classes on component mount (exact original behavior)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      analyzeProject(clearHistory, setFocusedNode, resetView);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      renderGraph();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderGraph]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  // Export graph function
  const exportGraph = useCallback(() => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dependency-graph.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [projectData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md p-4 lg:p-6 shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            K
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">Knit Dependency Visualizer</h1>
            {focusedNode && (
              <p className="text-sm text-gray-600 mt-1">
                Focused on: <span className="font-medium text-indigo-600">{focusedNode}</span>
              </p>
            )}
            {historyStack.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Navigation level: {historyStack.length} 
                {historyStack.length > 1 && <span className="ml-1">({historyStack.length} steps back available)</span>}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
          {canGoBack && (
            <button
              onClick={handleGoBack}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 lg:px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-sm"
            >
              ← Back {historyStack.length > 1 ? `(${historyStack.length} levels)` : 'to Previous View'}
            </button>
          )}
          {focusedNode && !canGoBack && (
            <button
              onClick={() => {
                setFocusedNode(null);
                setSelectedNode(null);
                setClassInfo(null);
                setExploredNodes(new Set());
                // Reset visual selection
                d3.selectAll(".node circle")
                  .style("stroke", "#fff")
                  .style("stroke-width", 2);
                // Reset view
                setTimeout(() => {
                  resetView();
                }, 100);
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 lg:px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-sm"
            >
              Clear Focus
            </button>
          )}
          <select 
            value={currentLayout}
            onChange={(e) => setCurrentLayout(e.target.value)}
            className="px-3 lg:px-4 py-2 border-2 border-gray-200 rounded-lg bg-white cursor-pointer text-sm transition-colors focus:border-indigo-500 focus:outline-none"
          >
            <option value="force">Force Layout</option>
            <option value="circular">Circular Layout</option>
            <option value="hierarchical">Hierarchical Layout</option>
          </select>
          <button
            onClick={() => detectIssuesLocal()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 lg:px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            Detect Issues
          </button>
          <button
            onClick={resetView}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 lg:px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            🔍 Fit to View
          </button>
          <button
            onClick={exportGraph}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 lg:px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            Export Graph
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 lg:mx-6 mb-4 lg:mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm lg:text-base">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 p-4 lg:p-6 max-w-full lg:max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 lg:p-6 shadow-lg overflow-y-auto max-h-96 lg:max-h-full">
          
          {/* Statistics */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
              📊 Project Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-gray-600 text-sm">Total Modules</span>
                <span className="font-semibold text-gray-800">{statistics.totalModules}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-gray-600 text-sm">Dependencies</span>
                <span className="font-semibold text-gray-800">{statistics.totalDependencies}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-gray-600 text-sm">Circular Dependencies</span>
                <span className="font-semibold text-red-500">{statistics.circularDeps}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-gray-600 text-sm">Max Depth</span>
                <span className="font-semibold text-gray-800">{statistics.maxDepth}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">Avg. Dependencies</span>
                <span className="font-semibold text-gray-800">{statistics.avgDeps}</span>
              </div>
            </div>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div>
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                ⚠️ Detected Issues
              </h3>
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`bg-white border-l-4 p-4 rounded-lg shadow-sm transition-transform hover:translate-x-1 ${
                      issue.type === 'error' 
                        ? 'border-red-400' 
                        : issue.type === 'warning' 
                        ? 'border-yellow-400' 
                        : 'border-blue-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-800 text-sm mb-1">{issue.title}</div>
                    <div className="text-gray-600 text-xs leading-relaxed">{issue.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class Details */}
          {selectedNode && (
            <div className="mt-6">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                🔍 Class Details: {selectedNode}
              </h3>
              
              {loadingClassInfo ? (
                <div className="bg-white border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-gray-800 text-sm mb-1">
                    {isExploring ? 'Exploring Dependencies...' : 'Loading...'}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {isExploring ? 'Recursively fetching class hierarchy and relationships...' : 'Fetching detailed class information...'}
                  </div>
                </div>
              ) : classInfo ? (
                <div className="bg-white border-l-4 border-green-400 p-4 rounded-lg shadow-sm">
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-800 text-sm">{convertDotToSlash(classInfo.name)}</div>
                    
                    <div className="text-gray-600 text-xs">
                      <div className="mb-2">
                        <span className="font-medium">Parent Class:</span> {convertDotToSlash(classInfo.parent_class)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Is Provider:</span> {classInfo.is_provider ? 'Yes' : 'No'}
                      </div>
                      {classInfo.provider_class && (
                        <div className="mb-2">
                          <span className="font-medium">Provider Class:</span> {convertDotToSlash(classInfo.provider_class)}
                        </div>
                      )}
                    </div>
                    
                    {classInfo.parameters && classInfo.parameters.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 text-xs mt-3 mb-1">Parameters ({classInfo.parameters.length}):</div>
                        <div className="text-gray-600 text-xs space-y-1">
                          {classInfo.parameters.map((param, idx) => (
                            <div key={idx} className="bg-gray-50 px-2 py-1 rounded text-xs flex justify-between">
                              <span>{convertDotToSlash(param.name)}</span>
                              {param.is_provider && <span className="text-purple-600 font-medium">Provider</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {classInfo.components && classInfo.components.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 text-xs mt-3 mb-1">Components ({classInfo.components.length}):</div>
                        <div className="text-gray-600 text-xs space-y-1">
                          {classInfo.components.map((comp, idx) => (
                            <div key={idx} className="bg-gray-50 px-2 py-1 rounded text-xs flex justify-between">
                              <span>{convertDotToSlash(comp.name)}</span>
                              {comp.is_provider && <span className="text-purple-600 font-medium">Provider</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {classInfo.injections && classInfo.injections.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 text-xs mt-3 mb-1">Injections ({classInfo.injections.length}):</div>
                        <div className="text-gray-600 text-xs space-y-1">
                          {classInfo.injections.map((inj, idx) => (
                            <div key={idx} className="bg-gray-50 px-2 py-1 rounded text-xs flex justify-between">
                              <span>{convertDotToSlash(inj.name)}</span>
                              {inj.is_provider && <span className="text-purple-600 font-medium">Provider</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exploredNodes.size > 1 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <div className="font-medium text-blue-700 text-xs">Exploration Summary:</div>
                        <div className="text-blue-600 text-xs">
                          Explored {exploredNodes.size} classes in the dependency tree
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        setSelectedNode(null);
                        setClassInfo(null);
                        setExploredNodes(new Set());
                        // Reset visual selection
                        d3.selectAll(".node circle")
                          .style("stroke", "#fff")
                          .style("stroke-width", 2);
                      }}
                      className="mt-3 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-gray-800 text-sm mb-1">Failed to load</div>
                  <div className="text-gray-600 text-xs">Could not fetch class information</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visualization Container */}
        <div className="flex-1 min-h-96 lg:min-h-[600px] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <svg ref={svgRef} className="w-full h-full min-h-96 lg:min-h-[600px]"></svg>
          
          {/* Loading overlay for class info */}
          {loadingClassInfo && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white rounded-lg p-6 lg:p-8 shadow-xl flex flex-col items-center gap-4 max-w-sm mx-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <div className="text-center">
                  <div className="text-gray-800 font-semibold text-base lg:text-lg mb-1">
                    Analyzing Class: {selectedNode}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {isExploring ? 'Exploring dependency hierarchy...' : 'Fetching class information and relationships...'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading overlay for focusing */}
          {loadingFocus && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-6 shadow-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="text-gray-700 font-medium">Loading node details...</span>
              </div>
            </div>
          )}
          
          {/* Tooltip */}
          <div 
            ref={tooltipRef}
            className="absolute text-left p-3 text-sm bg-black/85 text-white rounded-lg pointer-events-none opacity-0 transition-opacity max-w-64 shadow-lg"
          ></div>
          
          {/* Legend */}
          <div className="absolute bottom-3 lg:bottom-5 right-3 lg:right-5 bg-white/95 p-3 lg:p-4 rounded-lg shadow-md text-xs lg:text-sm">
            <div className="space-y-1 lg:space-y-2">
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                <div className="w-4 lg:w-5 h-4 lg:h-5 rounded-full" style={{backgroundColor: "#ff9ff3"}}></div>
                <span className="text-gray-800 font-medium">Provider</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                <div className="w-4 lg:w-5 h-4 lg:h-5 rounded-full" style={{backgroundColor: "#95a5a6"}}></div>
                <span className="text-gray-800 font-medium">Class</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                <div className="w-4 lg:w-5 h-4 lg:h-5 rounded-full bg-yellow-400"></div>
                <span className="text-gray-800 font-medium">Singleton</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                <div className="w-4 lg:w-5 h-4 lg:h-5 rounded-full bg-red-400"></div>
                <span className="text-gray-800 font-medium">Circular Dependency</span>
              </div>
              <div className="mt-2 lg:mt-3 pt-1 lg:pt-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-800 mb-1 lg:mb-2">Relationships:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 lg:w-4 h-0.5 bg-blue-500"></div>
                    <span className="text-gray-800 font-medium">extends</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 lg:w-4 h-0.5 bg-green-500"></div>
                    <span className="text-gray-800 font-medium">depends</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 lg:w-4 h-0.5 bg-purple-500"></div>
                    <span className="text-gray-800 font-medium">provides</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 lg:w-4 h-0.5 bg-orange-500"></div>
                    <span className="text-gray-800 font-medium">injects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .circular {
          stroke-dasharray: 5, 5;
          animation: dash 20s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
};

export default Visualizer;
