//Instructions.jsx
import React from "react";

const Instructions = ({ text, isChild = false }) => {
  return (
    <div
      className={`instructions-container mb-6 ${
        isChild ? "child-friendly" : ""
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto border border-gray-200 transition-all duration-300 hover:shadow-xl">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`icon text-${
              isChild ? "[#F09000]" : "[#66220B]"
            } text-3xl`}
          >
            {isChild ? (
              <i className="fa fa-puzzle-piece animate-bounce"></i>
            ) : (
              <i className="fa fa-info-circle"></i>
            )}
          </div>

          <h2
            className={`font-bold ${
              isChild ? "text-3xl text-[#F09000]" : "text-2xl text-[#66220B]"
            }`}
          >
            {isChild ? "Let's Play!" : "Instructions"}
          </h2>
        </div>

        {/* Instruction text */}
        <p
          className={`leading-relaxed pl-8 ${
            isChild ? "text-lg text-gray-700" : "text-gray-600"
          }`}
        >
          {text}
        </p>

        {/* Child-friendly hint section */}
        {isChild && (
          <div className="mt-6 flex justify-center">
            <div className="animated-hint flex items-center text-[#F09000] font-semibold bg-[#FFF3E0] px-4 py-2 rounded-lg shadow-sm animate-pulse">
              <i className="fa fa-hand-pointer-o mr-2"></i>
              <span>Drag the shapes to match the outlines!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;
