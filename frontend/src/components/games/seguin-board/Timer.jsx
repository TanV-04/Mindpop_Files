//frontend\src\components\games\seguin-board\Timer.jsx
import { useState, useEffect } from 'react';

const Timer = ({ isRunning, onTimeUpdate }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval;
    
    if (isRunning) {
      setTime(0);
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 0.1;
          onTimeUpdate(parseFloat(newTime.toFixed(1)));
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="timer-container">
      <div className="timer-display">{formatTime(time)}</div>
    </div>
  );
};

export default Timer;