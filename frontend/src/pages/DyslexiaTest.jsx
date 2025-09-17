import { useState } from "react";
import "./Dyslexia.css";


export default function DyslexiaTest() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const startTest = async () => {
        setLoading(true);
        setResult("");
        try {
            const res = await fetch("http://localhost:8002/api/dyslexia/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userText: "Sample Hindi text" }) // send text to Python
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setResult(data.output || "No result received.");
        } catch (err) {
            setResult("⚠️ Error running test: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F09000] p-6">
            {/* Card */}
            <div className="bg-[#F9F0D0] text-[#66220B] rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Dyslexia Analysis</h1>

                <p className="mb-6 text-base md:text-lg">
                    Click the button below to start the Hindi reading test.
                </p>

                <button
                    onClick={startTest}
                    disabled={loading}
                    className={`px-8 py-3 rounded-full font-semibold transition-colors duration-200
            ${loading
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-[#66220B] hover:bg-[#854533] text-[#F9F0D0]"
                        }`}
                >
                    {loading ? "Running Test..." : "Start Test"}
                </button>

                {result && (
                    <pre className="bg-white text-black mt-6 p-4 rounded-md whitespace-pre-wrap text-sm text-left border border-gray-200 shadow-inner">
                        {result}
                    </pre>
                )}
            </div>
        </div>
    );
}
