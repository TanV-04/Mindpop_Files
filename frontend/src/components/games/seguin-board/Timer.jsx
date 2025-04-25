//Timer.jsx

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

  // Calculate cat paw animation based on time
  const pawActive = time % 2 < 1;

  return (
    <div className="timer bg-pink-100 py-4 px-6 rounded-2xl shadow-lg text-center mb-4 max-w-xs mx-auto border-4 border-pink-300 relative overflow-hidden">
      {/* Cat ears */}
      <div className="absolute -top-1 left-6 w-0 h-0 border-l-16 border-r-16 border-b-24 border-l-transparent border-r-transparent border-b-pink-400"></div>
      <div className="absolute -top-1 right-6 w-0 h-0 border-l-16 border-r-16 border-b-24 border-l-transparent border-r-transparent border-b-pink-400"></div>
      
      {/* Cat face */}
      <div className="mb-2">
        <div className="flex justify-center space-x-10 mb-1">
          {/* Cat eyes - blinking when timer runs */}
          <div className={`w-4 h-6 bg-gray-800 rounded-full`}></div>
          <div className={`w-4 h-6 bg-gray-800 rounded-full`}></div>
        </div>
        {/* Cat nose */}
        <div className="w-3 h-4 bg-pink-500 rounded-full mx-auto mb-1"></div>
      </div>

      <div className="text-2xl font-bold text-pink-700 bg-white py-2 px-4 rounded-full">
        {formatTime(time)}
      </div>
    </div>
  );
};

export default Timer;