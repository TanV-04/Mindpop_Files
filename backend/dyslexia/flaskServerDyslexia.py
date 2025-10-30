# -*- coding: utf-8 -*-
"""
Flask server for Dyslexia Reading Test - FFmpeg detection + WebM conversion
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from fuzzywuzzy import fuzz
import tempfile
import os
import logging
import subprocess
import wave
import shutil

# Setup
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])


def find_ffmpeg():
    """Find ffmpeg executable on Windows system or PATH"""
    known_paths = [
        "/usr/local/bin/ffmpeg",      # Homebrew (Intel Macs)
        "/opt/homebrew/bin/ffmpeg",   # Homebrew (Apple Silicon M1/M2)
        "/usr/bin/ffmpeg",
    ]

    for path in known_paths:
        if os.path.exists(path):
            logger.debug(f"Found ffmpeg at: {path}")
            return path

    logger.error("FFmpeg not found on this system.")
    return None


def convert_webm_to_wav(webm_path, wav_path):
    """Convert WebM to WAV using FFmpeg"""
    try:
        ffmpeg_path = find_ffmpeg()
        if not ffmpeg_path:
            logger.error("FFmpeg not available")
            return False

        cmd = [
            ffmpeg_path, '-i', webm_path,
            '-acodec', 'pcm_s16le',
            '-ac', '1',
            '-ar', '16000',
            '-y',
            wav_path
        ]

        logger.debug(f"Running FFmpeg command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            logger.error(f"FFmpeg failed: {result.stderr}")
            return False

        if os.path.exists(wav_path) and os.path.getsize(wav_path) > 0:
            logger.debug(f"Conversion successful: {wav_path}")
            return True
        else:
            logger.error("Conversion failed: Output WAV missing or empty")
            return False

    except subprocess.TimeoutExpired:
        logger.error("FFmpeg conversion timed out")
        return False
    except Exception as e:
        logger.error(f"Error during FFmpeg conversion: {e}")
        return False


def is_valid_audio_file(file_path):
    """Validate that audio file is readable"""
    try:
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            logger.error("File missing or empty")
            return False

        try:
            with wave.open(file_path, 'rb') as wav_file:
                channels = wav_file.getnchannels()
                frame_rate = wav_file.getframerate()
                frames = wav_file.getnframes()
                logger.debug(f"WAV info - Channels: {channels}, Rate: {frame_rate}, Frames: {frames}")
                return channels > 0 and frame_rate > 0 and frames > 0
        except wave.Error as e:
            logger.warning(f"Wave read failed: {e}")

        recognizer = sr.Recognizer()
        with sr.AudioFile(file_path) as source:
            audio = recognizer.record(source, duration=1)
            return len(audio.get_raw_data()) > 0

    except Exception as e:
        logger.error(f"Audio validation error: {e}")
        return False


@app.route("/api/dyslexia/run", methods=["POST"])
def dyslexia_test():
    tmp_filename = None
    converted_filename = None

    try:
        if not find_ffmpeg():
            return jsonify({"error": "Server error: FFmpeg not found"}), 500

        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        sentence = request.form.get("sentence", "")
        if not sentence:
            return jsonify({"error": "No sentence provided"}), 400

        audio_file = request.files["audio"]
        file_ext = os.path.splitext(audio_file.filename)[1].lower()

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            audio_file.save(tmp_file.name)
            tmp_filename = tmp_file.name
            logger.debug(f"Saved audio to: {tmp_filename} ({os.path.getsize(tmp_filename)} bytes)")

        # Convert non-wav files
        if file_ext in ['.webm', '.ogg', '.mp3']:
            converted_filename = tmp_filename + ".wav"
            if convert_webm_to_wav(tmp_filename, converted_filename):
                os.unlink(tmp_filename)
                tmp_filename = converted_filename
                converted_filename = None
            else:
                os.unlink(tmp_filename)
                return jsonify({"error": "Audio conversion failed. Please re-record."}), 400

        if not is_valid_audio_file(tmp_filename):
            os.unlink(tmp_filename)
            return jsonify({"error": "Invalid audio format. Please re-record."}), 400

        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp_filename) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.record(source)

        try:
            user_speech = recognizer.recognize_google(audio, language="hi-IN")
        except sr.UnknownValueError:
            user_speech = ""
        except sr.RequestError as e:
            return jsonify({"error": "Speech recognition service unavailable"}), 500

        if user_speech:
            accuracy = fuzz.token_sort_ratio(sentence, user_speech)
            if accuracy < 70:
                suggestion = "🔴 सुझाव: पढ़ने में कठिनाई। Dyslexia की संभावना उच्च।"
            elif accuracy < 85:
                suggestion = "🟠 सुझाव: हल्की कठिनाई। आगे जांच उचित।"
            else:
                suggestion = "🟢 पढ़ना सही है। Dyslexia की संभावना कम।"

            result = {
                "user_speech": user_speech,
                "accuracy": accuracy,
                "suggestion": suggestion,
                "status": "success"
            }
        else:
            result = {
                "user_speech": "",
                "accuracy": 0,
                "suggestion": "⚠️ आवाज़ समझ में नहीं आई। कृपया दोबारा रिकॉर्ड करें।",
                "status": "error"
            }

        return jsonify(result)

    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({"error": "Unexpected server error"}), 500

    finally:
        for f in [tmp_filename, converted_filename]:
            if f and os.path.exists(f):
                os.unlink(f)
                logger.debug(f"Deleted temp file: {f}")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "ok",
        "ffmpeg_found": find_ffmpeg() is not None
    })


if __name__ == "__main__":
    app.run(debug=True, port=8008, host='0.0.0.0')
