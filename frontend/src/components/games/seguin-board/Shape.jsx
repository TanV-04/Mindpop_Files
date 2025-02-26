import React from 'react';

const Shape = ({ type, isOutline = false }) => {
  // Colors for shapes - matching the physical puzzle colors with improved contrast and vibrancy
  const shapeColors = {
    cross: '#FF5252', // Brighter red
    triangle: '#FFD600', // Golden yellow
    semicircle: '#4CAF50', // Green
    circle: '#2196F3', // Blue
    rectangle: '#9C27B0', // Purple
    hexagon: '#FF9800', // Orange
    rhombus: '#00BCD4', // Cyan
    star: '#F44336', // Red
    oval: '#E91E63', // Pink
    square: '#FFEB3B', // Yellow
    pentagon: '#3F51B5', // Navy
    clover: '#66BB6A', // Lighter green for better visibility
  };

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
    default: '4px' // Slightly increased from 2px for smoother appearance
  };

  // Get shape color with fallback
  const color = shapeColors[type] || '#333333';
  
  // Get clip path if applicable
  const clipPath = clipPaths[type] || null;
  
  // Get border radius
  const borderRadius = borderRadii[type] || borderRadii.default;

  // Enhanced 3D styling for better physical appearance
  const style3d = isOutline 
    ? {} 
    : {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        border: '1px solid rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      };

  // Common styling for all shapes
  const shapeStyle = {
    background: isOutline ? 'rgba(0,0,0,0.08)' : color,
    width: '100%',
    height: '100%',
    borderRadius,
    ...(clipPath && { clipPath }),
    ...style3d
  };

  // Base class names with simplified structure
  const baseClass = `shape-${isOutline ? 'outline' : 'solid'}-piece w-full h-full flex items-center justify-center`;

  return (
    <div 
      className={baseClass}
      data-type={type}
      aria-label={`${type} shape`}
    >
      <div style={shapeStyle}></div>
    </div>
  );
};

export default Shape;