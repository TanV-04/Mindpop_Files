import React from "react";

const Avatar = ({ ageGroup, message }) => {
  const avatarStyles = {
    "5-7": "bg-blue-100 text-blue-800",
    "8-10": "bg-green-100 text-green-800",
    "11-12": "bg-purple-100 text-purple-800"
  };

  return (
    <div className={`${avatarStyles[ageGroup]} px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center shadow-md text-sm sm:text-base max-w-full overflow-hidden`}>
      <div className="mr-1 sm:mr-2 flex-shrink-0">
        {ageGroup === "5-7" ? "🐵" : ageGroup === "8-10" ? "🦊" : "🦉"}
      </div>
      <div className="font-medium truncate">{message}</div>
    </div>
  );
};

export default Avatar;