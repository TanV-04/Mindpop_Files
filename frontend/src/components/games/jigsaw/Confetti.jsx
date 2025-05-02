import { useEffect, useState } from 'react';

function Confetti() {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    // Create confetti pieces
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fc0'];
    const newPieces = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 10,
      size: 5 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      speed: 1 + Math.random() * 3
    }));
    
    setPieces(newPieces);
    
    // Animate the confetti
    let animationId;
    let lastTime = 0;
    
    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      
      setPieces(prevPieces => 
        prevPieces.map(piece => ({
          ...piece,
          y: piece.y + piece.speed * (deltaTime / 16),
          rotation: (piece.rotation + 1) % 360,
          // Add some horizontal movement
          x: piece.x + (Math.sin(time / 1000 + piece.id) * 0.5)
        })).filter(piece => piece.y < 110) // Remove pieces that have fallen off screen
      );
      
      if (pieces.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: 0.8,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;