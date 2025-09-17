import { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import "./Dyslexia.css";

export default function DyslexiaTest() {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pick a random sentence for the test
  const sentences = [
    "पेड़ हमें स्वच्छ हवा और छाया प्रदान करते हैं।",
    "हिमालय पर्वत श्रृंखला प्राकृतिक सौंदर्य का खजाना है।",
    "भारत में विभिन्न भाषाएँ और परंपराएँ एकता में बंधी हैं।"
  ];
  const sentence = sentences[Math.floor(Math.random() * sentences.length)];

  const startRecording = () => setRecording(true);
  const stopRecording = () => setRecording(false);

  const onStop = (recordedData) => {
    const file = new File([recordedData.blob], `sentence.wav`, {
      type: "audio/wav",
    });
    setAudioFile(file);
  };

  const handleSubmit = async () => {
    if (!audioFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("sentence", sentence);

    try {
      const response = await axios.post("http://localhost:8002/api/dyslexia/run", formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Error submitting recording. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dyslexia-container">
      <h2>Dyslexia Reading Test</h2>
      <p className="sentence-text">👉 {sentence}</p>

      <ReactMic
        record={recording}
        className="sound-wave"
        onStop={onStop}
        strokeColor="#F09000"
        backgroundColor="#F9F0D0"
      />

      <div className="buttons">
        <button className="start-btn" onClick={startRecording} disabled={recording}>
          🎤 Start
        </button>
        <button className="stop-btn" onClick={stopRecording} disabled={!recording}>
          ⏹ Stop
        </button>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading || !audioFile}>
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </div>

      {result && (
        <div className="results">
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
