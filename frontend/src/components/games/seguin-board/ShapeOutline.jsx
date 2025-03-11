import React from 'react';
import Shape from './Shape';

const ShapeOutline = ({ shape, isPlaced }) => {
  // Calculate position based on grid layout
  const gridPosition = {
    gridColumn: shape.position.x + 1,
    gridRow: shape.position.y + 1,
  };

  // Determine outline styles based on shape type
  const getOutlineStyle = (type) => {
    // Base styles that apply to all shape types
    const baseStyle = {
      boxShadow: isPlaced 
        ? 'inset 0 2px 5px rgba(0, 0, 0, 0.2)'
        : 'inset 0 3px 8px rgba(0, 0, 0, 0.4), inset 0 -1px 3px rgba(255, 255, 255, 0.2)',
      backgroundColor: isPlaced ? '#c9a97a' : '#d3b88b',
      transition: 'all 0.3s ease-out',
    };
    
    // Additional shape-specific styles
    switch(type) {
      case 'rectangle':
        return { 
          ...baseStyle,
          borderRadius: '4px',
        };
      case 'oval':
        return { 
          ...baseStyle,
          borderRadius: '50%',
        };
      case 'semicircle':
        return { 
          ...baseStyle,
          borderRadius: '4px',
        };
      case 'triangle':
        return { 
          ...baseStyle,
          borderRadius: '4px',
        };
      case 'cross':
        return { 
          ...baseStyle,
          borderRadius: '4px',
        };
      default:
        return { 
          ...baseStyle,
          borderRadius: '4px',
        };
    }
  };

  // Animation class for when shapes are placed
  const placedAnimationClass = isPlaced ? 'animate-placed' : '';
  
  // Highlight effect class
  const highlightClass = !isPlaced ? 'outline-highlight' : '';

  return (
    <div 
      className={`outline-container relative flex items-center justify-center p-2
        ${isPlaced ? 'placed' : 'empty'}`}
      style={gridPosition}
    >
      <div 
        className={`
          shape-outline relative
          flex items-center justify-center
          ${isPlaced ? 'shape-filled' : 'shape-empty'}
          ${placedAnimationClass}
          transition-all duration-300 ease-out
        `}
        style={{
          width: shape.type === 'rectangle' || shape.type === 'oval' ? '110px' : '90px',
          height: shape.type === 'semicircle' ? '50px' : '90px',
        }}
        data-type={shape.type}
      >
        {/* Wooden depression with grain texture */}
        <div 
          className="absolute inset-0 depression-cutout overflow-hidden" 
          style={{
            ...getOutlineStyle(shape.type),
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Wood grain texture for the depression */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20" 
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
              backgroundSize: '150px',
              mixBlendMode: 'multiply',
            }}
          />
          
          {/* Inner shadow overlay for depth */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
              borderRadius: 'inherit',
            }}
          />
          
          {/* Subtle highlight around the edge for empty outlines */}
          {!isPlaced && (
            <div 
              className={`absolute inset-1 pointer-events-none ${highlightClass}`}
              style={{
                borderRadius: 'inherit',
                border: '3px dashed rgba(0, 0, 0, 0.8)',
                opacity: 0.6,
              }}
            />
          )}

          {/* Exact shape outline with same dimensions as the pieces */}
          <div 
            className="shape-outline-inner"
            style={{
              width: getShapeWidth(shape.type),
              height: getShapeHeight(shape.type),
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Shape 
              type={shape.type} 
              isOutline={true} 
              style={{
                opacity: isPlaced ? 0.3 : 0.7,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>
        
        {/* Show the filled shape when placed with nice animation */}
        {isPlaced && (
          <div 
            className="absolute inset-0 placed-shape flex items-center justify-center"
            style={{
              animation: 'placed-pop 0.5s ease-out forwards',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: getShapeWidth(shape.type),
                height: getShapeHeight(shape.type),
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
              }}
            >
              <Shape type={shape.type} />
            </div>
          </div>
        )}
      </div>
      
      {/* Small label for debugging/accessibility (optional) */}
      {false && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 opacity-40 pointer-events-none">
          {shape.type}
        </div>
      )}
    </div>
  );
};

// Helper functions to get correct dimensions for each shape
function getShapeWidth(type) {
  switch(type) {
    case 'rectangle':
      return '80px'; // Exact size
    case 'oval':
      return '80px'; // Exact size
    case 'cross':
    case 'clover':
      return '70px'; // Exact size
    default:
      return '70px'; // Exact size for all other shapes
  }
}

function getShapeHeight(type) {
  switch(type) {
    case 'semicircle':
      return '40px'; // Exact half-height
    case 'rectangle':
      return '65px'; // Exact size
    default:
      return '70px'; // Exact size for all other shapes
  }
}

// Add global styles for animations
const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes placed-pop {
      0% { transform: scale(0.7); opacity: 0; }
      50% { transform: scale(1.1); }
      70% { transform: scale(0.95); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .animate-placed {
      animation: placed-pop 0.5s ease-out forwards;
    }
    
    .outline-highlight {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 0.3; }
      50% { opacity: 0.7; }
      100% { opacity: 0.3; }
    }
    
    .shape-filled {
      transform: scale(1);
    }
    
    .shape-empty:hover {
      transform: scale(1.03);
    }
  `}</style>
);

const ShapeOutlineWithStyles = (props) => (
  <>
    <GlobalStyles />
    <ShapeOutline {...props} />
  </>
);

export default ShapeOutlineWithStyles;