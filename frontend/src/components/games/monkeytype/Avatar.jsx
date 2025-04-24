import React from "react";

const Avatar = ({ ageGroup, message }) => {
  const avatarStyles = {
    "5-7": "bg-blue-100 text-blue-800",
    "8-10": "bg-green-100 text-green-800",
    "11-12": "bg-purple-100 text-purple-800"
  };

  return (
    <div className={`${avatarStyles[ageGroup]} px-4 py-2 rounded-full flex items-center shadow-md`}>
      <div className="mr-2">
        {ageGroup === "5-7" ? "🐵" : ageGroup === "8-10" ? "🦊" : "🦉"}
      </div>
      <div className="font-medium">{message}</div>
    </div>
  );
};

export default Avatar;