/**
 * API service functions for backend communication
 */

export const apiService = {
  /**
   * Fetch base classes from the API
   */
  async fetchBaseClasses() {
    try {
      const response = await fetch('/api/base-classes');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching base classes:', error);
      throw error;
    }
  },

  /**
   * Fetch detailed class information
   */
  async fetchClassInfo(className) {
    try {
      const response = await fetch('/api/base-classes');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching base classes:', error);
      throw error;
    }
  },

  /**
   * Fetch detailed class information
   */
  async fetchClassInfo(className) {
    try {
      // Safety check for className
      if (!className || typeof className !== 'string') {
        console.warn('Invalid className provided to fetchClassInfo:', className);
        return null;
      }

      // Filter out problematic class names that the API can't handle
      if (this.isProblematicClassName(className)) {
        console.warn(`Skipping problematic class name: ${className}`);
        return null;
      }

      // Convert dot notation to slash notation for API call
      const apiClassName = className.replace(/\./g, '/');
      const response = await fetch(`/api/class-info/${encodeURIComponent(apiClassName)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Class info not found for ${className} (404) - skipping detailed exploration`);
          return null;
        }
        if (response.status === 500) {
          console.warn(`Server error for ${className} (500) - likely unsupported class type, skipping`);
          return null;
        }
        console.warn(`Failed to fetch class info for ${className}: ${response.status} - continuing without this class`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`Error fetching class info for ${className}:`, error.message, '- continuing without this class');
      return null;
    }
  },

  /**
   * Fetch child classes for a given class
   */
  async fetchChildClasses(className) {
    try {
      // Safety check for className
      if (!className || typeof className !== 'string') {
        console.warn('Invalid className provided to fetchChildClasses:', className);
        return null;
      }

      // Convert dot notation to slash notation for API call
      const apiClassName = className.replace(/\./g, '/');
      const response = await fetch(`/api/child-classes/${encodeURIComponent(apiClassName)}`);
      
      if (!response.ok) {
        console.warn(`Failed to fetch child classes for ${className}: ${response.status}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch child classes for ${className}:`, error);
      return null;
    }
  },

  /**
   * Check if a class name is problematic and should be skipped
   */
  isProblematicClassName(className) {
    // Skip classes with generic type parameters
    if (className.includes('<') || className.includes('>')) {
      return true;
    }
    
    // Skip classes with wildcards or special characters
    if (className.includes('?') || className.includes('*') || className.includes('$')) {
      return true;
    }
    
    // Skip kotlin function types which often cause server errors
    if (className.includes('kotlin.jvm.functions.Function')) {
      return true;
    }
    
    // Skip lambda expressions
    if (className.includes('lambda') || className.includes('Lambda')) {
      return true;
    }
    
    // Skip classes with arrays notation
    if (className.includes('[') || className.includes(']')) {
      return true;
    }
    
    return false;
  }
};

/**
 * Recursively explore class hierarchy and relationships
 */
export const exploreClassRecursively = async (
  className, 
  visited, 
  nodeMap, 
  linkSet, 
  depth = 0, 
  convertDotToSlash,
  setClassInfo = null,
  setSelectedNode = null,
  setExploredNodes = null,
  projectData = null
) => {
  // Safety check for undefined or null className
  if (!className || typeof className !== 'string') {
    console.warn('Invalid className provided to exploreClassRecursively:', className);
    return;
  }
  
  // Skip problematic class names that can't be handled by the API
  if (apiService.isProblematicClassName(className)) {
    console.warn(`Skipping problematic class name in exploration: ${className}`);
    return;
  }
  
  // Prevent infinite recursion and limit depth
  if (visited.has(className) || depth > 5) {
    return;
  }
  
  visited.add(className);
  console.log(`Exploring ${className} at depth ${depth}`);
  
  // Initialize with current project data on first call (depth 0)
  if (depth === 0 && projectData) {
    // Add existing nodes to nodeMap
    projectData.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // Add existing links to linkSet
    projectData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const linkKey = `${sourceId}|||${link.type || 'normal'}|||${targetId}`;
      linkSet.add(linkKey);
    });
  }
  
  let classData = null; // Declare at function level for access at end
  
  try {
    classData = await apiService.fetchClassInfo(className);
    if (!classData) return;
    
    const currentNodeName = convertDotToSlash(classData.name);
    
    // Add current node
    nodeMap.set(currentNodeName, {
      id: currentNodeName,
      type: classData.type || "class",
      scope: classData.scope || "module",
      isProvider: classData.is_provider || false,
      fullName: classData.name
    });
    
    // Process parent class relationships
    if (classData.parent_class && classData.parent_class !== 'Object') {
      const parentNodeName = convertDotToSlash(classData.parent_class);
      
      // Add parent node if not exists
      if (!nodeMap.has(parentNodeName)) {
        nodeMap.set(parentNodeName, {
          id: parentNodeName,
          type: "class",
          scope: "module",
          isProvider: false,
          fullName: classData.parent_class
        });
      }
      
      // Add inheritance link
      const inheritanceKey = `${currentNodeName}|||extends|||${parentNodeName}`;
      if (!linkSet.has(inheritanceKey)) {
        linkSet.add(inheritanceKey);
      }
    }
    
    // Process parameters (dependencies)
    if (classData.parameters && Array.isArray(classData.parameters)) {
      for (const param of classData.parameters.slice(0, 10)) { // Limit to prevent too many deps
        if (param && param.name) {
          // Skip primitive types and common Java classes
          if (['String', 'Integer', 'Boolean', 'Long', 'Double', 'Float'].includes(param.name) ||
              param.name.startsWith('java.')) {
            continue;
          }
          
          // Skip problematic class names
          if (apiService.isProblematicClassName(param.name)) {
            console.warn(`Skipping problematic parameter class: ${param.name}`);
            continue;
          }
          
          const depNodeName = convertDotToSlash(param.name);
          
          // Add dependency node if not exists
          if (!nodeMap.has(depNodeName)) {
            nodeMap.set(depNodeName, {
              id: depNodeName,
              type: "class",
              scope: "module",
              isProvider: param.is_provider || false,
              fullName: depNodeName
            });
          }
          
          // Add dependency link
          const dependencyKey = `${currentNodeName}|||depends|||${depNodeName}`;
          if (!linkSet.has(dependencyKey)) {
            linkSet.add(dependencyKey);
          }
          
          // Recursively explore parameter (limited depth)
          if (depth < 2) {
            try {
              await exploreClassRecursively(param.name, visited, nodeMap, linkSet, depth + 1, convertDotToSlash, null, null, null);
            } catch (err) {
              console.warn(`Failed to explore parameter class ${param.name}:`, err);
            }
          }
        }
      }
    }
    
    // Process components (what this class provides)
    if (classData.components && Array.isArray(classData.components)) {
      for (const component of classData.components.slice(0, 10)) { // Limit to prevent explosion
        if (component && component.name) {
          // Skip primitive types
          if (['String', 'Integer', 'Boolean', 'Long', 'Double', 'Float'].includes(component.name) ||
              component.name.startsWith('java.')) {
            continue;
          }
          
          // Skip problematic class names
          if (apiService.isProblematicClassName(component.name)) {
            console.warn(`Skipping problematic component class: ${component.name}`);
            continue;
          }
          
          const compNodeName = convertDotToSlash(component.name);
          
          // Add component node if not exists
          if (!nodeMap.has(compNodeName)) {
            nodeMap.set(compNodeName, {
              id: compNodeName,
              type: "class",
              scope: "module",
              isProvider: component.is_provider || false,
              fullName: compNodeName
            });
          }
          
          // Add provides link
          const providesKey = `${currentNodeName}|||provides|||${compNodeName}`;
          if (!linkSet.has(providesKey)) {
            linkSet.add(providesKey);
          }
          
          // Recursively explore component (limited depth)
          if (depth < 2) {
            try {
              await exploreClassRecursively(component.name, visited, nodeMap, linkSet, depth + 1, convertDotToSlash, null, null, null);
            } catch (err) {
              console.warn(`Failed to explore component class ${component.name}:`, err);
            }
          }
        }
      }
    }
    
    // Process injections (what gets injected into this class)
    if (classData.injections && Array.isArray(classData.injections)) {
      for (const injection of classData.injections.slice(0, 10)) { // Limit injections
        if (injection && injection.name) {
          // Skip primitive types
          if (['String', 'Integer', 'Boolean', 'Long', 'Double', 'Float'].includes(injection.name) ||
              injection.name.startsWith('java.')) {
            continue;
          }
          
          // Skip problematic class names
          if (apiService.isProblematicClassName(injection.name)) {
            console.warn(`Skipping problematic injection class: ${injection.name}`);
            continue;
          }
          
          const injNodeName = convertDotToSlash(injection.name);
          
          // Add injection node if not exists
          if (!nodeMap.has(injNodeName)) {
            nodeMap.set(injNodeName, {
              id: injNodeName,
              type: "class",
              scope: "module",
              isProvider: injection.is_provider || false,
              fullName: injNodeName
            });
          }
          
          // Add injection link
          const injectionKey = `${injNodeName}|||injects|||${currentNodeName}`;
          if (!linkSet.has(injectionKey)) {
            linkSet.add(injectionKey);
          }
          
          // Recursively explore injection (limited depth)
          if (depth < 2) {
            try {
              await exploreClassRecursively(injection.name, visited, nodeMap, linkSet, depth + 1, convertDotToSlash, null, null, null);
            } catch (err) {
              console.warn(`Failed to explore injection class ${injection.name}:`, err);
            }
          }
        }
      }
    }
    
    // Try to fetch child classes for additional relationships
    try {
      const childData = await apiService.fetchChildClasses(className);
      
      if (childData && childData.child_classes && Array.isArray(childData.child_classes)) {
        for (const childClass of childData.child_classes.slice(0, 5)) { // Limit to 5 children
          if (childClass && childClass !== currentNodeName) {
            const childNodeName = convertDotToSlash(childClass);
            
            // Add child node if not exists
            if (!nodeMap.has(childNodeName)) {
              nodeMap.set(childNodeName, {
                id: childNodeName,
                type: "class",
                scope: "module",
                isProvider: false,
                fullName: childNodeName
              });
            }
            
            // Add inheritance link (child extends parent)
            const childInheritanceKey = `${childNodeName}|||extends|||${currentNodeName}`;
            if (!linkSet.has(childInheritanceKey)) {
              linkSet.add(childInheritanceKey);
            }
            
            // Recursively explore child (very limited depth)
            if (depth < 1) {
              try {
                await exploreClassRecursively(childClass, visited, nodeMap, linkSet, depth + 1, convertDotToSlash, null, null, null);
              } catch (err) {
                console.warn(`Failed to explore child class ${childClass}:`, err);
              }
            }
          }
        }
      }
    } catch (childErr) {
      console.warn(`Failed to fetch child classes for ${className}:`, childErr);
    }
    
    // Set class info and update project data for the root class (depth 0 only)
    if (depth === 0 && classData) {
      if (setClassInfo) setClassInfo(classData);
      if (setSelectedNode) setSelectedNode(convertDotToSlash(classData.name));
      if (setExploredNodes) setExploredNodes(visited);
      
      // Return the updated project data with explored nodes and links
      const newNodes = Array.from(nodeMap.values());
      const newLinks = Array.from(linkSet).map(linkKey => {
        const [source, type, target] = linkKey.split('|||');
        return { source, target, type };
      });
      
      console.log('Exploration complete:', { nodes: newNodes.length, links: newLinks.length });
      
      return { nodes: newNodes, links: newLinks };
    }
    
    return null; // Return null for non-root calls
    
  } catch (error) {
    console.error(`Error exploring ${className}:`, error);
  }
};