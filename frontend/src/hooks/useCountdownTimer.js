// useCountdownTimer.js
import { useCallback, useState, useRef, useEffect } from "react";

const useCountdownTimer = (seconds) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);

  const startCountdown = useCallback(() => {
    console.log("Starting countdown");

    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
    }, 1000);
  }, []);

  const resetCountdown = useCallback(() => {
    console.log("resetting countdown...");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!timeLeft && intervalRef.current) {
      console.log("clearing timer...");
      clearInterval(intervalRef.current);
    }
  }, [timeLeft, intervalRef]);

  return [timeLeft, startCountdown, resetCountdown];
};

export default useCountdownTimer;
