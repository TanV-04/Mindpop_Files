import { useRef, useEffect } from 'react';
import Shape from './Shape';

const ShapeContainer = ({ shape, containerRef, onDragStart, isDragging }) => {
  const shapeRef = useRef(null);
  
  // Calculate position for shape within the shapes tray
  useEffect(() => {
    if (!shapeRef.current || !containerRef.current) return;
    
    if (!shape.initialPosition) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Fixed positions for all 10 shapes - ensure they all fit in the tray
      // Use a tight 2x5 grid layout
      const totalColumns = 5;
      const totalRows = 2;
      
      // Calculate available space in the container
      const availableWidth = containerRect.width - 20; // 10px padding on each side
      const availableHeight = containerRect.height - 40; // 20px padding on each side and room for header
      
      // Calculate cell size
      const cellWidth = availableWidth / totalColumns;
      const cellHeight = availableHeight / totalRows;
      
      // Determine position based on shape ID
      const shapeIndex = shape.id - 1; // Assuming 1-based IDs
      const row = Math.floor(shapeIndex / totalColumns);
      const col = shapeIndex % totalColumns;
      
      // Calculate position within cell (with padding)
      const x = (col * cellWidth) + (cellWidth / 2) + 10; // +10px for left padding
      const y = (row * cellHeight) + (cellHeight / 2) + 40; // +40px to account for header and padding
      
      // Set the initial position
      shape.initialPosition = { x, y };
    }
  }, [shape, containerRef]);

  // Current position (either initial or dragging position)
  const positionStyle = shape.dragPosition || shape.initialPosition;

  return (
    <div 
      ref={shapeRef}
      className={`shape-container absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab ${
        isDragging ? 'z-50 shadow-lg' : 'z-10'
      }`}
      style={{
        left: positionStyle ? `${positionStyle.x}px` : '50%',
        top: positionStyle ? `${positionStyle.y}px` : '50%',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        transform: isDragging ? 'translate(-50%, -50%) scale(1.05)' : 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: shape.isDragging ? 'none' : 'block', // Hide the original shape while dragging
        width: '60px',
        height: '60px',
        // 3D effect to make piece look raised from the board
        filter: 'drop-shadow(2px 4px 3px rgba(0,0,0,0.3))'
      }}
      onMouseDown={(e) => {
        // Calculate offset from center of shape
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Play pickup sound
        const pickupSound = document.getElementById('pickup-sound');
        if (pickupSound) {
          pickupSound.currentTime = 0;
          pickupSound.volume = 0.3;
          pickupSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Add a subtle lifting animation
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
        e.currentTarget.style.filter = 'drop-shadow(3px 6px 5px rgba(0,0,0,0.4))';
        
        // Pass the event with proper mouse positioning
        onDragStart({
          preventDefault: () => e.preventDefault(),
          clientX: e.clientX,
          clientY: e.clientY,
          currentTarget: shapeRef.current,
          shapeCenter: { x: centerX, y: centerY }
        }, shape);
      }}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent scrolling during touch
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Play pickup sound
        const pickupSound = document.getElementById('pickup-sound');
        if (pickupSound) {
          pickupSound.currentTime = 0;
          pickupSound.volume = 0.3;
          pickupSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Add a subtle lifting animation
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
        e.currentTarget.style.filter = 'drop-shadow(3px 6px 5px rgba(0,0,0,0.4))';
        
        onDragStart({
          preventDefault: () => e.preventDefault(),
          clientX: touch.clientX,
          clientY: touch.clientY,
          currentTarget: shapeRef.current,
          shapeCenter: { x: centerX, y: centerY }
        }, shape);
      }}
    >
      <Shape type={shape.type} />
    </div>
  );
};

export default ShapeContainer;
