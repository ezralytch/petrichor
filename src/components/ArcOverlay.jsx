import React, { useEffect, useState, useRef } from 'react';

// CSS styles for smooth transitions
const overlayStyles = `
.arc-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}

.arc {
  fill: none;
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

const ArcOverlay = ({ arcCount, maxArcs, colors }) => {
  const [prevCount, setPrevCount] = useState(arcCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const svgRef = useRef(null);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Detect arc count changes and trigger animation
  useEffect(() => {
    if (arcCount !== prevCount) {
      setIsAnimating(true);
      
      // Set a timer to remove the overlay after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevCount(arcCount);
      }, 1600); // Slightly longer than the CSS transition
      
      return () => clearTimeout(timer);
    }
  }, [arcCount, prevCount]);

  // If not animating, don't render anything
  if (!isAnimating) {
    return null;
  }
  
  // Calculate arc dimensions
  const circleSize = Math.min(dimensions.width, dimensions.height) * 0.9;
  const center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2
  };
  
  // Calculate base values for arcs
  const baseRadius = circleSize * 0.05; // Same as initialRadius in your original code
  const spacing = (circleSize - baseRadius - circleSize * 0.03) / 2 / arcCount;
  const oldSpacing = (circleSize - baseRadius - circleSize * 0.03) / 2 / prevCount;
  
  // Limit colors to current arc count
  const usedColors = colors ? colors.slice(0, Math.max(arcCount, prevCount)) : [];
  
  // Generate arcs based on previous and current count
  const arcs = usedColors.map((color, index) => {
    // Only render up to the max of previous and current count
    if (index >= Math.max(arcCount, prevCount)) {
      return null;
    }
    
    // Calculate starting radius (from previous configuration)
    const startRadius = index < prevCount 
      ? baseRadius + (oldSpacing * index)
      : baseRadius + (oldSpacing * (prevCount - 1)); // New arcs start at the previous max
    
    // Calculate target radius (for new configuration)
    const targetRadius = index < arcCount
      ? baseRadius + (spacing * index)
      : 0; // Arcs that are being removed shrink to 0
    
    // For arcs just appearing or disappearing
    const startOpacity = index < prevCount ? 1 : 0;
    const targetOpacity = index < arcCount ? 1 : 0;
    
    return (
      <g key={`arc-${index}`}>
        <circle 
          className="arc"
          cx={center.x}
          cy={center.y}
          r={startRadius}
          stroke={color}
          strokeWidth={2}
          style={{
            opacity: startOpacity,
            transform: `scale(1)`,
            transformOrigin: `${center.x}px ${center.y}px`
          }}
          // Trigger animation after a small delay to ensure the initial state is rendered
          data-target-radius={targetRadius}
          data-target-opacity={targetOpacity}
          onTransitionEnd={(e) => {
            if (e.propertyName === 'transform' && index === usedColors.length - 1) {
              setIsAnimating(false);
              setPrevCount(arcCount);
            }
          }}
          ref={el => {
            if (el) {
              // Use a timeout to ensure the initial state is applied before animation
              setTimeout(() => {
                const scale = targetRadius / startRadius || 0;
                el.style.opacity = targetOpacity;
                el.style.transform = `scale(${scale || 0})`;
              }, 50);
            }
          }}
        />
      </g>
    );
  });

  return (
    <>
      <style>{overlayStyles}</style>
      <div className="arc-overlay">
        <svg 
          ref={svgRef}
          width={dimensions.width} 
          height={dimensions.height}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {arcs}
        </svg>
      </div>
    </>
  );
};

export default ArcOverlay;