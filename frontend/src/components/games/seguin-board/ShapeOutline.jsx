//import React from 'react';
import Shape from './Shape';

const ShapeOutline = ({ shape, isPlaced }) => {
  // Calculate position based on grid layout
  const gridPosition = {
    gridColumn: shape.position.x + 1,
    gridRow: shape.position.y + 1,
  };

  return (
    <div 
      className={`outline-container flex items-center justify-center p-2
        ${isPlaced ? 'opacity-100' : 'opacity-100'}`}
      style={gridPosition}
    >
      <div 
        className={`
          shape-outline relative
          flex items-center justify-center
          ${isPlaced ? 'shape-filled' : 'shape-empty'}
        `}
        style={{
          width: shape.type === 'rectangle' || shape.type === 'oval' ? '110px' : '90px',
          height: shape.type === 'semicircle' ? '50px' : '90px',
        }}
        data-type={shape.type}
      >
        {/* Replace this section with the new code */}
        <div className="absolute inset-0 depression-cutout" style={{
          boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.5)',
          backgroundColor: '#d3b88b',
          borderRadius: '2px',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Exact shape outline with same dimensions as the pieces */}
          <div style={{
            width: getShapeWidth(shape.type),
            height: getShapeHeight(shape.type),
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            <Shape type={shape.type} isOutline={true} />
          </div>
        </div>
        
        {/* Show the filled shape when placed */}
        {isPlaced && (
          <div className="absolute inset-0 placed-shape animate-placed">
            <Shape type={shape.type} />
          </div>
        )}
      </div>
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

export default ShapeOutline;