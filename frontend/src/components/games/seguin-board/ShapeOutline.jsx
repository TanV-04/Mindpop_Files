//frontend\src\components\games\seguin-board\ShapeOutline.jsx
import Shape from "./Shape";

const ShapeOutline = ({ shape, isPlaced }) => {
  const gridPosition = {
    gridColumn: shape.position.x + 1,
    gridRow: shape.position.y + 1,
  };

  return (
    <div 
      className="outline-container" 
      style={gridPosition}
    >
      <div
        className={`shape-outline ${isPlaced ? "shape-filled" : "shape-empty"}`}
        data-type={shape.type}
      >
        <div 
          className="flex items-center justify-center h-full w-full"
          style={{ padding: '0.5rem' }} /* Add internal padding */
        >
          <Shape type={shape.type} isOutline={!isPlaced} />
          
          {isPlaced && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                animation: 'placedPop 0.5s ease-out forwards',
              }}
            >
              <Shape type={shape.type} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes placedPop {
    0% { transform: scale(0.7); opacity: 0; }
    50% { transform: scale(1.1); }
    70% { transform: scale(0.95); }
    100% { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(style);

export default ShapeOutline;