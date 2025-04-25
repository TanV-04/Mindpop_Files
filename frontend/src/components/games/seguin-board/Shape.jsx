//Shape.jsx

import React from 'react';

const Shape = ({ type, isOutline = false }) => {
  // Colors for shapes - all black as per your current setup
  const shapeColor = '#000000'; // Black for all shapes

  // Define shape clip paths in a centralized object for better maintainability
  const clipPaths = {
    cross: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)',
    triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    clover: 'path("M 50,0 A 30,30 0 0 1 100,50 A 30,30 0 0 1 50,100 A 30,30 0 0 1 0,50 A 30,30 0 0 1 50,0 z")'
  };

  // Define special border radius configurations
  const borderRadii = {
    circle: '50%',
    oval: '50%',
    semicircle: '100px 100px 0 0',
    default: '4px'
  };

  // Define exact dimensions for each shape to match the outlines perfectly
  const shapeDimensions = {
    rectangle: { width: '80px', height: '65px' },
    oval: { width: '80px', height: '70px' },
    circle: { width: '70px', height: '70px' },
    semicircle: { width: '70px', height: '40px' },
    cross: { width: '70px', height: '70px' },
    triangle: { width: '70px', height: '70px' },
    hexagon: { width: '70px', height: '70px' },
    rhombus: { width: '70px', height: '70px' },
    star: { width: '70px', height: '70px' },
    square: { width: '70px', height: '70px' },
    pentagon: { width: '70px', height: '70px' },
    clover: { width: '70px', height: '70px' },
  };
  
  // Get clip path if applicable
  const clipPath = clipPaths[type] || null;
  
  // Get border radius
  const borderRadius = borderRadii[type] || borderRadii.default;

  // Get dimensions for this shape type
  const dimensions = shapeDimensions[type] || { width: '70px', height: '70px' };

  // Common styling for all shapes
  const shapeStyle = {
    background: isOutline ? 'rgba(0,0,0,0.08)' : shapeColor,
    width: dimensions.width,
    height: dimensions.height,
    borderRadius,
    ...(clipPath && { clipPath }),
    boxShadow: isOutline ? 'none' : '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    border: isOutline ? '2px dashed rgba(0,0,0,0.3)' : '1px solid rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    // No background color for the container
    position: 'relative', 
    margin: 'auto'
  };

  return (
    <div 
      className={`shape-${isOutline ? 'outline' : 'solid'}-piece w-full h-full flex items-center justify-center`}
      data-type={type}
      aria-label={`${type} shape`}
      style={{ 
        // This container now has no background
        background: 'transparent',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={shapeStyle}></div>
    </div>
  );
};

export default Shape;