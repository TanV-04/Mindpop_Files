import { useState, useCallback } from "react";
import knownRhymesNoPunctuation from "../data/rhymesLinesNoPunctuation";

// Assuming the generateWords function returns a string or an array of words
const generateWords = (count) => {
  if (knownRhymesNoPunctuation && knownRhymesNoPunctuation.length > 0) {
    return knownRhymesNoPunctuation[Math.floor(Math.random() * knownRhymesNoPunctuation.length)];
  }
  return ''; // return an empty string if no rhymes are available
};

const useWords = (count) => {
  const [words, setWords] = useState(generateWords(count));

  const updateWords = useCallback(() => {
    setWords(generateWords(count));
  }, [count]);

  return { words, updateWords };
};

export default useWords;
