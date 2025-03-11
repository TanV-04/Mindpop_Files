import { useState, useEffect, useCallback } from "react";
import { countErrors } from "../utils/helpers";
import useCountdownTimer from "./useCountdownTimer";
import useTypings from "./useTypings";
import useWords from "./useWords";

const useEngine = () => {
  const { words, updateWords } = useWords(12);
  const [state, setState] = useState("start");
  const [errors, setErrors] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  
  const [timeLeft, startCountdown, resetCountdown] = useCountdownTimer(10);
  const { typed, cursor, clearTyped, resetTotalTyped, totalTyped } = useTypings(state !== "finish");

  const isStarting = state === "start" && cursor > 0;
  const areWordsFinished = cursor === words.length;

  const sumErrors = useCallback(() => {
    const wordsReached = words.substring(0, cursor);
    setErrors((prevErrors) => prevErrors + countErrors(typed, wordsReached));
  }, [typed, words, cursor]);

  useEffect(() => {
    if (isStarting) {
      setState("run");
      startCountdown();
    }
  }, [isStarting, startCountdown]);

  useEffect(() => {
    if (!timeLeft) {
      setState("finish");
      sumErrors();
      setRoundResults((prev) => [
        ...prev,
        { errors: errors, totalTyped: totalTyped },
      ]);
    }
  }, [timeLeft, sumErrors]);

  useEffect(() => {
    if (areWordsFinished) {
      setRoundResults((prev) => [
        ...prev,
        { errors: errors, totalTyped: totalTyped },
      ]);
      updateWords();
      clearTyped();
      setErrors(0);
    }
  }, [areWordsFinished, updateWords, clearTyped]);

  const restart = useCallback(() => {
    resetCountdown();
    resetTotalTyped();
    setState("start");
    setErrors(0);
    updateWords();
    clearTyped();
    setRoundResults([]);
  }, [resetCountdown, resetTotalTyped, updateWords, clearTyped]);

  return { state, words, timeLeft, typed, errors, totalTyped, restart, roundResults };
};

export default useEngine;
