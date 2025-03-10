import React from "react";
import Caret from "../../Caret";

const UserTypings = ({ userInput = "", className, words = "" }) => {
  return (
    <div
      className={`absolute inset-0 ${className} flex flex-wrap items-start justify-start max-w-full text-3xl leading-relaxed break-normal`}
      style={{
        whiteSpace: "pre-wrap",
        display: "flex",
        flexWrap: "wrap",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {userInput.split("").map((char, index) => (
        <Character key={index} actual={char} expected={words[index]} />
      ))}
      <Caret />
    </div>
  );
};

const Character = ({ actual, expected }) => {
  const isCorrect = actual === expected;
  const isWhiteSpace = expected === " ";

  return (
    <span
      className={`inline-block ${
        isCorrect ? "text-yellow-400" : "text-red-500"
      } ${isWhiteSpace ? "bg-red-500/50 w-[10px] h-[20px]" : ""}`}
    >
      {isWhiteSpace ? "\u00A0" : actual}
    </span>
  );
};

export default UserTypings;
