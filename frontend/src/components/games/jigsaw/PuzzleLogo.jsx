function PuzzleLogo({ className = "" }) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" stroke="#8b5cf6" strokeWidth="4">
          <path d="M30,30 L45,30 A5,5 0 0 1 50,35 L50,45 A5,5 0 0 0 55,50 L65,50 A5,5 0 0 1 70,55 L70,70 L55,70 A5,5 0 0 1 50,65 L50,55 A5,5 0 0 0 45,50 L35,50 A5,5 0 0 1 30,45 L30,30" />
          <path d="M70,30 L55,30 A5,5 0 0 0 50,35 L50,45 A5,5 0 0 1 45,50 L35,50 A5,5 0 0 0 30,55 L30,70 L45,70 A5,5 0 0 0 50,65 L50,55 A5,5 0 0 1 55,50 L65,50 A5,5 0 0 0 70,45 L70,30" />
        </g>
        <g fill="#8b5cf6">
          <circle cx="37.5" cy="37.5" r="2.5" />
          <circle cx="62.5" cy="37.5" r="2.5" />
          <circle cx="37.5" cy="62.5" r="2.5" />
          <circle cx="62.5" cy="62.5" r="2.5" />
        </g>
      </svg>
    );
  }
  
  export default PuzzleLogo;