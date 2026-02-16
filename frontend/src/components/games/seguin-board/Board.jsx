//frontend\src\components\games\seguin-board\Board.jsx
import { useState, useEffect, useRef } from "react";
import { shapes } from "../../../constants/gameConstants";
import ShapeContainer from "./ShapeContainer";
import ShapeOutline from "./ShapeOutline";
import PlacementFeedback from "./PlacementFeedback";
import Shape from "./Shape";

const Board = ({ onComplete }) => {
  const [availableShapes, setAvailableShapes] = useState([]);
  const [boardShapes, setBoardShapes] = useState([]);
  const [placedShapes, setPlacedShapes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeShape, setActiveShape] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [feedbackState, setFeedbackState] = useState({
    isVisible: false,
    position: null,
  });

  const boardRef = useRef(null);
  const shapesContainerRef = useRef(null);

  useEffect(() => {
    setAvailableShapes(
      shapes.map((shape) => ({
        ...shape,
        isDragging: false,
      }))
    );
    setBoardShapes(shapes);
    setPlacedShapes([]);
  }, []);

  useEffect(() => {
    if (placedShapes.length === 10) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [placedShapes.length, onComplete]);

  const handleDragStart = (e, shape) => {
    e.preventDefault();
    if (!boardRef.current) return;

    setDragPosition({ x: e.clientX, y: e.clientY });
    setActiveShape(shape);
    setIsDragging(true);

    setAvailableShapes((prev) =>
      prev.map((s) => (s.id === shape.id ? { ...s, isDragging: true } : s))
    );
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !activeShape || !boardRef.current) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !activeShape || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const isOverBoard =
      e.clientX >= boardRect.left &&
      e.clientX <= boardRect.right &&
      e.clientY >= boardRect.top &&
      e.clientY <= boardRect.bottom;

    if (!isOverBoard) {
      setAvailableShapes((prev) =>
        prev.map((shape) =>
          shape.id === activeShape.id ? { ...shape, isDragging: false } : shape
        )
      );
      setIsDragging(false);
      setActiveShape(null);
      return;
    }

    const outlineElements = document.querySelectorAll(".shape-outline");
    let foundMatch = false;

    outlineElements.forEach((outline) => {
      if (foundMatch || outline.classList.contains("shape-filled")) return;

      const outlineRect = outline.getBoundingClientRect();
      const outlineType = outline.dataset.type;

      if (activeShape.type === outlineType) {
        const isOverOutline =
          e.clientX >= outlineRect.left &&
          e.clientX <= outlineRect.right &&
          e.clientY >= outlineRect.top &&
          e.clientY <= outlineRect.bottom;

        if (isOverOutline) {
          const newPlacedShapes = [...placedShapes, activeShape.id];
          setPlacedShapes(newPlacedShapes);

          setAvailableShapes((prev) =>
            prev.filter((shape) => shape.id !== activeShape.id)
          );

          foundMatch = true;

          setFeedbackState({
            isVisible: true,
            position: {
              x: outlineRect.left + outlineRect.width / 2 - boardRect.left,
              y: outlineRect.top + outlineRect.height / 2 - boardRect.top,
            },
          });

          setTimeout(() => {
            setFeedbackState({ isVisible: false, position: null });
          }, 1000);
        }
      }
    });

    if (!foundMatch) {
      setAvailableShapes((prev) =>
        prev.map((shape) =>
          shape.id === activeShape.id ? { ...shape, isDragging: false } : shape
        )
      );
    }

    setIsDragging(false);
    setActiveShape(null);
  };

  const progressPercentage = (placedShapes.length / 10) * 100;

  return (
    <div className="game-board-container">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold" style={{ color: "#66220B" }}>
            Progress
          </span>
          <span className="font-bold" style={{ color: "#F09000" }}>
            {placedShapes.length}/10 shapes
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Shapes Tray with Grid */}
        <div ref={shapesContainerRef} className="shapes-tray md:w-1/3">
          <h3 className="tray-title">Available Shapes</h3>

          <div className="shapes-grid">
            {availableShapes.map((shape) => (
              <div key={shape.id} className="shape-grid-cell">
                {!shape.isDragging && (
                  <ShapeContainer
                    shape={shape}
                    onDragStart={handleDragStart}
                  />
                )}
              </div>
            ))}

            {availableShapes.length === 0 && (
              <div className="col-span-5 row-span-2 flex items-center justify-center">
                <div className="text-center bg-white p-4 rounded-lg border-3" style={{ borderColor: "#10B981" }}>
                  <p className="text-green-600 font-bold text-lg">
                    All shapes placed! 🎉
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className="board-container md:w-2/3"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleMouseMove({
              clientX: touch.clientX,
              clientY: touch.clientY,
            });
          }}
          onTouchEnd={handleMouseUp}
        >
          <h3 className="board-title">Match the Shapes</h3>

          {/* Dragging Shape */}
          {isDragging && activeShape && (
            <div
              className="shape-dragging"
              style={{
                top: dragPosition.y - boardRef.current.getBoundingClientRect().top,
                left: dragPosition.x - boardRef.current.getBoundingClientRect().left,
                transform: "translate(-50%, -50%)",
                filter: "drop-shadow(6px 10px 12px rgba(0,0,0,0.5))",
              }}
            >
              <Shape type={activeShape.type} />
            </div>
          )}

          <PlacementFeedback
            isVisible={feedbackState.isVisible}
            position={feedbackState.position}
          />

          {/* Shape Outlines Grid */}
          <div className="outlines-container">
            {boardShapes.map((shape) => (
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