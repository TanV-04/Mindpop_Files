import { useState, useEffect, useRef } from 'react';
import { shapes } from '../../../constants/gameConstants';
import ShapeContainer from './ShapeContainer';
import ShapeOutline from './ShapeOutline';
import PlacementFeedback from './PlacementFeedback';
import Shape from './Shape';

const Board = ({ onComplete }) => {
  const [availableShapes, setAvailableShapes] = useState([]);
  const [boardShapes, setBoardShapes] = useState([]);
  const [placedShapes, setPlacedShapes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeShape, setActiveShape] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [feedbackState, setFeedbackState] = useState({
    isVisible: false, 
    position: null
  });
  const boardRef = useRef(null);
  const shapesContainerRef = useRef(null);

  // Initialize the game with all 10 shapes
  useEffect(() => {
    console.log("INITIALIZING GAME WITH ALL 10 SHAPES");
    
    // Always use all 10 shapes
    const gameShapes = [...shapes];
    
    // Initialize with all 10 shapes in tray
    setAvailableShapes(gameShapes.map(shape => ({
      ...shape,
      isDragging: false,
      dragPosition: null
    })));
    
    // Set board shapes (all 10)
    setBoardShapes(gameShapes);
    
    // Reset placed shapes
    setPlacedShapes([]);
    
    console.log(`Game initialized with ${gameShapes.length} shapes - SHOULD BE 10`);
  }, []);

  // LAST-RESORT FIX: Separate useEffect specifically for checking completion
  useEffect(() => {
    // We need exactly 10 shapes placed to complete
    if (placedShapes.length === 10) {
      console.log("⭐⭐⭐ COMPLETION CRITERIA MET: ALL 10 SHAPES PLACED ⭐⭐⭐");
      
      // Safety delay to ensure UI updates first
      setTimeout(() => {
        console.log("Calling onComplete after all 10 shapes placed");
        onComplete();
      }, 1000);
    } else {
      console.log(`Progress update: ${placedShapes.length}/10 shapes placed`);
    }
  }, [placedShapes.length, onComplete]);

  const handleDragStart = (e, shape) => {
    e.preventDefault();
    
    if (!boardRef.current) return;
    
    // Get the center of the shape
    // const shapeCenter = e.shapeCenter || {
    //   x: e.clientX,
    //   y: e.clientY
    // };
    
    // Update shape's dragPosition to match cursor
    setDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    setActiveShape(shape);
    setIsDragging(true);
    
    // Play pickup sound
    const pickupSound = document.getElementById('pickup-sound');
    if (pickupSound) {
      pickupSound.currentTime = 0;
      pickupSound.volume = 0.3;
      pickupSound.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Mark the shape as being dragged
    setAvailableShapes(prevShapes => 
      prevShapes.map(s => 
        s.id === shape.id 
          ? { ...s, isDragging: true } 
          : s
      )
    );
    
    console.log(`Started dragging shape ${shape.type}`);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !activeShape || !boardRef.current) return;
    
    // Update the drag position to follow the cursor
    setDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    // Update the shape's position (but don't render it twice - rendering happens in a dedicated div)
    setAvailableShapes(prevShapes => 
      prevShapes.map(shape => 
        shape.id === activeShape.id 
          ? { 
              ...shape, 
              dragPosition: {
                x: e.clientX - boardRef.current.getBoundingClientRect().left,
                y: e.clientY - boardRef.current.getBoundingClientRect().top
              },
              isDragging: true // Mark as being dragged so we don't render it in the tray
            } 
          : shape
      )
    );
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !activeShape || !boardRef.current) return;

    // Get current board dimensions
    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Check if cursor is over the board
    const isOverBoard = 
      e.clientX >= boardRect.left && 
      e.clientX <= boardRect.right && 
      e.clientY >= boardRect.top && 
      e.clientY <= boardRect.bottom;
    
    if (!isOverBoard) {
      // Return shape to tray if dropped outside board
      setAvailableShapes(prevShapes => 
        prevShapes.map(shape => 
          shape.id === activeShape.id 
            ? { ...shape, dragPosition: null, isDragging: false } 
            : shape
        )
      );
      setIsDragging(false);
      setActiveShape(null);
      return;
    }
    
    // Check if shape is over its matching outline
    const outlineElements = document.querySelectorAll('.shape-outline');
    let foundMatch = false;
    
    outlineElements.forEach(outline => {
      if (foundMatch) return; // Skip if already found a match
      
      // Skip already placed outlines
      if (outline.classList.contains('shape-filled')) return;
      
      const outlineRect = outline.getBoundingClientRect();
      const outlineType = outline.dataset.type;
      
      // Check if shape type matches outline type
      if (activeShape.type === outlineType) {
        // Check if cursor is over this outline
        const isOverOutline = 
          e.clientX >= outlineRect.left && 
          e.clientX <= outlineRect.right && 
          e.clientY >= outlineRect.top && 
          e.clientY <= outlineRect.bottom;
        
        if (isOverOutline) {
          console.log(`Shape ${activeShape.type} placed correctly`);
          
          // Add shape to placed shapes
          const newPlacedShapes = [...placedShapes, activeShape.id];
          setPlacedShapes(newPlacedShapes);
          
          console.log(`PLACED SHAPES COUNT: ${newPlacedShapes.length}/10`);
          
          // Remove shape from available shapes
          setAvailableShapes(prev => 
            prev.filter(shape => shape.id !== activeShape.id)
          );
          
          foundMatch = true;
          
          // Show success feedback
          setFeedbackState({
            isVisible: true,
            position: {
              x: outlineRect.left + (outlineRect.width / 2) - boardRect.left,
              y: outlineRect.top + (outlineRect.height / 2) - boardRect.top
            }
          });
          
          // Play success sound
          const successSound = document.getElementById('success-sound');
          if (successSound) {
            successSound.currentTime = 0;
            successSound.play().catch(e => console.log('Audio play failed:', e));
          }
          
          // Reset feedback after animation
          setTimeout(() => {
            setFeedbackState({ isVisible: false, position: null });
          }, 1000);
          
          // Check if all 10 shapes are placed
          if (newPlacedShapes.length === 10) {
            console.log("✅ ALL 10 SHAPES PLACED - GAME COMPLETE!");
            setTimeout(() => {
              onComplete();
            }, 1000);
          }
        }
      }
    });
    
    if (!foundMatch) {
      console.log(`Shape ${activeShape.type} returned to tray`);
      
      // Reset the shape position back to its original spot in the tray
      setAvailableShapes(prevShapes => 
        prevShapes.map(shape => 
          shape.id === activeShape.id 
            ? { ...shape, dragPosition: null, isDragging: false } 
            : shape
        )
      );
    }
    
    // Reset dragging state
    setIsDragging(false);
    setActiveShape(null);
  };

  return (
    <div className="game-board-container max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Shapes tray - styled like a wooden tray */}
        <div 
          ref={shapesContainerRef}
          className="shapes-tray relative border-4 rounded-lg p-4 md:w-1/3 h-64 md:h-[450px] overflow-visible shadow-lg"
          style={{
            backgroundColor: '#f5e6c8', // Lighter wood color for tray
            borderColor: '#9e6240', // Medium brown for border
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.15)'
          }}
        >
          <h3 className="text-lg font-bold text-[#66220B] mb-4 text-center">Shapes</h3>
          
          {/* Wood grain texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10" 
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
              borderRadius: '0.5rem',
              mixBlendMode: 'multiply'
            }}>
          </div>
          
          {/* Draggable shapes */}
          <div className="draggable-shapes-container relative h-full">
            {availableShapes.map(shape => (
              <ShapeContainer
                key={shape.id}
                shape={shape}
                containerRef={shapesContainerRef}
                onDragStart={handleDragStart}
                isDragging={isDragging && activeShape?.id === shape.id}
              />
            ))}
            
            {/* Empty state when all shapes are placed */}
            {availableShapes.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-green-600 text-center font-bold">
                  All shapes placed!<br />Great job!
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Board container - styled like a wooden board */}
        <div 
          ref={boardRef}
          className="board-container relative w-full md:w-2/3 rounded-lg p-4 mb-8 shadow-lg"
          style={{ 
            height: '450px',
            touchAction: 'none',
            overflow: 'hidden',
            backgroundColor: '#e0c097', // Woody board color
            borderColor: '#9e6240', // Medium brown for border
            borderWidth: '8px',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.15)'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleMouseMove({
              clientX: touch.clientX,
              clientY: touch.clientY
            });
          }}
          onTouchEnd={handleMouseUp}
        >
          {/* Hidden audio elements for game sounds */}
          <audio id="success-sound" preload="auto" src="https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3"></audio>
          <audio id="pickup-sound" preload="auto" src="https://cdn.freesound.org/previews/47/47252_394625-lq.mp3"></audio>
        
          {/* Wood grain texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10" 
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
              borderRadius: '0.5rem',
              mixBlendMode: 'multiply'
            }}>
          </div>
          
          {/* Currently dragged shape (rendered above everything else) */}
          {isDragging && activeShape && (
            <div 
              className="absolute z-50 pointer-events-none"
              style={{
                top: dragPosition.y - boardRef.current.getBoundingClientRect().top,
                left: dragPosition.x - boardRef.current.getBoundingClientRect().left,
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                filter: 'drop-shadow(2px 5px 4px rgba(0,0,0,0.3))'
              }}
            >
              <Shape type={activeShape.type} />
            </div>
          )}
          
          {/* Feedback component for successful placements */}
          <PlacementFeedback 
            isVisible={feedbackState.isVisible} 
            position={feedbackState.position} 
          />
          
          {/* Shape outlines on the board */}
          <div className="outlines-container grid grid-cols-4 grid-rows-3 gap-1 h-full">
            {boardShapes.map(shape => (
              <ShapeOutline 
                key={shape.id}
                shape={shape}
                isPlaced={placedShapes.includes(shape.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;