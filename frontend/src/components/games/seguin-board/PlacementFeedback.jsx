import { useState, useEffect, useMemo } from 'react';

const PlacementFeedback = ({ isVisible, position }) => {
  // Use useMemo to memoize these arrays
  const messages = useMemo(() => [
    "Perfect!",
    "Great job!",
    "Excellent!",
    "You did it!",
    "Amazing!",
    "Wonderful!",
    "That's right!"
  ], []);
  
  const emojis = useMemo(() => [
    "👍", "🎉", "⭐", "🌟", "😊", "🎈", "👏"
  ], []);
  
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(messages[0]);
  const [emoji, setEmoji] = useState(emojis[0]);
  
  useEffect(() => {
    if (isVisible) {
      // Show the feedback
      setVisible(true);
      
      // Pick a random message and emoji for variety
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      
      // Hide the feedback after animation completes
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, messages, emojis]);
  
  if (!visible || !position) return null;
  
  return (
    <div 
      className="placement-feedback absolute pointer-events-none flex items-center justify-center z-50"
      style={{
        left: position.x || 0,
        top: position.y || 0,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex flex-col items-center">
        {/* Animated emoji that bounces */}
        <div className="animate-bounce text-5xl mb-1" style={{
          filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))'
        }}>
          {emoji}
        </div>
        
        {/* Animated text that pulses */}
        <div className="animate-pulse text-xl font-bold bg-white bg-opacity-90 px-3 py-1 rounded-full text-green-600" style={{
          boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 15px rgba(255,255,255,0.5)',
        }}>
          {message}
        </div>
        
        {/* Star particles effect */}
        <div className="star-particles absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `float${i % 3 + 1} ${Math.random() * 2 + 1}s ease-in-out infinite`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-15deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(20deg); }
        }
      `}</style>
    </div>
  );
};

export default PlacementFeedback;