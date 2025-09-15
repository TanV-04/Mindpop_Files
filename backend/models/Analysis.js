import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  originalFilename: {
    type: String,
    required: true
  },
  results: {
    overallScore: Number,
    behaviors: {
      armflapping: {
        detected: Boolean,
        confidence: Number
      },
      headbanging: {
        detected: Boolean,
        confidence: Number
      },
      spinning: {
        detected: Boolean,
        confidence: Number
      }
    }
  },
  metadata: {
    videoDuration: Number,
    analysisType: {
      type: String,
      default: "autism_behavior"
    }
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

export default mongoose.model('Analysis', AnalysisSchema);