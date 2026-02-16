//frontend\src\components\games\seguin-board\Instructions.jsx
const Instructions = ({ text }) => {
  return (
    <div className="instructions-container">
      <h3 className="instructions-title">🧩 How to Play</h3>
      <p className="instructions-text">{text}</p>
    </div>
  );
};

export default Instructions;