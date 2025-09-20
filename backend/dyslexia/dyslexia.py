# -*- coding: utf-8 -*-
"""
Dyslexia Reading Test for one sentence at a time
Randomly selects Hindi sentences and evaluates pronunciation accuracy.
Requires:
    pip install SpeechRecognition fuzzywuzzy python-Levenshtein
Usage:
    python dyslexia.py <audio_file_path> "<sentence_text>"
"""

import sys
import speech_recognition as sr
from fuzzywuzzy import fuzz

# Get arguments from command line
if len(sys.argv) < 3:
    print("Error: Missing audio file or sentence")
    sys.exit(1)

audio_file = sys.argv[1]
hindi_text = sys.argv[2]

recognizer = sr.Recognizer()

try:
    # Open audio file
    with sr.AudioFile(audio_file) as source:
        audio = recognizer.record(source)

    # Convert speech to text
    try:
        user_speech = recognizer.recognize_google(audio, language="hi-IN")
        print(f"🗣️ User said: {user_speech}")
    except sr.UnknownValueError:
        print("⚠️ आवाज़ समझ में नहीं आई।")
        user_speech = ""
    except sr.RequestError:
        print("⚠️ इंटरनेक् कनेक्शन नहीं।")
        user_speech = ""

    # Calculate accuracy
    if user_speech:
        accuracy = fuzz.token_sort_ratio(hindi_text, user_speech)
        print(f"✅ Accuracy: {accuracy}%")

        # Suggestion
        if accuracy < 70:
            print("🔴 सुझाव: पढ़ने में कठिनाई। Dyslexia की संभावना उच्च।")
        elif accuracy < 85:
            print("🟠 सुझाव: हल्की कठिनाई। आगे जांच उचित।")
        else:
            print("🟢 पढ़ना सही है। Dyslexia की संभावना कम।")
    else:
        print("⚠️ कोई मान्य रिकॉर्डिंग नहीं।")

except Exception as e:
    print(f"⚠️ Error processing audio: {e}")