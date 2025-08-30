import { useState, useCallback, useEffect } from 'react';
import { calculateStatistics, detectIssues } from '../utils/dataUtils';
import { apiService, exploreClassRecursively } from '../services/apiService';

/**
 * Custom hook for managing visualizer state and data operations
 */
export const useVisualizerData = () => {
  const [projectData, setProjectData] = useState({
    nodes: [],
    links: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [statistics, setStatistics] = useState({
    totalModules: 0,
    totalDependencies: 0,
    circularDeps: 0,
    maxDepth: 0,
    avgDeps: 0
  });

  const [issues, setIssues] = useState([]);

  // Update statistics when project data changes
  const updateStatistics = useCallback(() => {
    const newStats = calculateStatistics(projectData.nodes, projectData.links);
    setStatistics(newStats);
  }, [projectData]);

  // Detect issues in the current project data
  const analyzeIssues = useCallback(() => {
    const detectedIssues = detectIssues(projectData.nodes, projectData.links);
    setIssues(detectedIssues);
    return detectedIssues;
  }, [projectData]);

  // Load base classes from API
  const loadBaseClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      const data = await apiService.fetchBaseClasses();
      
      if (data && data.base_classes) {
        const nodes = data.base_classes.map(cls => ({
          id: cls.name?.replace(/\./g, '/') || 'Unknown',
          type: cls.is_provider ? "provider" : "class",
          scope: "module",
          isProvider: cls.is_provider,
          fullName: cls.name?.replace(/\./g, '/') || 'Unknown'
        }));
        
        setProjectData({ nodes, links: [] });
        return { nodes, links: [] };
      }
    } catch (error) {
      console.error('Error loading base classes:', error);
      setLoadError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load base classes on mount
  useEffect(() => {
    loadBaseClasses().catch(error => {
      console.error('Failed to load initial data:', error);
    });
  }, [loadBaseClasses]);

  // Export graph data
  const exportGraphData = useCallback(() => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dependency-graph.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [projectData]);

  return {
    projectData,
    setProjectData,
    statistics,
    issues,
    isLoading,
    loadError,
    updateStatistics,
    analyzeIssues,
    loadBaseClasses,
    exportGraphData
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

  const convertDotToSlash = useCallback((name) => {
    if (!name) return name;
    return name.replace(/\./g, '/');
  }, []);

  const exploreClass = useCallback(async (className, setProjectData) => {
    if (!className || typeof className !== 'string') {
      console.warn('Invalid className provided to exploreClass:', className);
      return;
    }

    setIsExploring(true);
    setClassInfo(null);

    try {
      const result = await exploreClassRecursively(
        className,
        new Set(),
        new Map(),
        new Set(),
        0,
        convertDotToSlash
      );

      if (result && result.nodes && result.links) {
        setProjectData(result);
        
        // Set class info for the main class
        try {
          const mainClassInfo = await apiService.fetchClassInfo(className);
          setClassInfo(mainClassInfo);
          setSelectedNode(convertDotToSlash(mainClassInfo.name));
          setExploredNodes(new Set([className]));
        } catch (infoError) {
          console.warn('Could not fetch main class info:', infoError);
        }
      }
    } catch (error) {
      console.error('Error exploring class hierarchy:', error);
      throw error;
    } finally {
      setIsExploring(false);
    }
  }, [convertDotToSlash]);

  const clearExploration = useCallback(() => {
    setSelectedNode(null);
    setClassInfo(null);
    setExploredNodes(new Set());
    setLoadingClassInfo(false);
    setIsExploring(false);
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
    exploreClass,
    clearExploration,
    convertDotToSlash
  };
};

/**
 * Custom hook for managing focus and navigation state
 */
export const useFocusNavigation = () => {
  const [previousState, setPreviousState] = useState(null);
  const [focusedNode, setFocusedNode] = useState(null);
  const [loadingFocus, setLoadingFocus] = useState(false);

  const focusOnNode = useCallback(async (nodeId, projectData) => {
    setLoadingFocus(true);
    
    try {
      // Save current state for back functionality
      setPreviousState({
        nodes: [...projectData.nodes],
        links: [...projectData.links],
        focusedNode: focusedNode
      });

      // Find all nodes connected to the selected node
      const connectedNodeIds = new Set([nodeId]);
      const relevantLinks = [];

      // Find all direct connections
      projectData.links.forEach(link => {
        const sourceId = link.source?.id || link.source;
        const targetId = link.target?.id || link.target;

        if (sourceId === nodeId) {
          connectedNodeIds.add(targetId);
          relevantLinks.push(link);
        }
        if (targetId === nodeId) {
          connectedNodeIds.add(sourceId);
          relevantLinks.push(link);
        }
      });

      // Filter nodes to only include connected ones
      const filteredNodes = projectData.nodes.filter(node => connectedNodeIds.has(node.id));

      setFocusedNode(nodeId);
      
      return {
        nodes: filteredNodes,
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
    if (previousState) {
      return {
        nodes: previousState.nodes,
        links: previousState.links,
        focusedNode: previousState.focusedNode
      };
    }
    return null;
  }, [previousState]);

  const clearFocus = useCallback(() => {
    setFocusedNode(null);
    setPreviousState(null);
    setLoadingFocus(false);
  }, []);

  return {
    previousState,
    setPreviousState,
    focusedNode,
    setFocusedNode,
    loadingFocus,
    focusOnNode,
    goBack,
    clearFocus
  };
};
