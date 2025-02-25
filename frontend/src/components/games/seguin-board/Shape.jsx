

const Shape = ({ type, isOutline = false }) => {
  // Colors for shapes - matching the physical puzzle colors
  const shapeColors = {
    cross: '#FF6B6B', // Pink/red
    triangle: '#FFD700', // Yellow
    semicircle: '#4CAF50', // Green
    circle: '#2196F3', // Blue
    rectangle: '#9C27B0', // Purple
    hexagon: '#FF9800', // Orange
    rhombus: '#00BCD4', // Cyan
    star: '#FF0000', // Red
    oval: '#E91E63', // Pink
    square: '#FFEB3B', // Yellow
    pentagon: '#3F51B5', // Navy
    clover: '#4CAF50', // Green
  };
  
  // Define the color based on type
  const color = shapeColors[type] || '#333333';
  
  // Base styles for all shapes
  const baseClass = `
    ${isOutline 
      ? 'shape-outline-piece' 
      : 'shape-piece'}
    w-full h-full
  `;

  // 3D effect styles for physical look
  const style3d = isOutline 
    ? {} 
    : {
        boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,0,0,0.2)'
      };

  // Define the shape based on type
  switch (type) {
    case 'cross':
      return (
        <div 
          className={`${baseClass} relative`}
          data-type={type}
        >
          {isOutline ? (
            // Outline/depression version
            <div className="absolute inset-0" style={{
              background: isOutline ? 'rgba(0,0,0,0.1)' : color,
              clipPath: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)',
              borderRadius: '2px',
              ...style3d
            }}></div>
          ) : (
            // Solid version
            <div style={{ 
              background: color,
              width: '100%',
              height: '100%',
              clipPath: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)',
              borderRadius: '2px',
              ...style3d
            }}></div>
          )}
        </div>
      );
    
    case 'triangle':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'semicircle':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '100px 100px 0 0',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'circle':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'rectangle':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'hexagon':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'rhombus':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'star':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'oval':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            ...style3d
          }}></div>
        </div>
      );
    
    case 'square':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
      
    case 'pentagon':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
      
    // Add clover shape like in physical board  
    case 'clover':
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            clipPath: 'path("M 50,0 A 30,30 0 0 1 100,50 A 30,30 0 0 1 50,100 A 30,30 0 0 1 0,50 A 30,30 0 0 1 50,0 z")',
            ...style3d
          }}></div>
        </div>
      );
    
    default:
      return (
        <div 
          className={`${baseClass} flex items-center justify-center`}
          data-type={type}
        >
          <div style={{ 
            background: isOutline ? 'rgba(0,0,0,0.1)' : color,
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            ...style3d
          }}></div>
        </div>
      );
  }
};

export default Shape;