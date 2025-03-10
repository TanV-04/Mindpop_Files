import { useRef, useEffect, useState } from "react";
import Shape from "./Shape";

const ShapeContainer = ({ shape, containerRef, onDragStart, isDragging }) => {
  const shapeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate position for shape within the shapes tray
  useEffect(() => {
    if (!shapeRef.current || !containerRef.current) return;

    if (!shape.initialPosition) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // Define responsive grid layout
      const totalColumns = 5;
      const totalRows = 2;
      const paddingX = 20;
      const paddingY = 40;

      const availableWidth = containerRect.width - 2 * paddingX;
      const availableHeight = containerRect.height - 2 * paddingY;

      const cellWidth = availableWidth / totalColumns;
      const cellHeight = availableHeight / totalRows;

      const shapeIndex = shape.id - 1;
      const row = Math.floor(shapeIndex / totalColumns);
      const col = shapeIndex % totalColumns;

      const x = col * cellWidth + cellWidth / 2 + paddingX;
      const y = row * cellHeight + cellHeight / 2 + paddingY;

      shape.initialPosition = { x, y };
    }
  }, [shape, containerRef]);

  // Handle dragging
  const handleDragStart = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pickupSound = document.getElementById("pickup-sound");
    if (pickupSound) {
      pickupSound.currentTime = 0;
      pickupSound.volume = 0.4;
      pickupSound.play().catch((e) => console.log("Audio play failed:", e));
    }

    onDragStart(
      {
        preventDefault: () => e.preventDefault(),
        clientX: e.clientX,
        clientY: e.clientY,
        currentTarget: shapeRef.current,
        shapeCenter: { x: centerX, y: centerY },
      },
      shape
    );
  };

  const positionStyle = shape.dragPosition || shape.initialPosition;

  return (
    <div
      ref={shapeRef}
      className={`shape-container absolute transition-transform transform ${
        isDragging ? "z-50" : isHovered ? "z-20" : "z-10"
      }`}
      style={{
        left: positionStyle ? `${positionStyle.x}px` : "50%",
        top: positionStyle ? `${positionStyle.y}px` : "50%",
        transition: isDragging
          ? "none"
          : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s",
        transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : isHovered ? 1.1 : 1})`,
        cursor: isDragging ? "grabbing" : "grab",
        display: shape.isDragging ? "none" : "block",
        width: "70px",
        height: "70px",
        filter: isDragging
          ? "drop-shadow(6px 10px 12px rgba(0,0,0,0.5))"
          : isHovered
          ? "drop-shadow(4px 8px 10px rgba(0,0,0,0.3))"
          : "drop-shadow(3px 6px 8px rgba(0,0,0,0.2))",
      }}
      onMouseDown={handleDragStart}
      onTouchStart={(e) => {
        e.preventDefault();
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
      <div className="relative w-full h-full flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white shadow-md">
        <Shape type={shape.type} />

        {/* Glow effect on hover */}
        {isHovered && !isDragging && (
          <div
            className="absolute inset-0 rounded-lg opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 80%)",
              animation: "pulse 1.5s infinite",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShapeContainer;
