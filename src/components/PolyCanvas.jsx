import React, { useRef, useEffect, useState } from 'react';
import { VISUAL_SETTINGS } from '../constants/settings';
import { drawArc, drawPointOnArc, drawCentralLine, createGradient } from '../utils/drawUtils';
import { determineOpacity, calculatePositionOnArc } from '../utils/mathUtils';
import { checkImpactPosition, updateArcAnimation } from '../utils/arcUtils';

/**
 * Canvas component that renders the polyrhythmic visualization
 */
const PolyCanvas = ({ 
  arcData, 
  soundEnabled, 
  playNote,
  startTime, 
  onSoundToggle,
  pulseEnabled = true,
  arcCount
}) => {
  const canvasRef = useRef(null);
  const lastArcCountRef = useRef(arcCount);
  const animationProgressRef = useRef(1); // 0 to 1, where 1 means animation complete
  const animationStartTimeRef = useRef(null);
  const previousSpacingRef = useRef(null);
  const targetSpacingRef = useRef(null);
  const animationDuration = 1500; // Longer animation (1.5 seconds) for smoother feel
  
  // Store old radii for each arc to smoothly animate from
  const oldRadiiRef = useRef([]);
  
  // When arc count changes, start an animation
  useEffect(() => {
    if (arcCount !== lastArcCountRef.current) {
      // Store the current state before animation starts
      if (canvasRef.current) {
        // Start animation
        animationStartTimeRef.current = new Date().getTime();
        animationProgressRef.current = 0;
        
        // Store the old arc count
        lastArcCountRef.current = arcCount;
      }
    }
  }, [arcCount]);
  
  // Main rendering effect
  useEffect(() => {
    if (!canvasRef.current || !arcData.current || arcData.current.length === 0) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let animationFrame;
    
    // Function to handle resizing
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    // Set initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Custom easing function for very smooth transitions
    // This is a combination of ease-in-out-sine and ease-out-elastic for a natural feel
    const customEasing = (t) => {
      // Start with sine easing
      let progress = -(Math.cos(Math.PI * t) - 1) / 2;
      
      // Add a tiny bit of elastic at the end for a natural finish
      if (t > 0.8) {
        const elastic = Math.pow(2, -10 * (t - 1)) * Math.sin((t - 0.9) * 5 * Math.PI) * 0.05;
        progress += elastic;
      }
      
      return progress;
    };
    
    // Main drawing function
    const draw = () => {
      // Clear the canvas on each frame to prevent trails
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentTime = new Date().getTime();
      const elapsedTime = (currentTime - startTime) / 1000;
      
      // Update resize animation progress if active
      if (animationProgressRef.current < 1 && animationStartTimeRef.current) {
        const animationElapsed = currentTime - animationStartTimeRef.current;
        
        // Calculate linear progress
        const linearProgress = Math.min(animationElapsed / animationDuration, 1);
        
        // Apply easing function for smooth motion
        animationProgressRef.current = customEasing(linearProgress);
        
        // If animation complete, clean up
        if (linearProgress >= 1) {
          animationProgressRef.current = 1;
          previousSpacingRef.current = null;
          oldRadiiRef.current = [];
        }
      }
      
      // Calculate dimensions
      const length = Math.min(canvas.width, canvas.height) * 0.9;
      
      // Define center point
      const center = {
        x: canvas.width / 2,
        y: canvas.height / 2
      };
      
      // Define base dimensions
      const base = {
        length: length,
        minAngle: 0,
        startAngle: 0,
        maxAngle: 2 * Math.PI
      };
      
      // Calculate measurements
      base.initialRadius = base.length * VISUAL_SETTINGS.initialRadiusRatio;
      base.circleRadius = base.length * VISUAL_SETTINGS.baseCircleRadiusRatio;
      base.clearance = base.length * VISUAL_SETTINGS.clearanceRatio;
      
      // Calculate target spacing based on current arc count
      const arcLength = arcData.current.length;
      const targetSpacing = (base.length - base.initialRadius - base.clearance) / 2 / arcLength;
      
      // Calculate all target radii
      const targetRadii = arcData.current.map((_, index) => 
        base.initialRadius + (targetSpacing * index)
      );
      
      // If we're starting a new animation, capture the current radii
      if (animationProgressRef.current === 0 && oldRadiiRef.current.length === 0) {
        // Calculate what the previous spacing would have been
        const previousArcCount = Math.max(arcLength - 1, 1);
        const previousSpacing = (base.length - base.initialRadius - base.clearance) / 2 / previousArcCount;
        
        // Store the old radii for smooth animation
        oldRadiiRef.current = arcData.current.map((_, index) => {
          if (index < arcLength - 1) {
            // Existing arcs use their previous radii
            return base.initialRadius + (previousSpacing * index);
          } else {
            // New arc starts at the position of the outer arc
            return base.initialRadius + (previousSpacing * (previousArcCount - 1));
          }
        });
      }
      
      // Draw central line (impact zone) with fixed length
      const impactLineLength = Math.min(canvas.width, canvas.height) * 0.7;
      drawCentralLine(
        context, 
        center, 
        impactLineLength, 
        VISUAL_SETTINGS.centralLineColorHex, 
        VISUAL_SETTINGS.centralLineOpacity,
        impactLineLength * 0.001
      );
      
      // Update and draw each arc
      arcData.current.forEach((arc, index) => {
        // Update animation state for this arc
        arc = updateArcAnimation(arc, currentTime);
        arcData.current[index] = arc; // Save updated animation state
        
        // Apply arc opacity (for animation)
        const baseOpacity = arc.opacity || 1;
        
        // Get the target radius for this arc
        const targetRadius = targetRadii[index];
        
        // Calculate actual radius with animation
        let radius;
        if (animationProgressRef.current < 1 && oldRadiiRef.current.length > index) {
          // During animation, interpolate between old and new radius
          const oldRadius = oldRadiiRef.current[index];
          radius = oldRadius + (targetRadius - oldRadius) * animationProgressRef.current;
        } else {
          radius = targetRadius;
        }
        
        // Draw arcs (the circles) - with animation opacity
        context.globalAlpha = baseOpacity * determineOpacity(
          currentTime, 
          arc.lastImpactTime, 
          0.15, 
          0.65, 
          1000, 
          pulseEnabled
        );
        context.lineWidth = base.length * 0.002;
        context.strokeStyle = arc.color;
        
        const arcOffset = base.circleRadius * (5 / 3) / radius;
        
        // Draw top half arc
        drawArc(context, center.x, center.y, radius, Math.PI + arcOffset, (2 * Math.PI) - arcOffset);
        
        // Draw bottom half arc
        drawArc(context, center.x, center.y, radius, arcOffset, Math.PI - arcOffset);
        
        // Draw impact points - with animation opacity
        context.globalAlpha = baseOpacity * determineOpacity(
          currentTime, 
          arc.lastImpactTime, 
          0.15, 
          0.85, 
          1000, 
          pulseEnabled
        );
        context.fillStyle = arc.color;
        
        // Left impact point
        drawPointOnArc(context, center, radius, base.circleRadius * 0.75, Math.PI);
        
        // Right impact point
        drawPointOnArc(context, center, radius, base.circleRadius * 0.75, 2 * Math.PI);
        
        // Draw moving circles - with animation opacity
        context.globalAlpha = baseOpacity;
        context.fillStyle = arc.color;
        
        // Calculate position
        const distance = elapsedTime >= 0 ? (elapsedTime * arc.velocity) : 0;
        const angle = (Math.PI + distance) % base.maxAngle;
        
        // Check for impact based on actual position (using angle)
        const { isAtImpact } = checkImpactPosition(angle, VISUAL_SETTINGS.impactThreshold);
        
        // Only trigger sound if the arc has fully appeared
        const shouldPlaySound = !arc.isAnimatingIn && baseOpacity > 0.9;
        
        // If we're at an impact point, play sound and create glow
        if (isAtImpact && currentTime - arc.lastImpactTime > 500) {
          if (soundEnabled && shouldPlaySound) {
            // Play the synthesized note
            playNote(index);
          }
          
          arc.lastImpactTime = currentTime;
          
          // Calculate the precise next impact time based on current position and velocity
          const halfCircleTime = (Math.PI / arc.velocity) * 1000; // Time to travel half circle
          arc.nextImpactTime = currentTime + halfCircleTime;
          
          // Get currently visible colors 
          const visibleColors = arcData.current
            .filter(a => a.opacity > 0.5)
            .map(a => a.color);
            
          // Set random complementary colors for gradient glow
          const colorIndex1 = Math.floor(Math.random() * visibleColors.length);
          let colorIndex2 = Math.floor(Math.random() * visibleColors.length);
          // Make sure we get different colors
          while (colorIndex2 === colorIndex1 && visibleColors.length > 1) {
            colorIndex2 = Math.floor(Math.random() * visibleColors.length);
          }
          
          arc.glowColor1 = visibleColors[colorIndex1];
          arc.glowColor2 = visibleColors[colorIndex2];
          arc.glowTime = currentTime;
          
          // Update the reference to persist between renders
          arcData.current[index] = arc;
        }
        
        // Draw the dot with glow effect if it recently impacted
        if (arc.glowTime && currentTime - arc.glowTime < 500) {
          const position = calculatePositionOnArc(center, radius, angle);
          const fadePercent = 1 - ((currentTime - arc.glowTime) / 500);
          
          // Create gradient for glow
          const gradient = createGradient(
            context,
            position.x, 
            position.y, 
            base.circleRadius * 5 * fadePercent,
            arc.glowColor1,
            arc.glowColor2
          );
          
          // Outer glow (larger, more transparent) - with animation opacity
          context.globalAlpha = baseOpacity * 0.3 * fadePercent;
          drawPointOnArc(
            context,
            center, 
            radius, 
            base.circleRadius * (3 + fadePercent * 2), 
            angle,
            {
              useGradient: true,
              gradient: gradient,
              useBlur: true,
              shadowBlur: 20,
              shadowColor: arc.glowColor1
            }
          );
          
          // Middle glow - with animation opacity
          context.globalAlpha = baseOpacity * 0.5 * fadePercent;
          drawPointOnArc(
            context,
            center, 
            radius, 
            base.circleRadius * (2 + fadePercent), 
            angle,
            {
              useGradient: true,
              gradient: gradient,
              useBlur: true,
              shadowBlur: 15,
              shadowColor: arc.glowColor1
            }
          );
          
          // Reset for actual dot - fully reset all drawing properties
          context.globalAlpha = baseOpacity;
          context.fillStyle = arc.color;
          context.shadowBlur = 0;
          context.shadowColor = 'transparent';
        }
        
        // Draw the main dot - with animation opacity
        drawPointOnArc(context, center, radius, base.circleRadius, angle);
      });
      
      // Continue animation
      animationFrame = requestAnimationFrame(draw);
    };
    
    // Start the animation
    animationFrame = requestAnimationFrame(draw);
    
    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [arcData, soundEnabled, playNote, startTime, pulseEnabled, arcCount]);

  return (
    <canvas 
      id="paper" 
      ref={canvasRef} 
      onClick={() => onSoundToggle()}
      style={{ width: '100%', height: '100%' }}
    ></canvas>
  );
};

export default PolyCanvas;