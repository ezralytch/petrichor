import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing an animation loop
 * @param {Function} callback - The function to call on each animation frame
 * @param {boolean} isActive - Whether the animation is active
 * @returns {Object} - Animation control functions
 */
const useAnimationLoop = (callback, isActive = true) => {
  const requestIdRef = useRef(null);
  const previousTimeRef = useRef(0);
  
  const animate = useCallback(time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime, time);
    }
    
    previousTimeRef.current = time;
    requestIdRef.current = requestAnimationFrame(animate);
  }, [callback]);
  
  useEffect(() => {
    if (isActive) {
      requestIdRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
  }, [isActive, animate]);
  
  const start = useCallback(() => {
    if (!requestIdRef.current) {
      previousTimeRef.current = performance.now();
      requestIdRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);
  
  const stop = useCallback(() => {
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
  }, []);
  
  return {
    start,
    stop,
    isRunning: !!requestIdRef.current
  };
};

export default useAnimationLoop;