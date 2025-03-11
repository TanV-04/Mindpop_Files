import React from "react";

const UserTypings = ({ userInput = "", words = "" }) => {
  if (!words) return null;

  return (
    <div className="relative text-3xl font-medium tracking-normal whitespace-nowrap">
      {/* Base Layer: Faded text */}
      <div className="absolute inset-0 text-gray-400 opacity-50 pointer-events-none">
        {words}
      </div>

      {/* Typed Text: Overlay */}
      <div className="absolute inset-0">
        {words.split("").map((char, index) => {
          const typedChar = userInput[index] || "";
          const isCorrect = typedChar === char;
          const isIncorrect = typedChar && !isCorrect;

          return (
            <span
              key={index}
              className={`transition-opacity ${
                isCorrect ? "text-black opacity-100" 
                : isIncorrect ? "text-red-500 opacity-100" 
                : "opacity-10"
              }`}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypings;
