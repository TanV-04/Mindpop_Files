import { useState, useEffect } from 'react';

const Timer = ({ isRunning, onTimeUpdate }) => {
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // Start or stop timer based on isRunning prop
  useEffect(() => {
    if (isRunning && !intervalId) {
      // Reset timer when starting
      setTime(0);
      
      const id = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 0.1;
          onTimeUpdate(newTime.toFixed(1));
          return newTime;
        });
      }, 100);
      
      setIntervalId(id);
    } else if (!isRunning && intervalId) {
      // Clear interval when stopping
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, onTimeUpdate, intervalId]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = (timeInSeconds % 60).toFixed(1);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="timer bg-white py-2 px-4 rounded-full shadow-md text-center mb-4 max-w-xs mx-auto">
      <div className="text-xl font-semibold text-[#66220B]">
        {formatTime(time)}
      </div>
    </div>
  );
};

export default Timer;