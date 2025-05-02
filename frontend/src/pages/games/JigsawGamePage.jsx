import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Groq from "groq-sdk";
import JigsawPuzzle from '../../components/games/jigsaw/JigsawPuzzle';
import LoadingScreen from '../../components/games/jigsaw/LoadingScreen';
import Confetti from '../../components/games/jigsaw/Confetti';
import JigsawHome from '../../components/games/jigsaw/JigsawHome';
import axios from 'axios';

function JigsawGamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { age, difficulty, theme } = location.state || { age: 5, difficulty: 'easy', theme: 'animals' };

    const calculatePieces = (age, difficulty) => {
        let basePieces = Math.max(4, Math.floor(age * 1.5));

        const difficultyMultiplier = {
            'easy': 1,
            'medium': 1.5,
            'hard': 2
        };

        const totalPieces = Math.floor(basePieces * (difficultyMultiplier[difficulty] || 1));

        const gridSizes = [2, 3, 4, 5, 6, 7];

        for (let i = 0; i < gridSizes.length - 1; i++) {
            if (totalPieces <= gridSizes[i] * gridSizes[i + 1]) {
                return {
                    rows: gridSizes[i],
                    cols: gridSizes[i + 1]
                };
            }
        }

        return { rows: 6, cols: 8 }; // Default for harder puzzles
    };

    const [pieces, setPieces] = useState(() => calculatePieces(age, difficulty));
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        generateImage();
        setPieces(calculatePieces(age, difficulty));
    }, [age, difficulty, theme]);


    const generateImage = async () => {
        setLoading(true);
        setError(null);

        try {
            const groq = new Groq({
                apiKey: import.meta.env.VITE_GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });

            const descriptionResponse = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates detailed, vivid, and child-friendly image descriptions.'
                    },
                    {
                        role: 'user',
                        content: `Create a detailed description of a child-friendly image with a ${theme} theme. The description should be suitable for a ${age}-year-old child and will be used to generate an image for a jigsaw puzzle. Make it colorful, engaging, and appropriate. Keep the description under 100 words.`
                    }
                ],
                model: 'llama3-70b-8192',
                temperature: 0.7,
                max_tokens: 150
            });

            const imagePrompt = descriptionResponse.choices[0].message.content;
            console.log('Generated description:', imagePrompt);

            // Send prompt to your backend server
            const { data } = await axios.post('http://localhost:8001/api/generate-image', { prompt: imagePrompt });

            setImage(data.output); // Use the generated image URL

            setLoading(false);
        } catch (err) {
            console.error("Error generating puzzle:", err);
            setError("Failed to create your puzzle. Please try again.");
            setLoading(false);
        }
    };

    const handlePuzzleComplete = () => {
        setCompleted(true);
    };

    const handlePlayAgain = () => {
        navigate('/');
    };

    if (loading) {
        return <LoadingScreen theme={theme} />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-red-50 to-pink-100">
                <div className="p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
            {completed && <Confetti />}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10 flex justify-center items-center p-4">
                <JigsawPuzzle
                    image={image}   //{/* ✅ Changed from imageUrl to image */}
                    rows={pieces.rows}
                    columns={pieces.cols}  //{/* ✅ Changed from cols to columns */}
                    onComplete={handlePuzzleComplete}
                />
            </div>
            <button
                onClick={handlePlayAgain}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 px-6 rounded-full text-lg hover:scale-105 transition-transform duration-300"
            >
                Play Again
            </button>
        </div>
    );
}

export default JigsawGamePage;
