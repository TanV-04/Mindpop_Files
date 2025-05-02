import { useEffect, useState } from 'react';

function Confetti({ active = false }) {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    // Only create confetti pieces if active
    if (!active) {
      setPieces([]);
      return;
    }
    
    console.log("Confetti is active, creating pieces...");
    
    // Create confetti pieces
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fc0', '#f90', '#b0f'];
    const newPieces = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 20, // Start higher above the screen
      size: 5 + Math.random() * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      speed: 1 + Math.random() * 3,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
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
          rotation: (piece.rotation + piece.speed) % 360,
          // Add some horizontal movement
          x: piece.x + (Math.sin(time / 1000 + piece.id) * 0.5)
        })).filter(piece => piece.y < 110) // Remove pieces that have fallen off screen
      );
      
      if (active) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      console.log("Cleaning up confetti animation");
      cancelAnimationFrame(animationId);
    };
  }, [active]); // Depend on active prop to re-run when it changes
  
  // If not active, don't render anything
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
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
            borderRadius: piece.shape === 'circle' ? '50%' : '0%',
            zIndex: 9999,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;