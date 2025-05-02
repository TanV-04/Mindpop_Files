import { useState, useEffect } from 'react';
import PuzzleLogo from '../jigsaw/PuzzleLogo';

function LoadingScreen({ theme = 'puzzle' }) {
  const [loadingText, setLoadingText] = useState('Creating your puzzle');
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const messages = [
      `Finding the perfect ${theme} picture`,
      'Drawing something special',
      'Cutting the puzzle pieces',
      'Getting everything ready',
      'Almost there'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingText(messages[messageIndex]);
    }, 2000);
    
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [theme]);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="flex flex-col items-center space-y-8">
        <div className="animate-bounce">
          <PuzzleLogo className="w-24 h-24" />
        </div>
        
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold text-purple-700">{loadingText}<span className="inline-block w-8">{dots}</span></h2>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;