import React, { useEffect, useState } from "react";
import knownRhymesNoPunctuation from "../../../data/rhymesLinesNoPunctuation";
import RestartButton from "../../RestartButton";
import Results from "./Results";
import UserTypings from "./UserTypings";
import useEngine from "../../../hooks/useEngine";
import { calculateAccuracyPercentage } from "../../../utils/helpers";

const GeneratedWords = ({ words }) => (
  <div className="quicksand mt-6 text-slate-400 text-3xl tracking-wide font-light">
    {words}
  </div>
);

const CountdownTimer = ({ timeLeft }) => (
  <h2 className="text-yellow-500 font-medium quicksand text-xl" aria-live="polite">
    Time: {timeLeft}s
  </h2>
);

const MonkeyTypeComponent = () => {
  const { state, words, timeLeft, typed, errors, restart, totalTyped } = useEngine();
  const [isVisible, setIsVisible] = useState(false);
  const [completedRhymes, setCompletedRhymes] = useState(0);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    if (state === "finish") setCompletedRhymes((prev) => prev + 1);
  }, [state]);

  const restartGame = () => {
    setCompletedRhymes(0);
    restart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-900 to-white-800 flex justify-center items-center px-4">
      <div
        className={`bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <h2 className="text-2xl font-semibold text-center mb-6 quicksand text-gray-800 dark:text-white">
          Type the words as quickly and correctly as you can!
        </h2>

        {/* Timer & Restart Button */}
        <div className="flex justify-between items-center mb-6">
          <CountdownTimer timeLeft={timeLeft} />
          {state === "finish" && <RestartButton onRestart={restartGame} />}
        </div>

        {/* Typing Area */}
        <div className="relative bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
          {/* <GeneratedWords words={words} /> */}
          <div className="absolute inset-0 p-6 pointer-events-none">
            <UserTypings words={words} userInput={typed} />
          </div>
        </div>

        {/* Results */}
        <Results
          state={state}
          className="mt-6 quicksand"
          errors={errors}
          accuracyPercentage={calculateAccuracyPercentage(errors, totalTyped)}
          total={totalTyped}
          completedRhymes={completedRhymes}
        />
      </div>
    </div>
  );
};

export default MonkeyTypeComponent;
