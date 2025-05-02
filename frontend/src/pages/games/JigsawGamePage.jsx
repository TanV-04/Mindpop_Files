import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Groq from "groq-sdk";
import OpenAI from "openai";
import JigsawPuzzle from '../../components/games/jigsaw/JigsawPuzzle';
import LoadingScreen from '../../components/games/jigsaw/LoadingScreen';
import Confetti from '../../components/games/jigsaw/Confetti';

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
    
    // Initialize OpenAI with client-side API key
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });

    useEffect(() => {
        generateImage();
        setPieces(calculatePieces(age, difficulty));
    }, [age, difficulty, theme]);

    const generateImage = async () => {
        setLoading(true);
        setError(null);

        try {
            // Step 1: Generate description using Groq
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

            // Step 2: Try OpenAI client-side image generation first
            try {
                // Use OpenAI directly from the frontend
                console.log('Generating image with OpenAI...');
                const result = await openai.images.generate({
                    model: "dall-e-3", // Use DALL-E 3 (you can also try "gpt-image-1")
                    prompt: `Create a child-friendly, colorful image for a jigsaw puzzle: ${imagePrompt}`,
                    size: "1024x1024",
                    quality: "standard",
                    n: 1,
                    response_format: "url" // Get URL directly
                });

                if (result && result.data && result.data.length > 0){
                    const imageUrl = response.data[0].url;
                    console.log('image generated successfully:', imageUrl);
                    return imageUrl;
                }else{
                    throw new Error('no image data in response');
                }
            } catch (openaiError) {
                console.error('OpenAI image generation failed:', openaiError);
                
                // Fallback to server-side generation if client-side fails
                console.log('Falling back to server-side image generation...');
                
                try {
                    const response = await fetch('http://localhost:8001/api/generate-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt }),
                    });

                    if (!response.ok) {
                        // Try to get more detailed error info
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Server response:', errorData);
                        throw new Error(`Image generation failed (${response.status})${errorData.error ? `: ${errorData.error}` : ''}`);
                    }

                    const data = await response.json();
                    console.log('servr-side image generated successfully');
                    return data.imageUrl;
                } catch (serverError) {
                    console.error('Server image generation error:', serverError);
                    
                    // Redirect to fallback URL if all image generation methods fail
                    console.log('Redirecting to fallback jigsaw page');
                    navigate('/games/jigsaw_8_to_10', { 
                        state: { age, difficulty, theme } 
                    });
                }
            }
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

    // For testing - allows manually retrying the image generation
    const handleRetry = () => {
        generateImage();
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
                    <div className="flex gap-4">
                        <button
                            onClick={handleRetry}
                            className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-1/2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
            {completed && <Confetti />}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10 flex justify-center items-center p-4">
                <JigsawPuzzle
                    image={image}
                    rows={pieces.rows}
                    columns={pieces.cols}
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