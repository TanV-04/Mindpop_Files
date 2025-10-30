import { useState, useRef } from "react";
import axios from "axios";
import "./Dyslexia.css";

export default function DyslexiaTest() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Pick a random sentence for the test
  const sentences = [
    "पेड़ हमें स्वच्छ हवा और छाया प्रदान करते हैं।",
    "हिमालय पर्वत श्रृंखला प्राकृतिक सौंदर्य का खजाना है।",
    "भारत में विभिन्न भाषाएँ और परंपराएँ एकता में बंधी हैं।"
  ];
  const sentence = sentences[Math.floor(Math.random() * sentences.length)];

  const startRecording = async () => {
    try {
      setError(null);
      setResult(null);
      setAudioBlob(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);

    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Cannot access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError("Please record audio first");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Convert blob to file
      const file = new File([audioBlob], "recording.webm", {
        type: "audio/webm"
      });

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("sentence", sentence);

      const response = await axios.post("http://localhost:8008/api/dyslexia/run", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      setResult(response.data);
    } catch (err) {
      console.error("Submission error:", err);
      if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure the Flask backend is running on port 8002.");
      } else if (err.response?.data?.error) {
        setError(`Server error: ${err.response.data.error}`);
      } else {
        setError("Error submitting recording. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dyslexia-container">
      <h2>Dyslexia Reading Test</h2>
      <p className="sentence-text">👉 {sentence}</p>

      <div className="recording-status">
        {recording ? (
          <div className="recording-indicator">
            <div className="pulse"></div>
            Recording...
          </div>
        ) : audioBlob ? (
          <div className="recording-ready">
            ✅ Recording ready to submit
          </div>
        ) : (
          <div className="recording-ready">
            Click Start to begin recording
          </div>
        )}
      </div>

      <div className="buttons">
        <button className="start-btn" onClick={startRecording} disabled={recording}>
          🎤 Start Recording
        </button>
        <button className="stop-btn" onClick={stopRecording} disabled={!recording}>
          ⏹ Stop Recording
        </button>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading || !audioBlob}>
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="results">
          <h3>Result:</h3>
          {result.status === "success" ? (
            <>
              <p><strong>You said:</strong> {result.user_speech}</p>
              <p><strong>Accuracy:</strong> {result.accuracy}%</p>
              <p><strong>Feedback:</strong> {result.suggestion}</p>
            </>
          ) : (
            <p>{result.suggestion || "Error processing your audio"}</p>
          )}
        </div>
      )}
    </div>
  );
}