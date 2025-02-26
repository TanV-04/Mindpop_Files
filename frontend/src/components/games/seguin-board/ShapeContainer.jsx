import { useRef, useEffect, useState } from 'react';
import Shape from './Shape';

const ShapeContainer = ({ shape, containerRef, onDragStart, isDragging }) => {
  const shapeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate position for shape within the shapes tray
  useEffect(() => {
    if (!shapeRef.current || !containerRef.current) return;
    
    if (!shape.initialPosition) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Responsive grid layout
      const totalColumns = 5;
      const totalRows = 2;
      
      // Calculate available space with better padding
      const availableWidth = containerRect.width - 40; // 20px padding on each side
      const availableHeight = containerRect.height - 60; // 30px padding on each side for header
      
      // Calculate cell size with spacing between items
      const cellWidth = availableWidth / totalColumns;
      const cellHeight = availableHeight / totalRows;
      
      // Determine position based on shape ID
      const shapeIndex = shape.id - 1; // Assuming 1-based IDs
      const row = Math.floor(shapeIndex / totalColumns);
      const col = shapeIndex % totalColumns;
      
      // Calculate position within cell (with padding for spacing)
      const x = (col * cellWidth) + (cellWidth / 2) + 20; // +20px for left padding
      const y = (row * cellHeight) + (cellHeight / 2) + 40; // +40px for header space
      
      // Set the initial position
      shape.initialPosition = { x, y };
    }
  }, [shape, containerRef]);

  // Handle interaction effects
  const handleDragStart = (e) => {
    // Calculate offset from center of shape
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Play pickup sound with fallback and error handling
    const pickupSound = document.getElementById('pickup-sound');
    if (pickupSound) {
      pickupSound.currentTime = 0;
      pickupSound.volume = 0.3;
      pickupSound.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Pass the event with proper mouse positioning
    onDragStart({
      preventDefault: () => e.preventDefault(),
      clientX: e.clientX,
      clientY: e.clientY,
      currentTarget: shapeRef.current,
      shapeCenter: { x: centerX, y: centerY }
    }, shape);
  };

  // Current position (either initial or dragging position)
  const positionStyle = shape.dragPosition || shape.initialPosition;

  return (
    <div 
      ref={shapeRef}
      className={`shape-container absolute transform -translate-x-1/2 -translate-y-1/2 ${
        isDragging ? 'z-50' : isHovered ? 'z-20' : 'z-10'
      }`}
      style={{
        left: positionStyle ? `${positionStyle.x}px` : '50%',
        top: positionStyle ? `${positionStyle.y}px` : '50%',
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        transform: `translate(-50%, -50%) scale(${isDragging ? 1.1 : isHovered ? 1.05 : 1})`,
        cursor: isDragging ? 'grabbing' : 'grab',
        display: shape.isDragging ? 'none' : 'block',
        width: '64px',
        height: '64px',
        filter: isDragging 
          ? 'drop-shadow(4px 8px 8px rgba(0,0,0,0.4))' 
          : isHovered 
            ? 'drop-shadow(3px 6px 6px rgba(0,0,0,0.3))' 
            : 'drop-shadow(2px 4px 4px rgba(0,0,0,0.2))'
      }}
      onMouseDown={handleDragStart}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent scrolling during touch
        const touch = e.touches[0];
        handleDragStart({
          ...e,
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Shape type={shape.type} />
        
        {/* Optional highlight effect on hover */}
        {isHovered && !isDragging && (
          <div 
            className="absolute inset-0 rounded-md opacity-30" 
            style={{ 
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
              animation: 'pulse 1.5s infinite'
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default ShapeContainer;