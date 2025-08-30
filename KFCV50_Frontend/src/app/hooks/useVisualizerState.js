/**
 * Custom hooks for managing visualizer state
 */
import { useState, useCallback } from 'react';
import { calculateStatistics, detectIssues, transformBaseClasses } from '../utils/dataUtils';
import { apiService, exploreClassRecursively } from '../services/apiService';

/**
 * Custom hook for managing project data and analysis
 */
export const useProjectData = () => {
  // Start with empty data, real data will be loaded via analyzeProject
  const [projectData, setProjectData] = useState({
    nodes: [],
    links: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statistics, setStatistics] = useState({
    totalModules: 0,
    totalDependencies: 0,
    circularDeps: 0,
    maxDepth: 0,
    avgDeps: 0
  });

  const [issues, setIssues] = useState([]);

  // Utility function to convert dot notation to slash notation
  const convertDotToSlash = useCallback((name) => {
    if (!name) return name;
    return name.replace(/\./g, '/');
  }, []);

    // Auto-load base classes function (matches original exactly)
  const analyzeProject = useCallback(async (clearHistory, setFocusedNode, resetView) => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('Already loading, skipping duplicate analyzeProject call');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Reset focus state when loading new data
    if (clearHistory) clearHistory();
    if (setFocusedNode) setFocusedNode(null);
    
    try {
      const data = await apiService.fetchBaseClasses();
      console.log('Raw API data received:', data);
      
      const transformedData = transformBaseClasses(data);
      console.log('Transformed data:', transformedData);
      
      setProjectData(transformedData);
      
      // Reset view after loading new data with longer delay for force simulation
      if (resetView) {
        setTimeout(() => {
          resetView();
        }, 1000);
      }
      
    } catch (err) {
      console.error('Error fetching base classes:', err);
      setError(`Failed to load project dependencies: ${err.message}`);
      
      // On error, keep the demo data but log that we're using it
      console.log('Using demo data due to API failure');
    } finally {
      setLoading(false);
    }
  }, [loading]); // Add loading as dependency

  return {
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
  };
};

/**
 * Custom hook for managing class exploration state
 */
export const useClassExploration = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [loadingClassInfo, setLoadingClassInfo] = useState(false);
  const [exploredNodes, setExploredNodes] = useState(new Set());
  const [isExploring, setIsExploring] = useState(false);

  const fetchClassInfo = useCallback(async (className, convertDotToSlash, projectData, hidePreviewSteps = false) => {
    try {
      // Safety check for className
      if (!className || typeof className !== 'string') {
        console.warn('Invalid className provided to fetchClassInfo:', className);
        return null;
      }
      
      setIsExploring(true);
      setClassInfo(null); // Clear previous class info
      
      // If hidePreviewSteps is true, start with empty data instead of merging with existing
      const baseProjectData = hidePreviewSteps ? { nodes: [], links: [] } : projectData;
      
      const updatedProjectData = await exploreClassRecursively(
        className, 
        new Set(), 
        new Map(), 
        new Set(), 
        0, 
        convertDotToSlash,
        setClassInfo,
        setSelectedNode,
        setExploredNodes,
        baseProjectData
      );
      
      return updatedProjectData; // Return the updated project data
    } catch (err) {
      console.error('Error exploring class hierarchy:', err);
      throw err;
    } finally {
      setIsExploring(false);
    }
  }, []);

  return {
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
  };
};

/**
 * Custom hook for managing focus and navigation state with history stack
 */
export const useFocusNavigation = () => {
  const [historyStack, setHistoryStack] = useState([]);
  const [focusedNode, setFocusedNode] = useState(null);
  const [loadingFocus, setLoadingFocus] = useState(false);

  const focusOnNode = useCallback(async (nodeId, projectData) => {
    setLoadingFocus(true);
    
    try {
      // Save current state to history stack
      setHistoryStack(prevStack => [
        ...prevStack,
        {
          nodes: [...projectData.nodes],
          links: [...projectData.links],
          focusedNode: focusedNode
        }
      ]);

      // Find all nodes connected to the selected node
      const connectedNodeIds = new Set([nodeId]);
      const relevantLinks = [];

      // Add direct connections
      projectData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === nodeId) {
          connectedNodeIds.add(targetId);
          relevantLinks.push(link);
        } else if (targetId === nodeId) {
          connectedNodeIds.add(sourceId);
          relevantLinks.push(link);
        }
      });

      // Filter nodes to only connected ones
      const focusedNodes = projectData.nodes.filter(node => connectedNodeIds.has(node.id));
      
      setFocusedNode(nodeId);
      
      return {
        nodes: focusedNodes,
        links: relevantLinks
      };
      
    } catch (error) {
      console.error('Error focusing on node:', error);
      throw error;
    } finally {
      setLoadingFocus(false);
    }
  }, [focusedNode]);

  const goBack = useCallback(() => {
    if (historyStack.length > 0) {
      const previousState = historyStack[historyStack.length - 1];
      
      // Remove the last item from history stack
      setHistoryStack(prevStack => prevStack.slice(0, -1));
      
      setFocusedNode(previousState.focusedNode);
      
      return {
        nodes: previousState.nodes,
        links: previousState.links
      };
    }
    return null;
  }, [historyStack]);

  const clearHistory = useCallback(() => {
    setHistoryStack([]);
    setFocusedNode(null);
  }, []);

  const canGoBack = historyStack.length > 0;

  return {
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
  };
};


