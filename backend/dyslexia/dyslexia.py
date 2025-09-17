# -*- coding: utf-8 -*-
"""
Offline Dyslexia Reading Test with Final Summary
Randomly selects Hindi sentences and evaluates pronunciation accuracy.
Requires:
    pip install SpeechRecognition fuzzywuzzy python-Levenshtein
"""

import random
import speech_recognition as sr
from fuzzywuzzy import fuzz
import statistics

# ------------------------------------------------------------
# 1️⃣  Hindi sentences (expand this list as much as you like)
# ------------------------------------------------------------
sentences = [
    "भारत एक विशाल देश है और इसकी संस्कृति विविधता से भरपूर है।",
    "गंगा नदी भारत की सबसे पवित्र नदियों में से एक मानी जाती है।",
    "ताजमहल प्रेम का अद्भुत प्रतीक है।",
    "हिमालय पर्वत श्रृंखला प्राकृतिक सौंदर्य का खजाना है।",
    "दिल्ली भारत की राजधानी और ऐतिहासिक धरोहरों का केंद्र है।",
    "सत्य और अहिंसा महात्मा गांधी के मुख्य सिद्धांत थे।",
    "भारत में विभिन्न भाषाएँ और परंपराएँ एकता में बंधी हैं।",
    "कड़ी मेहनत और दृढ़ निश्चय सफलता की कुंजी हैं।",
    "पेड़ हमें स्वच्छ हवा और छाया प्रदान करते हैं।",
    "पुस्तकें ज्ञान का सबसे बड़ा स्रोत होती हैं।"
]

LINES_PER_TEST = 3
chosen_lines = random.sample(sentences, k=LINES_PER_TEST)

recognizer = sr.Recognizer()
all_scores = []  # store accuracies for final summary

# ------------------------------------------------------------
# 2️⃣  Test loop
# ------------------------------------------------------------
for idx, hindi_text in enumerate(chosen_lines, 1):
    print(f"\nपंक्ति {idx} में से {LINES_PER_TEST}")
    print("कृपया निम्नलिखित वाक्य जोर से पढ़ें:\n")
    print("👉", hindi_text)
    input("\nपढ़ना शुरू करने के लिए Enter दबाएँ...")

    # ---- record speech ----
    with sr.Microphone() as source:
        print("\n🎤 रिकॉर्डिंग हो रही है... बोलें!")
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=15)
        except sr.WaitTimeoutError:
            print("⚠️ समय समाप्त। अगला वाक्य प्रयास करें।")
            continue
        print("रिकॉर्डिंग समाप्त। कृपया प्रतीक्षा करें...")

    # ---- speech to text ----
    try:
        user_speech = recognizer.recognize_google(audio, language="hi-IN")
        print("\n🗣️ आपने कहा:\n", user_speech)
    except sr.UnknownValueError:
        print("⚠️ आवाज़ समझ में नहीं आई। अगला वाक्य प्रयास करें।")
        continue
    except sr.RequestError:
        print("⚠️ इंटरनेट कनेक्शन नहीं। कृपया बाद में पुनः प्रयास करें।")
        continue

    # ---- accuracy ----
    accuracy = fuzz.token_sort_ratio(hindi_text, user_speech)
    all_scores.append(accuracy)
    print(f"\n✅ शुद्धता प्रतिशत: {accuracy}%")

    # ---- per-line suggestion ----
    if accuracy < 70:
        print("🔴 सुझाव: पढ़ने में कठिनाई पाई गई। Dyslexia की संभावना है।")
    elif accuracy < 85:
        print("🟠 सुझाव: हल्की कठिनाई हो सकती है। जाँच करवाना उचित होगा।")
    else:
        print("🟢 पढ़ना सही है। Dyslexia की संभावना कम है।")

# ------------------------------------------------------------
# 3️⃣  Final summary
# ------------------------------------------------------------
print("\n📊 परीक्षण समाप्त। सभी वाक्यों का मूल्यांकन कर लिया गया है।")

if all_scores:
    avg_score = round(statistics.mean(all_scores), 1)
    print(f"\n🔎 अंतिम औसत शुद्धता: {avg_score}%")

    # Final assessment based on average
    if avg_score < 70:
        print("💡 अंतिम निष्कर्ष: पढ़ने में गंभीर कठिनाई। Dyslexia की उच्च संभावना।")
    elif avg_score < 85:
        print("💡 अंतिम निष्कर्ष: हल्की कठिनाई देखी गई। आगे परीक्षण करवाना उचित होगा।")
    else:
        print("💡 अंतिम निष्कर्ष: पढ़ना सामान्य है। Dyslexia की संभावना कम है।")
else:
    print("⚠️ कोई मान्य रिकॉर्डिंग प्राप्त नहीं हुई।")
