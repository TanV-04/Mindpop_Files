from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import uuid
from autism_behavior_detector import AutismBehaviorDetector
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

detector = AutismBehaviorDetector(
    model_path='D:\\TANVI_COLLEGE_FILES\\PBL2_SEM6\\Mindpop_Files_Clean\\backend\\ml-model\\enhanced_rf_model.pkl',
    scaler_path='D:\\TANVI_COLLEGE_FILES\\PBL2_SEM6\\Mindpop_Files_Clean\\backend\\ml-model\\enhanced_scaler.pkl',
    threshold=0.3
)

def convert_types(obj):
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    video_file = request.files['video']
    filename = secure_filename(video_file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    video_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    video_file.save(video_path)

    try:
        results = detector.analyze_video(video_path, clip_duration=5, overlap=2)
        report_df = detector.generate_report(results, video_path)
        os.remove(video_path)

        # Convert types for JSON serialization
        results = [{k: convert_types(v) for k, v in res.items()} for res in results]

        summary = detector.generate_summary(results)

        return jsonify({'results': summary}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
