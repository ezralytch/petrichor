// Color palette with soothing variations
export const colorPalette = [
  "#66b2b2", // Sea foam teal
  "#9b59b6", // Amethyst purple
  "#3498db", // Bright blue
  "#1abc9c", // Medium spring green
  "#e74c3c", // Soft crimson
  "#f39c12", // Amber
  "#8e44ad", // Deep purple
  "#16a085", // Deep teal
  "#d35400", // Burnt orange
  "#2980b9", // Strong blue
  "#2c3e50", // Dark slate
  "#27ae60", // Nephritis green
  "#c0392b", // Dark red
  "#7d3c98", // Royal purple
  "#2574a9"  // Steel blue
];

// Generate a color array for a given maximum number of arcs
export const generateColorArray = (maxArcs) => {
  return Array(maxArcs).fill(null).map((_, i) => 
    colorPalette[i % colorPalette.length]
  );
};

export default {
  colorPalette,
  generateColorArray
};