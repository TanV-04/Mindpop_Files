//frontend\src\components\games\seguin-board\ShapeContainer.jsx
import Shape from "./Shape";

const ShapeContainer = ({ shape, onDragStart }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    onDragStart(e, shape);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDragStart(
      {
        ...e,
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
      },
      shape
    );
  };

  return (
    <div
      className="shape-container"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <Shape type={shape.type} />
    </div>
  );
};

export default ShapeContainer;