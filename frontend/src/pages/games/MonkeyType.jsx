import React from 'react'
import MonkeyTypeComponent from '../../components/games/monkeytype/MonkeyTypeComponent'
import { useParams } from "react-router-dom";

const MonkeyType = () => {
  const params = useParams();
  const storedAgeGroup = localStorage.getItem("userAgeGroup");
  const ageGroup = params.ageGroup || storedAgeGroup || "8-10";
  return (
    <div>
      <MonkeyTypeComponent key={ageGroup} ageGroup={ageGroup} />
    </div>
  )
}

export default MonkeyType