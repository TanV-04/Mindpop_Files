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
    enum: ['seguin', 'monkey'] 
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
  }
}, {
  timestamps: true
});

// Create index for faster queries
gameProgressSchema.index({ userId: 1, gameType: 1, date: -1 });

export default mongoose.model('GameProgress', gameProgressSchema);