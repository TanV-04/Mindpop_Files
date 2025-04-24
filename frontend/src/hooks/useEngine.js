import { useState, useEffect, useCallback, useRef } from "react";
import { countErrors } from "../utils/helpers";
import { AdaptiveDifficultyAI } from 'data/adaptiveDifficulty';
// Default timer in seconds
const DEFAULT_TIME = 60;

/**
 * Custom hook for the typing game engine
 * @returns {Object} - Game state and controls
 */
const useEngine = () => {
  const [state, setState] = useState("idle"); // idle, start, finish
  const [words, setWords] = useState("");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const intervalRef = useRef(null);
  
  
  // Generate a new set of words
  const generateWords = useCallback(() => {
    // This would normally fetch words from your data source
    // For now we're using a placeholder
    const sampleWords = "The quick brown fox jumps over the lazy dog.";
    setWords(sampleWords);
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    setState("start");
    setTimeLeft(DEFAULT_TIME);
    setTyped("");
    setErrors(0);
    setTotalTyped(0);
    generateWords();
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          setState("finish");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [generateWords]);

  // Restart the game
  const restart = useCallback(() => {
    setState("idle");
    setTimeLeft(DEFAULT_TIME);
    setTyped("");
    setErrors(0);
    setTotalTyped(0);
    setWords("");
    clearInterval(intervalRef.current);
    startGame();
  }, [startGame]);

  // Handle user typing
  useEffect(() => {
    if (state === "start") {
      // Count errors accurately only for typed characters
      const currentErrors = countErrors(typed, words);
      setErrors(currentErrors);
      
      // Track total typed characters
      setTotalTyped(typed.length);
      
      // Check if user has completed all words
      if (typed.length >= words.length) {
        setState("finish");
        clearInterval(intervalRef.current);
      }
    }
  }, [typed, words, state]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state === "idle") {
        startGame();
        return;
      }
      
      if (state !== "start") return;
      
      // Only allow letters, numbers, spaces, and punctuation
      const key = e.key;
      const isValidKey = 
        key.length === 1 || 
        key === " " || 
        key === "." || 
        key === "," || 
        key === "'" || 
        key === "\"" || 
        key === "-";
      
      if (isValidKey) {
        setTyped((prev) => prev + key);
      } else if (key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, startGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return {
    state,
    words,
    timeLeft,
    typed,
    errors,
    totalTyped,
    restart
  };
};

export default useEngine;