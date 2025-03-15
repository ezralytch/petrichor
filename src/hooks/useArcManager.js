import { useState, useRef, useEffect } from 'react';
import { generateColorArray } from '../constants/colors';
import { DEFAULT_SETTINGS } from '../constants/settings';
import { initializeArcs } from '../utils/arcUtils';

/**
 * Custom hook to manage arcs and their addition with smooth resizing
 * @param {Object} options - Configuration options
 * @returns {Object} - Arc management functions and state
 */
const useArcManager = (options = {}) => {
  const {
    initialArcCount = DEFAULT_SETTINGS.initialArcCount,
    maxArcs = DEFAULT_SETTINGS.maxArcs,
    duration = DEFAULT_SETTINGS.duration,
    maxCycles = 100
  } = options;
  
  // Arc state management
  const [arcCount, setArcCount] = useState(initialArcCount);
  const arcDataRef = useRef([]);
  const startTimeRef = useRef(new Date().getTime());
  
  // Base settings for spacing calculations - updated when canvas size changes
  const baseSettingsRef = useRef({
    initialRadius: 0,
    clearance: 0,
    length: 0
  });
  
  // Arc addition cooldown tracking
  const lastArcAddTimeRef = useRef(0);
  const arcAddCooldownRef = useRef(0);
  
  // Generate colors for all possible arcs
  const allPossibleColors = useRef(generateColorArray(maxArcs));
  
  // Initialize arcs on first render
  useEffect(() => {
    const colors = allPossibleColors.current.slice(0, arcCount);
    arcDataRef.current = initializeArcs(
      colors, 
      arcCount, 
      [], 
      maxCycles, 
      duration, 
      startTimeRef.current,
      baseSettingsRef.current
    );
  }, []);
  
  // Update arcs when arc count changes
  useEffect(() => {
    if (arcDataRef.current.length !== arcCount) {
      const colors = allPossibleColors.current.slice(0, arcCount);
      arcDataRef.current = initializeArcs(
        colors, 
        arcCount, 
        arcDataRef.current, 
        maxCycles, 
        duration, 
        startTimeRef.current,
        baseSettingsRef.current
      );
    }
  }, [arcCount, duration, maxCycles]);
  
  /**
   * Update base settings when canvas dimensions change
   * @param {Object} dimensions - Canvas dimensions and calculated values
   */
  const updateBaseSettings = (dimensions) => {
    if (!dimensions) return;
    
    baseSettingsRef.current = {
      initialRadius: dimensions.initialRadius,
      clearance: dimensions.clearance,
      length: dimensions.length
    };
  };
  
  /**
   * Function to add arcs based on complete rotations with cooldown
   */
  const addArcsWithCooldown = () => {
    // Get the current time
    const currentTime = new Date().getTime();
    
    // Only proceed if we haven't reached max arcs and we're past cooldown
    if (arcCount >= maxArcs || currentTime < lastArcAddTimeRef.current + arcAddCooldownRef.current) {
      return;
    }
    
    // Get the last added arc's data
    const lastArcIndex = arcCount - 1;
    if (lastArcIndex < 0) return; // No arcs yet
    
    const lastArc = arcDataRef.current[lastArcIndex];
    if (!lastArc) return; // Safety check
    
    // Calculate elapsed time and distance traveled by the last arc
    const elapsedTime = (currentTime - startTimeRef.current) / 1000;
    const distanceTraveled = elapsedTime * lastArc.velocity;
    const completeRotations = Math.floor(distanceTraveled / (2 * Math.PI));
    
    // Get the last checked rotation count
    const lastRotationCount = lastArc.lastCheckedRotation || 0;
    
    // If we've completed a new full rotation
    if (completeRotations > lastRotationCount) {
      // Update the last checked rotation count regardless
      lastArc.lastCheckedRotation = completeRotations;
      arcDataRef.current[lastArcIndex] = lastArc;
      
      // Random chance to add an arc after rotation completion
      // Higher chance the more rotations since last arc addition
      const addChance = Math.min(0.3 + (completeRotations - lastRotationCount) * 0.1, 0.7);
      
      if (Math.random() < addChance) {
        // Add a new arc
        setArcCount(prev => Math.min(prev + 1, maxArcs));
        
        // Set random cooldown between 1-3 rotations worth of time
        const rotationTimeMs = (2 * Math.PI / lastArc.velocity) * 1000;
        const randomMultiplier = 1 + Math.random() * 2; // Random number between 1-3
        arcAddCooldownRef.current = rotationTimeMs * randomMultiplier;
        
        // Update last add time
        lastArcAddTimeRef.current = currentTime;
        
        console.log(`Added arc after ${completeRotations} rotations. Next possible add in ${(arcAddCooldownRef.current/1000).toFixed(1)}s`);
      }
    }
  };
  
  /**
   * Reset the arc system to initial state
   */
  const resetArcs = () => {
    setArcCount(initialArcCount);
    arcDataRef.current = [];
    startTimeRef.current = new Date().getTime();
    lastArcAddTimeRef.current = 0;
    arcAddCooldownRef.current = 0;
    
    // Re-initialize arcs
    const colors = allPossibleColors.current.slice(0, initialArcCount);
    arcDataRef.current = initializeArcs(
      colors, 
      initialArcCount, 
      [], 
      maxCycles, 
      duration, 
      startTimeRef.current,
      baseSettingsRef.current
    );
  };
  
  return {
    arcCount,
    setArcCount,
    arcDataRef,
    startTimeRef,
    resetArcs,
    addArcsWithCooldown,
    maxArcs,
    allPossibleColors: allPossibleColors.current,
    updateBaseSettings
  };
};

export default useArcManager;