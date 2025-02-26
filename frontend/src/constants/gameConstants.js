// constants/gameConstants.js
export const shapes = [
    { id: 1, type: 'cross', position: { x: 0, y: 0 } },
    { id: 2, type: 'triangle', position: { x: 1, y: 0 } },
    { id: 3, type: 'semicircle', position: { x: 2, y: 0 } },
    { id: 4, type: 'circle', position: { x: 3, y: 0 } },
    { id: 5, type: 'rectangle', position: { x: 0, y: 1 } },
    { id: 6, type: 'hexagon', position: { x: 1, y: 1 } },
    { id: 7, type: 'rhombus', position: { x: 2, y: 1 } },
    { id: 8, type: 'star', position: { x: 3, y: 1 } },
    { id: 9, type: 'oval', position: { x: 0, y: 2 } },
    { id: 10, type: 'square', position: { x: 1, y: 2 } }
  ];
  
  // Difficulty settings
  export const difficultySettings = {
    easy: {
      snapDistance: 5, // Very small snap distance even for young children
      shapeMovementSpeed: 'slow'
    },
    normal: {
      snapDistance: 0, // No snap assistance
      shapeMovementSpeed: 'medium'
    },
    hard: {
      snapDistance: 0, // No snap assistance
      shapeMovementSpeed: 'fast'
    }
  };
  
  // Performance benchmarks by age (in seconds)
  export const performanceBenchmarks = {
    5: { excellent: 60, good: 90, average: 120 },
    6: { excellent: 50, good: 80, average: 110 },
    7: { excellent: 45, good: 70, average: 100 },
    8: { excellent: 40, good: 65, average: 90 },
    9: { excellent: 35, good: 60, average: 85 },
    10: { excellent: 30, good: 55, average: 80 },
    11: { excellent: 25, good: 50, average: 75 },
    12: { excellent: 20, good: 45, average: 70 }
  };