//frontend\src\components\games\seguin-board\PlacementFeedback.jsx
import { useState, useEffect } from 'react';

const PlacementFeedback = ({ isVisible, position }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('');

  const messages = ['Perfect!', 'Great!', 'Excellent!', 'Amazing!', 'Wonderful!'];
  const emojis = ['🎉', '⭐', '🌟', '👏', '✨'];

  useEffect(() => {
    if (isVisible && position) {
      setVisible(true);
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);

      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, position]);

  if (!visible || !position) return null;

  return (
    <div
      className="placement-feedback"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="feedback-emoji">{emoji}</div>
      <div style={{
        background: 'white',
        color: '#F09000',
        padding: '0.5rem 1rem',
        borderRadius: '50px',
        fontWeight: '700',
        fontSize: '1.25rem',
        border: '2px solid #F09000',
      }}>
        {message}
      </div>
    </div>
  );
};

export default PlacementFeedback;