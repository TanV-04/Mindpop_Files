import { useState, useEffect, useRef } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

function JigsawPuzzle({ image, rows = 3, columns = 3, onComplete }) {
  const [pieces, setPieces] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [completed, setCompleted] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const containerRef = useRef(null);

  // Measure container size
  const measureContainer = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      setDimensions({ width, height });
    }
  };

  useEffect(() => {
    measureContainer();
    window.addEventListener('resize', measureContainer);
    return () => window.removeEventListener('resize', measureContainer);
  }, []);

  // Create pieces when image is loaded
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      measureContainer(); // Make sure dimensions are ready
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      const piecesList = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          piecesList.push({
            id: y * columns + x,
            x,
            y,
            targetX: x,
            targetY: y,
            width: width / columns,
            height: height / rows,
            zIndex: 1,
            correct: false,
          });
        }
      }
      setPieces(piecesList);
    };

    img.src = image;
  }, [image, rows, columns]);

  // Shuffle pieces
  useEffect(() => {
    if (pieces.length > 0 && !shuffled) {
      const shuffledPieces = [...pieces].map(piece => {
        const randomX = Math.floor(Math.random() * columns);
        const randomY = Math.floor(Math.random() * rows);

        return {
          ...piece,
          x: randomX,
          y: randomY,
          zIndex: 1,
        };
      });

      setPieces(shuffledPieces);
      setShuffled(true);
    }
  }, [pieces, shuffled, rows, columns]);

  // Springs
  const [springs, api] = useSprings(pieces.length, i => ({
    x: pieces[i]?.x * (dimensions.width / columns) || 0,
    y: pieces[i]?.y * (dimensions.height / rows) || 0,
    scale: 1,
    zIndex: pieces[i]?.zIndex || 1,
    shadow: 0,
    config: { mass: 1, tension: 350, friction: 40 }
  }));

  // Update springs when pieces change
  useEffect(() => {
    if (pieces.length > 0 && dimensions.width > 0) {
      api.start(i => ({
        x: pieces[i].x * (dimensions.width / columns),
        y: pieces[i].y * (dimensions.height / rows),
        scale: 1,
        zIndex: pieces[i].zIndex,
        shadow: 0
      }));
    }
  }, [pieces, dimensions, api, columns, rows]);

  // Check if completed
  useEffect(() => {
    if (!pieces.length) return;

    const allCorrect = pieces.every(piece =>
      piece.x === piece.targetX && piece.y === piece.targetY
    );

    if (allCorrect && !completed) {
      setCompleted(true);
      setTimeout(() => {
        onComplete && onComplete();
      }, 1000);
    }
  }, [pieces, completed, onComplete]);

  // Dragging
  const bindDrag = useDrag(({ args: [index], active, movement: [mx, my], first, last }) => {
    if (completed) return;

    if (first) {
      const newPieces = pieces.map((p, i) => ({
        ...p,
        zIndex: i === index ? 10 : p.zIndex
      }));
      setPieces(newPieces);
    }

    if (active) {
      api.start(i => {
        if (i === index) {
          return {
            x: pieces[i].x * (dimensions.width / columns) + mx,
            y: pieces[i].y * (dimensions.height / rows) + my,
            scale: 1.05,
            shadow: 15,
            zIndex: 10,
            immediate: key => key === 'zIndex'
          };
        }
        return undefined;
      });
    }

    if (last) {
      const pieceWidth = dimensions.width / columns;
      const pieceHeight = dimensions.height / rows;

      const currentX = pieces[index].x * pieceWidth + mx;
      const currentY = pieces[index].y * pieceHeight + my;

      const gridX = Math.round(currentX / pieceWidth);
      const gridY = Math.round(currentY / pieceHeight);

      const boundedX = Math.max(0, Math.min(columns - 1, gridX));
      const boundedY = Math.max(0, Math.min(rows - 1, gridY));

      const targetIndex = pieces.findIndex(p => p.x === boundedX && p.y === boundedY);

      if (targetIndex !== -1 && targetIndex !== index) {
        const newPieces = [...pieces];
        const targetPiece = { ...newPieces[targetIndex] };
        const currentPiece = { ...newPieces[index] };

        newPieces[targetIndex] = {
          ...targetPiece,
          x: currentPiece.x,
          y: currentPiece.y,
          correct: targetPiece.targetX === currentPiece.x && targetPiece.targetY === currentPiece.y
        };

        newPieces[index] = {
          ...currentPiece,
          x: boundedX,
          y: boundedY,
          correct: currentPiece.targetX === boundedX && currentPiece.targetY === boundedY
        };

        setPieces(newPieces);
      } else {
        const newPieces = [...pieces];
        newPieces[index] = {
          ...newPieces[index],
          x: boundedX,
          y: boundedY,
          correct: newPieces[index].targetX === boundedX && newPieces[index].targetY === boundedY
        };

        setPieces(newPieces);
      }
    }
  });

  // Loading view
  if (pieces.length === 0 || dimensions.width === 0) {
    return <div className="w-full aspect-square bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto"
      style={{ aspectRatio: '1 / 1' }}
    >
      <div
        className="absolute inset-0 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
        style={{
          backgroundImage: completed ? `url(${image})` : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          opacity: completed ? 0.3 : 1,
        }}
      >
        {/* Grid lines */}
        {Array.from({ length: rows - 1 }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="absolute w-full h-px bg-gray-300"
            style={{ top: `${((i + 1) / rows) * 100}%` }}
          />
        ))}
        {Array.from({ length: columns - 1 }).map((_, i) => (
          <div
            key={`col-${i}`}
            className="absolute h-full w-px bg-gray-300"
            style={{ left: `${((i + 1) / columns) * 100}%` }}
          />
        ))}
      </div>

      {springs.map((props, i) => (
        <animated.div
          key={pieces[i].id}
          {...bindDrag(i)}
          style={{
            ...props,
            position: 'absolute',
            width: dimensions.width / columns,
            height: dimensions.height / rows,
            backgroundImage: `url(${image})`,
            backgroundSize: `${dimensions.width}px ${dimensions.height}px`,
            backgroundPosition: `${-pieces[i].targetX * (dimensions.width / columns)}px ${-pieces[i].targetY * (dimensions.height / rows)}px`,
            boxShadow: props.shadow.to(s => `0px ${s / 3}px ${s}px rgba(0,0,0,0.15)`),
            borderRadius: '4px',
            cursor: completed ? 'default' : 'grab',
            touchAction: 'none'
          }}
          className={`select-none ${pieces[i].correct ? 'border-2 border-green-500' : 'border border-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default JigsawPuzzle;
