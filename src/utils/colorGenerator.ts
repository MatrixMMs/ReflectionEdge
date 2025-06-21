// Basic colors that are visually distinct and easy to differentiate
const BASE_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
  '#800000', // Maroon
  '#008080', // Teal
  '#000080', // Navy
];

// Keep track of used colors to avoid duplicates
let usedColors = new Set<string>();

export const getRandomColor = (): string => {
  // If all colors have been used, reset the used colors set
  if (usedColors.size >= BASE_COLORS.length) {
    usedColors.clear();
  }

  // Filter out already used colors
  const availableColors = BASE_COLORS.filter(color => !usedColors.has(color));
  
  // Get a random color from available colors
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const selectedColor = availableColors[randomIndex];
  
  // Mark the color as used
  usedColors.add(selectedColor);
  
  return selectedColor;
};

// Reset the used colors (useful when clearing all tags)
export const resetColorUsage = (): void => {
  usedColors.clear();
}; 