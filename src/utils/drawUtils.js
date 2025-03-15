import { calculatePositionOnArc } from './mathUtils';

/**
 * Creates a radial gradient with two colors
 * @param {CanvasRenderingContext2D} context - The canvas context
 * @param {number} centerX - The x-coordinate of the center
 * @param {number} centerY - The y-coordinate of the center
 * @param {number} radius - The radius of the gradient
 * @param {string} color1 - The inner color
 * @param {string} color2 - The outer color
 * @returns {CanvasGradient} - The gradient object
 */
export const createGradient = (context, centerX, centerY, radius, color1, color2) => {
  const gradient = context.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius * 2
  );
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

/**
 * Draws an arc
 * @param {CanvasRenderingContext2D} context - The canvas context
 * @param {number} x - The x-coordinate of the center
 * @param {number} y - The y-coordinate of the center
 * @param {number} radius - The radius of the arc
 * @param {number} start - The starting angle in radians
 * @param {number} end - The ending angle in radians
 * @param {string} action - "stroke" or "fill"
 */
export const drawArc = (context, x, y, radius, start, end, action = "stroke") => {
  context.beginPath();
  context.arc(x, y, radius, start, end);
  if (action === "stroke") context.stroke();
  else context.fill();
};

/**
 * Draws a point on an arc with optional gradient and blur
 * @param {CanvasRenderingContext2D} context - The canvas context
 * @param {Object} center - The center point {x, y}
 * @param {number} arcRadius - The radius of the arc
 * @param {number} pointRadius - The radius of the point
 * @param {number} angle - The angle in radians
 * @param {Object} options - Optional drawing options
 */
export const drawPointOnArc = (context, center, arcRadius, pointRadius, angle, options = {}) => {
  const position = calculatePositionOnArc(center, arcRadius, angle);
  
  if (options.useGradient && options.gradient) {
    context.fillStyle = options.gradient;
  }
  
  if (options.useBlur) {
    context.shadowColor = options.shadowColor || 'rgba(77, 208, 225, 0.8)';
    context.shadowBlur = options.shadowBlur || 15;
  }
  
  drawArc(context, position.x, position.y, pointRadius, 0, 2 * Math.PI, "fill");
  
  // Reset shadow after drawing if we used blur
  if (options.useBlur) {
    context.shadowBlur = 0;
  }
};

/**
 * Draws a central line (impact zone)
 * @param {CanvasRenderingContext2D} context - The canvas context
 * @param {Object} center - The center point {x, y}
 * @param {number} length - The length of the line
 * @param {string} color - The color of the line
 * @param {number} opacity - The opacity of the line
 * @param {number} lineWidth - The width of the line
 */
export const drawCentralLine = (context, center, length, color, opacity, lineWidth) => {
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.beginPath();
  context.moveTo(center.x - length/2, center.y);
  context.lineTo(center.x + length/2, center.y);
  context.stroke();
};

export default {
  createGradient,
  drawArc,
  drawPointOnArc,
  drawCentralLine
};