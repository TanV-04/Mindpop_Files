import React, { useState, useEffect, useRef } from 'react';

const JigsawPuzzle = ({ image, rows = 3, columns = 3, onComplete }) => {
  const [pieces, setPieces] = useState([]);
  const [solved, setSolved] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize puzzle when image loads
  useEffect(() => {
    setLoading(true);
    setSolved(false);
    
    const img = new Image();
    let isMounted = true;
    
    img.onload = () => {
      if (!isMounted) return;
      
      // Make sure containerRef is still valid
      if (!containerRef.current) return;
      
      // Get container dimensions and adjust for responsive sizing
      const containerWidth = containerRef.current.offsetWidth;
      
      // Calculate aspect ratio and fit to container
      const aspectRatio = img.width / img.height;
      const width = Math.min(containerWidth, window.innerHeight * 0.8 * aspectRatio);
      const height = width / aspectRatio;
      
      setDimensions({ width, height });
      
      // Now create the puzzle pieces
      createPuzzlePieces(width, height);
      setLoading(false);
    };
    
    img.onerror = () => {
      if (!isMounted) return;
      console.error("Failed to load image:", image);
      setLoading(false);
    };
    
    img.src = image;
    imageRef.current = img;
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [image, rows, columns]);

  // Create puzzle pieces
  const createPuzzlePieces = (width, height) => {
    const pieceWidth = width / columns;
    const pieceHeight = height / rows;
    const newPieces = [];
    
    let positions = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        positions.push({ row, col });
      }
    }
    
    // Shuffle positions
    positions = shuffleArray(positions);
    
    for (let i = 0; i < positions.length; i++) {
      const { row, col } = positions[i];
      newPieces.push({
        id: `piece-${row}-${col}`,
        correctRow: row,
        correctCol: col,
        currentRow: Math.floor(i / columns),
        currentCol: i % columns,
        width: pieceWidth,
        height: pieceHeight,
        solved: false
      });
    }
    
    setPieces(newPieces);
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle piece click/selection
  const handlePieceClick = (piece) => {
    if (solved) return;
    
    if (selectedPiece === null) {
      // First piece selected
      setSelectedPiece(piece);
    } else {
      // Second piece selected, swap them
      swapPieces(selectedPiece, piece);
      setSelectedPiece(null);
    }
  };

  // Swap two pieces
  const swapPieces = (piece1, piece2) => {
    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      
      const index1 = newPieces.findIndex(p => p.id === piece1.id);
      const index2 = newPieces.findIndex(p => p.id === piece2.id);
      
      if (index1 !== -1 && index2 !== -1) {
        // Swap current positions
        const temp = {
          currentRow: newPieces[index1].currentRow,
          currentCol: newPieces[index1].currentCol
        };
        
        newPieces[index1].currentRow = newPieces[index2].currentRow;
        newPieces[index1].currentCol = newPieces[index2].currentCol;
        
        newPieces[index2].currentRow = temp.currentRow;
        newPieces[index2].currentCol = temp.currentCol;
        
        // Check if pieces are in correct positions
        newPieces[index1].solved = 
          newPieces[index1].currentRow === newPieces[index1].correctRow && 
          newPieces[index1].currentCol === newPieces[index1].correctCol;
        
        newPieces[index2].solved = 
          newPieces[index2].currentRow === newPieces[index2].correctRow && 
          newPieces[index2].currentCol === newPieces[index2].correctCol;
        
        // Check if puzzle is solved
        const allSolved = newPieces.every(p => p.solved);
        if (allSolved && !solved) {
          setSolved(true);
          if (onComplete) {
            setTimeout(() => onComplete(), 500);
          }
        }
      }
      
      return newPieces;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-xl font-semibold text-gray-500">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="jigsaw-puzzle flex flex-col items-center p-4">
      <div 
        className="puzzle-container relative border-4 border-gray-800 shadow-lg"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1px',
          backgroundColor: '#222'
        }}
      >
        {pieces.map((piece) => {
          const { id, correctRow, correctCol, currentRow, currentCol, width, height, solved: pieceSolved } = piece;
          
          return (
            <div
              key={id}
              className={`puzzle-piece relative cursor-pointer transition-all duration-300 ${
                selectedPiece?.id === id ? 'ring-4 ring-yellow-400 ring-opacity-70 z-10' : ''
              } ${pieceSolved ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                gridRow: currentRow + 1,
                gridColumn: currentCol + 1,
                backgroundImage: `url(${image})`,
                backgroundPosition: `-${correctCol * width}px -${correctRow * height}px`,
                backgroundSize: `${dimensions.width}px ${dimensions.height}px`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onClick={() => handlePieceClick(piece)}
            />
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        {solved ? (
          <div className="text-2xl font-bold text-green-600">Puzzle Completed! 🎉</div>
        ) : (
          <div className="text-md text-gray-600">
            {selectedPiece ? 'Now select another piece to swap with' : 'Select a piece to move'}
          </div>
        )}
      </div>
    </div>
  );
};

export default JigsawPuzzle;