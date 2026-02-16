//frontend\src\components\games\seguin-board\Shape.jsx
const Shape = ({ type, isOutline = false }) => {
  const shapeDimensions = {
    rectangle: { width: '70px', height: '55px' },
    oval: { width: '70px', height: '55px' },
    circle: { width: '65px', height: '65px' },
    semicircle: { width: '65px', height: '40px' },
    cross: { width: '65px', height: '65px' },
    triangle: { width: '65px', height: '65px' },
    hexagon: { width: '65px', height: '65px' },
    rhombus: { width: '65px', height: '65px' },
    star: { width: '65px', height: '65px' },
    square: { width: '65px', height: '65px' },
    pentagon: { width: '65px', height: '65px' },
  };

  const clipPaths = {
    cross: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)',
    triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  };

  const borderRadii = {
    circle: '50%',
    oval: '50%',
    semicircle: '100px 100px 0 0',
    default: '8px',
  };

  const dimensions = shapeDimensions[type] || { width: '65px', height: '65px' };
  const clipPath = clipPaths[type] || null;
  const borderRadius = borderRadii[type] || borderRadii.default;

  // 3D Block styling
  const blockStyle = {
    width: dimensions.width,
    height: dimensions.height,
    background: isOutline 
      ? 'rgba(102, 34, 11, 0.1)' 
      : 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #2C3E50 100%)',
    borderRadius,
    ...(clipPath && { clipPath }),
    boxShadow: isOutline 
      ? 'none'
      : `
          0 8px 16px rgba(0, 0, 0, 0.4),
          inset 0 2px 4px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3)
        `,
    border: isOutline ? '2px dashed rgba(102, 34, 11, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)',
    position: 'relative',
    margin: '0 auto', /* Center the shape */
  };

  // Add highlight for 3D effect
  const highlightStyle = !isOutline ? {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    height: '30%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
    borderRadius: 'inherit',
    clipPath: 'inherit',
    pointerEvents: 'none',
  } : null;

  return (
    <div className="shape-piece" style={blockStyle}>
      {highlightStyle && <div style={highlightStyle}></div>}
    </div>
  );
};

export default Shape;