/**
 * Calculates the velocity of an arc based on its index
 * @param {number} index - The index of the arc
 * @param {number} maxCycles - The maximum number of cycles
 * @param {number} duration - The duration in seconds
 * @returns {number} - The velocity in radians per second
 */
export const calculateVelocity = (index, maxCycles, duration) => {  
  const numberOfCycles = maxCycles - index;
  const distancePerCycle = 2 * Math.PI;
  return (numberOfCycles * distancePerCycle) / duration;
};

/**
 * Calculates the next impact time based on current time and velocity
 * @param {number} currentImpactTime - The current impact time in ms
 * @param {number} velocity - The velocity in radians per second
 * @returns {number} - The next impact time in ms
 */
export const calculateNextImpactTime = (currentImpactTime, velocity) => {
  // Time to travel π radians (half a circle)
  return currentImpactTime + (Math.PI / velocity) * 1000;
};

/**
 * Determines opacity based on time since impact
 * @param {number} currentTime - The current time in ms
 * @param {number} lastImpactTime - The last impact time in ms
 * @param {number} baseOpacity - The base opacity
 * @param {number} maxOpacity - The maximum opacity
 * @param {number} duration - The duration for the fade in ms
 * @param {boolean} pulseEnabled - Whether the pulse effect is enabled
 * @returns {number} - The calculated opacity
 */
export const determineOpacity = (
  currentTime, 
  lastImpactTime, 
  baseOpacity, 
  maxOpacity, 
  duration, 
  pulseEnabled = true
) => {
  if (!pulseEnabled) return baseOpacity;
  
  const timeSinceImpact = currentTime - lastImpactTime;
  const percentage = Math.min(timeSinceImpact / duration, 1);
  const opacityDelta = maxOpacity - baseOpacity;
  
  return maxOpacity - (opacityDelta * percentage);
};

/**
 * Calculates position on an arc
 * @param {Object} center - The center point {x, y}
 * @param {number} radius - The radius
 * @param {number} angle - The angle in radians
 * @returns {Object} - The position {x, y}
 */
export const calculatePositionOnArc = (center, radius, angle) => ({
  x: center.x + radius * Math.cos(angle),
  y: center.y + radius * Math.sin(angle)
});

export default {
  calculateVelocity,
  calculateNextImpactTime,
  determineOpacity,
  calculatePositionOnArc
};