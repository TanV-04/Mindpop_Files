import React, { useEffect } from 'react';
import MonkeyTypeComponent from '../../components/games/monkeytype/MonkeyTypeComponent';
import { useParams, useNavigate } from "react-router-dom";

const MonkeyType = () => {
  const params = useParams();
  const navigate = useNavigate();
  const storedAgeGroup = localStorage.getItem("userAgeGroup");
  const ageGroup = params.ageGroup || storedAgeGroup || "8-10";

  useEffect(() => {
    // Push a dummy state to intercept browser back button
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = () => {
      const confirmLeave = window.confirm("Are you sure you want to go back?");
      if (confirmLeave) {
        // Navigate to the games page
        window.location.href = "http://localhost:5173/games";
      } else {
        // Prevent navigation and stay on current page
        window.history.pushState(null, null, window.location.pathname);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div>
      <MonkeyTypeComponent key={ageGroup} ageGroup={ageGroup} />
    </div>
  );
};

export default MonkeyType;
