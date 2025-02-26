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
  const [gameComplete, setGameComplete] = useState(false);
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
    setGameComplete(false);
    
    console.log(`Game initialized with ${gameShapes.length} shapes - SHOULD BE 10`);
  }, []);

  // Check for game completion
  useEffect(() => {
    // We need exactly 10 shapes placed to complete
    if (placedShapes.length === 10 && !gameComplete) {
      console.log("⭐⭐⭐ COMPLETION CRITERIA MET: ALL 10 SHAPES PLACED ⭐⭐⭐");
      
      setGameComplete(true);
      
      // Add confetti effect
      showCompletionConfetti();
      
      // Safety delay to ensure UI updates first
      setTimeout(() => {
        console.log("Calling onComplete after all 10 shapes placed");
        onComplete();
      }, 1500);
    } else {
      console.log(`Progress update: ${placedShapes.length}/10 shapes placed`);
    }
  }, [placedShapes.length, onComplete, gameComplete]);

  const showCompletionConfetti = () => {
    // This function would be implemented with a confetti library
    // For now we'll just log it
    console.log("Showing completion confetti!");
  };

  const handleDragStart = (e, shape) => {
    e.preventDefault();
    
    if (!boardRef.current) return;
    
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
    
    // Add subtle scaling animation to dragged shape
    document.documentElement.style.setProperty('--scale-drag', '1.05');
    
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
    
    // Update the shape's position
    setAvailableShapes(prevShapes => 
      prevShapes.map(shape => 
        shape.id === activeShape.id 
          ? { 
              ...shape, 
              dragPosition: {
                x: e.clientX - boardRef.current.getBoundingClientRect().left,
                y: e.clientY - boardRef.current.getBoundingClientRect().top
              },
              isDragging: true
            } 
          : shape
      )
    );
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !activeShape || !boardRef.current) return;

    // Reset scaling animation
    document.documentElement.style.setProperty('--scale-drag', '1');

    // Get current board dimensions
    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Check if cursor is over the board
    const isOverBoard = 
      e.clientX >= boardRect.left && 
      e.clientX <= boardRect.right && 
      e.clientY >= boardRect.top && 
      e.clientY <= boardRect.bottom;
    
    if (!isOverBoard) {
      // Return shape to tray if dropped outside board with a bounce effect
      const returnSound = document.getElementById('return-sound');
      if (returnSound) {
        returnSound.currentTime = 0;
        returnSound.volume = 0.2;
        returnSound.play().catch(e => console.log('Audio play failed:', e));
      }
      
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
            successSound.volume = 0.4;
            successSound.play().catch(e => console.log('Audio play failed:', e));
          }
          
          // Reset feedback after animation
          setTimeout(() => {
            setFeedbackState({ isVisible: false, position: null });
          }, 1000);
        }
      }
    });
    
    if (!foundMatch) {
      console.log(`Shape ${activeShape.type} returned to tray`);
      
      // Play error sound for wrong placement
      const errorSound = document.getElementById('error-sound');
      if (errorSound) {
        errorSound.currentTime = 0;
        errorSound.volume = 0.2;
        errorSound.play().catch(e => console.log('Audio play failed:', e));
      }
      
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

  // Calculate progress percentage
  const progressPercentage = (placedShapes.length / 10) * 100;

  return (
    <div className="game-board-container max-w-6xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-4 px-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-medium text-indigo-600">{placedShapes.length}/10 shapes</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Shapes tray - styled with elegant wooden appearance */}
        <div 
          ref={shapesContainerRef}
          className="shapes-tray relative border-4 rounded-lg p-4 md:w-1/3 h-64 md:h-[450px] overflow-visible transition-all duration-300"
          style={{
            backgroundColor: '#f8eed8', // Lighter, warmer wood color
            borderColor: '#8b5a2b', // Richer brown for border
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.15), 0 4px 6px rgba(139,90,43,0.2)',
            borderImage: 'linear-gradient(45deg, #8b5a2b, #bb906b, #8b5a2b) 1'
          }}
        >
          <h3 className="text-lg font-bold text-[#5d4037] mb-4 text-center">Shapes</h3>
          
          {/* Wood grain texture overlay - improved with more subtle texture */}
          <div className="absolute inset-0 pointer-events-none opacity-15" 
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
              backgroundSize: '200px',
              borderRadius: '0.5rem',
              mixBlendMode: 'multiply'
            }}>
          </div>
          
          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-4 pointer-events-none rounded-md" 
            style={{
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
            }}>
          </div>
          
          {/* Draggable shapes container with vertical centering when empty */}
          <div className="draggable-shapes-container relative h-full flex flex-wrap justify-center content-start gap-2">
            {availableShapes.map(shape => (
              <ShapeContainer
                key={shape.id}
                shape={shape}
                containerRef={shapesContainerRef}
                onDragStart={handleDragStart}
                isDragging={isDragging && activeShape?.id === shape.id}
              />
            ))}
            
            {/* Empty state when all shapes are placed - with celebratory styling */}
            {availableShapes.length === 0 && (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center bg-green-50 p-4 rounded-lg shadow-inner">
                  <p className="text-green-600 font-bold text-lg mb-1">
                    All shapes placed!
                  </p>
                  <p className="text-green-500">
                    Great job! You completed the puzzle.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Board container - styled with premium wooden board appearance */}
        <div 
          ref={boardRef}
          className="board-container relative w-full md:w-2/3 rounded-lg p-4 mb-8 transition-all duration-300"
          style={{ 
            height: '450px',
            touchAction: 'none',
            overflow: 'hidden',
            backgroundColor: '#deb887', // Rich butterscotch wood color
            borderColor: '#795548', // Deep brown for border
            borderWidth: '8px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.2), 0 6px 10px rgba(121,85,72,0.25)',
            backgroundImage: 'radial-gradient(#e6cda7, #deb887)'
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
          {/* Hidden audio elements with improved sound effects */}
          <audio id="success-sound" preload="auto" src="https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3"></audio>
          <audio id="pickup-sound" preload="auto" src="https://cdn.freesound.org/previews/47/47252_394625-lq.mp3"></audio>
          <audio id="error-sound" preload="auto" src="https://cdn.freesound.org/previews/369/369515_5260872-lq.mp3"></audio>
          <audio id="return-sound" preload="auto" src="https://cdn.freesound.org/previews/240/240776_4501967-lq.mp3"></audio>
          <audio id="complete-sound" preload="auto" src="https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3"></audio>
        
          {/* Wood grain texture overlay - improved with more detailed grain */}
          <div className="absolute inset-0 pointer-events-none opacity-20" 
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
              backgroundSize: '300px',
              borderRadius: '0.5rem',
              mixBlendMode: 'multiply'
            }}>
          </div>
          
          {/* Subtle board highlights for 3D effect */}
          <div className="absolute inset-0 pointer-events-none" 
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)'
            }}>
          </div>
          
          {/* Board title */}
          <h3 className="text-lg font-bold text-[#5d4037] mb-4 text-center absolute top-2 left-0 right-0 pointer-events-none">
            Puzzle Board
          </h3>
          
          {/* Currently dragged shape with improved styling */}
          {isDragging && activeShape && (
            <div 
              className="absolute z-50 pointer-events-none"
              style={{
                top: dragPosition.y - boardRef.current.getBoundingClientRect().top,
                left: dragPosition.x - boardRef.current.getBoundingClientRect().left,
                transform: 'translate(-50%, -50%) scale(var(--scale-drag, 1))',
                width: '80px',
                height: '80px',
                filter: 'drop-shadow(2px 8px 6px rgba(0,0,0,0.4))',
                transition: 'transform 0.05s ease-out'
              }}
            >
              <Shape type={activeShape.type} />
            </div>
          )}
          
          {/* Enhanced feedback component for successful placements */}
          <PlacementFeedback 
            isVisible={feedbackState.isVisible} 
            position={feedbackState.position} 
          />
          
          {/* Shape outlines on the board with improved grid layout */}
          <div className="outlines-container grid grid-cols-4 grid-rows-3 gap-2 h-full mt-4">
            {boardShapes.map(shape => (
              <ShapeOutline 
                key={shape.id}
                shape={shape}
                isPlaced={placedShapes.includes(shape.id)}
              />
            ))}
          </div>
          
          {/* Completion overlay - shown when game is complete */}
          {gameComplete && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white p-6 rounded-lg text-center shadow-xl transform animate-bounce-in">
                <h3 className="text-2xl font-bold text-indigo-700 mb-2">
                  Puzzle Complete!
                </h3>
                <p className="text-gray-700">
                  You've successfully placed all the shapes!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Added global CSS for animations */}
      <style jsx global>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .shape-outline {
          transition: all 0.3s ease-out;
        }
        .shape-filled {
          transform: scale(1.05);
          transition: transform 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Board;