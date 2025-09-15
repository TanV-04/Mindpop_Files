import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow_hub as hub
import joblib
from tqdm import tqdm
import uuid


class AutismBehaviorDetector:
    def __init__(self, model_path, scaler_path, threshold=0.3):
        """Initialize the detector with trained models"""
        print("[INFO] Loading models...")
        self.feature_extractor = hub.load(
            "https://tfhub.dev/deepmind/i3d-kinetics-400/1"
        )
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.threshold = threshold
        self.labels = ["armflapping", "headbanging", "spinning"]

    def preprocess_frame(self, frame, target_size=(224, 224)):
        frame = cv2.resize(frame, target_size)
        frame = frame / 255.0  # Normalize
        return frame

    def extract_features_from_clip(self, clip_path, num_frames=16):
        cap = cv2.VideoCapture(clip_path)
        frames = []

        while len(frames) < num_frames:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(self.preprocess_frame(frame))

        cap.release()

        if len(frames) < num_frames and frames:
            frames.extend([frames[-1]] * (num_frames - len(frames)))

        frames = np.expand_dims(np.array(frames), axis=0)
        features = self.feature_extractor.signatures["default"](
            tf.constant(frames, dtype=tf.float32)
        )
        return features["default"].numpy().flatten()

    def analyze_video(self, video_path, clip_duration=5, overlap=2):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Cannot open video file")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps else 0

        print(f"[INFO] Video Duration: {duration:.2f} seconds, FPS: {fps}")

        clip_segments = []
        current_time = 0
        while current_time + clip_duration <= duration:
            clip_segments.append((current_time, current_time + clip_duration))
            current_time += clip_duration - overlap

        if not clip_segments and duration > 1:
            clip_segments.append((0, duration))

        results = []
        for i, (start, end) in enumerate(tqdm(clip_segments, desc="Processing clips")):
            clip_filename = f"temp_clips/clip_{uuid.uuid4().hex}.mp4"
            os.makedirs("temp_clips", exist_ok=True)

            # Extract frames for this clip and write to new video file
            cap_clip = cv2.VideoCapture(video_path)
            cap_clip.set(cv2.CAP_PROP_POS_MSEC, start * 1000)

            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            width = int(cap_clip.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap_clip.get(cv2.CAP_PROP_FRAME_HEIGHT))
            out = cv2.VideoWriter(clip_filename, fourcc, fps, (width, height))

            while True:
                ret, frame = cap_clip.read()
                if not ret:
                    break

                current_pos = cap_clip.get(cv2.CAP_PROP_POS_MSEC) / 1000
                if current_pos > end:
                    break

                out.write(frame)

            cap_clip.release()
            out.release()

            try:
                features = self.extract_features_from_clip(clip_filename)
                features_scaled = self.scaler.transform([features])

                predictions = self.model.predict(features_scaled)[0]
                probabilities = self.model.predict_proba(features_scaled)

                spinning_prob = (
                    probabilities[2][:, 1][0]
                    if len(probabilities[2].shape) > 1
                    else probabilities[2][1]
                )
                spinning_pred = 1 if spinning_prob >= self.threshold else 0
                predictions[2] = spinning_pred

                result = {
                    "clip_id": i,
                    "start_time": start,
                    "end_time": end,
                    "armflapping": predictions[0],
                    "headbanging": predictions[1],
                    "spinning": predictions[2],
                    "armflapping_prob": (
                        probabilities[0][0][1]
                        if len(probabilities[0].shape) > 1
                        else probabilities[0][1]
                    ),
                    "headbanging_prob": (
                        probabilities[1][0][1]
                        if len(probabilities[1].shape) > 1
                        else probabilities[1][1]
                    ),
                    "spinning_prob": spinning_prob,
                }

                results.append(result)

            except Exception as e:
                print(f"[ERROR] Clip {i}: {str(e)}")

            os.remove(clip_filename)

        cap.release()
        return results

    def generate_report(self, results, video_path):
        df = pd.DataFrame(results)

        print("\n📊 Autism Behavior Analysis Report")
        print(f"Video: {os.path.basename(video_path)}")
        print(f"Total Clips: {len(df)}")
        print(f"Duration Analyzed: {df['end_time'].max():.1f} seconds")

        for behavior in self.labels:
            detected = df[behavior].sum()
            percentage = (detected / len(df)) * 100
            print(f"{behavior.upper()}: {detected}/{len(df)} clips ({percentage:.1f}%)")

        return df

    # ✅ Generate summary as an instance method
    def generate_summary(self, results):
        total_clips = len(results)

        overall_score = round(
            100
            * np.mean(
                [
                    (r["armflapping_prob"] + r["headbanging_prob"] + r["spinning_prob"])
                    / 3
                    for r in results
                ]
            ),
            1,
        )

        summary = {
            "overallScore": overall_score,
            "armflapping": {
                "detected": any(r["armflapping"] for r in results),
                "confidence": round(
                    np.mean([r["armflapping_prob"] for r in results]), 2
                ),
            },
            "headbanging": {
                "detected": any(r["headbanging"] for r in results),
                "confidence": round(
                    np.mean([r["headbanging_prob"] for r in results]), 2
                ),
            },
            "spinning": {
                "detected": any(r["spinning"] for r in results),
                "confidence": round(np.mean([r["spinning_prob"] for r in results]), 2),
            },
        }

        return summary