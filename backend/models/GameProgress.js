//GameProgress.js
import mongoose from 'mongoose';

const gameProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  gameType: { 
    type: String, 
    required: true, 
    enum: ['seguin', 'monkey', 'jigsaw'] 
  },
  completionTime: { 
    type: Number, 
    required: true 
  }, // in seconds
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  }, // percentage correct
  date: { 
    type: Date, 
    default: Date.now 
  },
  level: { 
    type: Number, 
    default: 1 
  },
  // Additional fields for jigsaw puzzle
  ageGroup: {
    type: String,
    enum: ['6-8', '8-10', '10-12', '12-14'],
    required: function() {
      return this.gameType === 'jigsaw';
    }
  },
  puzzleSize: {
    type: String,
    required: function() {
      return this.gameType === 'jigsaw';
    }
  },
  totalPieces: {
    type: Number,
    required: function() {
      return this.gameType === 'jigsaw';
    }
  }
}, {
  timestamps: true
});

// Create index for faster queries
gameProgressSchema.index({ userId: 1, gameType: 1, date: -1 });

export default mongoose.model('GameProgress', gameProgressSchema);
