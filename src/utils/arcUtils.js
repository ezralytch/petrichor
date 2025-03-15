import { calculateVelocity, calculateNextImpactTime } from './mathUtils';

/**
 * Creates a new arc object
 * @param {string} color - The color of the arc
 * @param {number} index - The index of the arc
 * @param {number} maxCycles - The maximum number of cycles
 * @param {number} duration - The animation duration
 * @param {number} startTime - The start time in ms
 * @param {boolean} animate - Whether to animate the arc's entrance
 * @param {number} initialRadius - The initial radius value
 * @param {number} targetRadius - The target radius value
 * @returns {Object} - The arc object
 */
export const createArc = (color, index, maxCycles, duration, startTime, animate = true, initialRadius = null, targetRadius = null) => {
  const velocity = calculateVelocity(index, maxCycles, duration);
  const nextImpactTime = calculateNextImpactTime(startTime, velocity);
  const currentTime = new Date().getTime();
  
  return {
    color,
    velocity,
    lastImpactTime: 0,
    nextImpactTime,
    glowColor1: null,
    glowColor2: null,
    glowTime: null,
    lastCheckedRotation: 0,
    
    // Animation properties
    isAnimatingIn: animate,
    animationStartTime: animate ? currentTime : 0,
    animationDuration: 1500, // Animation duration in ms
    opacity: animate ? 0 : 1, // Start transparent if animating
    
    // Radius animation properties
    currentRadius: initialRadius || targetRadius,
    targetRadius: targetRadius,
    isResizing: initialRadius !== null && targetRadius !== null && initialRadius !== targetRadius,
    resizeStartTime: initialRadius !== null && targetRadius !== null && initialRadius !== targetRadius ? currentTime : 0,
    resizeDuration: 1000 // Resize animation duration in ms
  };
};

/**
 * Updates arc animation properties
 * @param {Object} arc - The arc to update
 * @param {number} currentTime - Current timestamp
 */
export const updateArcAnimation = (arc, currentTime) => {
  let updated = { ...arc };
  
  // Handle fade-in animation
  if (updated.isAnimatingIn) {
    const elapsed = currentTime - updated.animationStartTime;
    
    if (elapsed >= updated.animationDuration) {
      // Animation complete
      updated.isAnimatingIn = false;
      updated.opacity = 1;
    } else {
      // Ease-in function: cubic easing (t³)
      const progress = elapsed / updated.animationDuration;
      const easedProgress = progress * progress * progress;
      updated.opacity = easedProgress;
    }
  }
  
  // Handle resize animation
  if (updated.isResizing) {
    const elapsed = currentTime - updated.resizeStartTime;
    
    if (elapsed >= updated.resizeDuration) {
      // Resize complete
      updated.isResizing = false;
      updated.currentRadius = updated.targetRadius;
    } else {
      // Ease animation for smooth transition
      const progress = elapsed / updated.resizeDuration;
      // Ease-out function: cubic easing (1-(1-t)³)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate intermediate radius
      const initialRadius = updated.currentRadius;
      const radiusDiff = updated.targetRadius - initialRadius;
      updated.currentRadius = initialRadius + (radiusDiff * easedProgress);
    }
  }
  
  return updated;
};

/**
 * Initializes or updates the arcs array with smooth resize transitions
 * @param {Array<string>} colors - Array of colors
 * @param {number} arcCount - The number of arcs to create
 * @param {Array<Object>} existingArcs - Existing arcs array
 * @param {number} maxCycles - The maximum number of cycles
 * @param {number} duration - The animation duration
 * @param {number} startTime - The animation start time
 * @param {Object} baseSettings - Base visual settings
 * @returns {Array<Object>} - The updated arcs array
 */
export const initializeArcs = (colors, arcCount, existingArcs, maxCycles, duration, startTime, baseSettings = null) => {
  const currentTime = new Date().getTime();
  
  // Calculate base spacing and radius settings
  const calculateSpacing = (count) => {
    if (!baseSettings) return null;
    
    // Get base measurements from settings
    const initialRadius = baseSettings.initialRadius || 0;
    const clearance = baseSettings.clearance || 0;
    const length = baseSettings.length || 0;
    
    // Calculate spacing based on current count
    return (length - initialRadius - clearance) / 2 / count;
  };
  
  // Calculate target radius for an arc at a specific index
  const getTargetRadius = (index, count) => {
    if (!baseSettings) return null;
    
    const initialRadius = baseSettings.initialRadius || 0;
    const spacing = calculateSpacing(count);
    
    return initialRadius + (spacing * index);
  };
  
  // If we have existing data and are adding more arcs
  if (existingArcs.length > 0 && existingArcs.length < arcCount) {
    // Calculate new spacing based on new arc count
    const newSpacing = calculateSpacing(arcCount);
    
    // Update existing arcs with new target radius values
    const updatedArcs = existingArcs.map((arc, index) => {
      const currentRadius = arc.currentRadius || getTargetRadius(index, existingArcs.length);
      const targetRadius = getTargetRadius(index, arcCount);
      
      // Skip animation for non-visible arcs
      const shouldAnimate = arc.opacity > 0.1;
      
      return {
        ...arc,
        currentRadius: shouldAnimate ? currentRadius : targetRadius,
        targetRadius: targetRadius,
        isResizing: shouldAnimate && currentRadius !== targetRadius,
        resizeStartTime: shouldAnimate && currentRadius !== targetRadius ? currentTime : 0
      };
    });
    
    // Create new arcs for the newly added ones
    const newArcs = colors.slice(existingArcs.length, arcCount).map((color, i) => {
      const index = i + existingArcs.length;
      
      // Calculate target radius for new arc
      const targetRadius = getTargetRadius(index, arcCount);
      
      // Create new arc with animation enabled
      return createArc(
        color, 
        index, 
        maxCycles, 
        duration, 
        currentTime, 
        true, 
        targetRadius, // Initial radius same as target for new arcs
        targetRadius
      );
    });
    
    return [...updatedArcs, ...newArcs];
  } else {
    // Complete initialization from scratch
    return colors.slice(0, arcCount).map((color, index) => {
      const targetRadius = getTargetRadius(index, arcCount);
      
      // Don't animate the initial arcs
      return createArc(
        color, 
        index, 
        maxCycles, 
        duration, 
        startTime, 
        false,
        targetRadius,
        targetRadius
      );
    });
  }
};

/**
 * Updates all arcs' radius targets when arc count changes
 * @param {Array<Object>} arcs - Current arcs array
 * @param {number} arcCount - New arc count
 * @param {Object} baseSettings - Base visual settings
 * @returns {Array<Object>} - Updated arcs array
 */
export const updateArcsForResize = (arcs, arcCount, baseSettings) => {
  const currentTime = new Date().getTime();
  
  // Calculate base spacing and radius settings
  const calculateSpacing = (count) => {
    if (!baseSettings) return null;
    
    // Get base measurements from settings
    const initialRadius = baseSettings.initialRadius || 0;
    const clearance = baseSettings.clearance || 0;
    const length = baseSettings.length || 0;
    
    // Calculate spacing based on current count
    return (length - initialRadius - clearance) / 2 / count;
  };
  
  // Calculate target radius for an arc at a specific index
  const getTargetRadius = (index, count) => {
    if (!baseSettings) return null;
    
    const initialRadius = baseSettings.initialRadius || 0;
    const spacing = calculateSpacing(count);
    
    return initialRadius + (spacing * index);
  };
  
  // Update all arcs with new target radius values
  return arcs.map((arc, index) => {
    const currentRadius = arc.currentRadius || getTargetRadius(index, arcs.length);
    const targetRadius = getTargetRadius(index, arcCount);
    
    return {
      ...arc,
      currentRadius: currentRadius,
      targetRadius: targetRadius,
      isResizing: currentRadius !== targetRadius,
      resizeStartTime: currentRadius !== targetRadius ? currentTime : 0
    };
  });
};

/**
 * Checks if a dot is at an impact point
 * @param {number} angle - The current angle in radians
 * @param {number} threshold - The threshold for impact detection in radians
 * @returns {Object} - {isAtImpact, isLeft} indicating if it's at an impact and which side
 */
export const checkImpactPosition = (angle, threshold = 0.05) => {
  // Check if we're at left side impact (π)
  const isAtLeftImpact = Math.abs(angle - Math.PI) < threshold;
  
  // Check if we're at right side impact (0 or 2π)
  const isAtRightImpact = angle < threshold || Math.abs(angle - (2 * Math.PI)) < threshold;
  
  return {
    isAtImpact: isAtLeftImpact || isAtRightImpact,
    isLeft: isAtLeftImpact
  };
};

export default {
  createArc,
  initializeArcs,
  checkImpactPosition,
  updateArcAnimation,
  updateArcsForResize
};