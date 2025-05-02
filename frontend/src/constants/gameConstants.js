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
  
  export const performanceBenchmarks = {
    5: { excellent: 120, good: 180, average: 240 },    // 2-4 minutes
    6: { excellent: 110, good: 165, average: 220 },    // ~2-3.5 minutes 
    7: { excellent: 100, good: 150, average: 200 },    // ~1.7-3.3 minutes
    8: { excellent: 90, good: 135, average: 180 },     // 1.5-3 minutes
    9: { excellent: 85, good: 125, average: 170 },     // ~1.4-2.8 minutes
    10: { excellent: 80, good: 120, average: 160 },    // ~1.3-2.7 minutes
    11: { excellent: 75, good: 115, average: 150 },    // ~1.25-2.5 minutes
    12: { excellent: 70, good: 110, average: 140 }     // ~1.2-2.3 minutes
  };