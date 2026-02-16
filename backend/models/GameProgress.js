// models/GameProgress.js
// SOLID: Single Responsibility - this model handles only game progress data structure
import mongoose from 'mongoose';

/**
 * GameProgress schema stores EVERY session for every child.
 * Each document = one game session.
 * This enables rich longitudinal tracking per child.
 */
const gameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    gameType: {
      type: String,
      required: true,
      enum: ['seguin', 'monkey', 'jigsaw', 'balloon'],
      index: true,
    },

    // ─── Common Fields ────────────────────────────────────────────────
    completionTime: {
      type: Number,
      required: true,
      min: 0,
    }, // seconds

    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    }, // percentage

    level: {
      type: Number,
      default: 1,
    },

    ageGroup: {
      type: String,
      enum: ['6-8', '8-10', '10-12', '12-14'],
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // ─── Seguin Form Board ────────────────────────────────────────────
    // completionTime: fastest time to place all pieces (seconds)
    // accuracy: % of pieces placed on first attempt without errors
    seguinErrors: {
      type: Number,
      default: 0,
      min: 0,
    }, // number of incorrect placements
    seguinMisplacements: {
      type: Number,
      default: 0,
    }, // pieces placed in wrong holes

    // ─── Monkey Type (Typing Game) ────────────────────────────────────
    wpm: {
      type: Number,
      min: 0,
    }, // words per minute
    charactersTyped: {
      type: Number,
      min: 0,
    },
    errors: {
      type: Number,
      min: 0,
      default: 0,
    }, // total typing errors
    textPrompt: {
      type: String,
    }, // the text that was typed (truncated)

    // ─── Jigsaw Puzzle ───────────────────────────────────────────────
    puzzleSize: {
      type: String, // e.g. "4x4", "3x3"
    },
    totalPieces: {
      type: Number,
      min: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageName: {
      type: String,
    }, // which image was used

    // ─── Balloon Pop ─────────────────────────────────────────────────
    balloonsPopped: {
      type: Number,
      min: 0,
    },
    balloonsMissed: {
      type: Number,
      min: 0,
    },
    maxCombo: {
      type: Number,
      min: 0,
    },
    finalScore: {
      type: Number,
      min: 0,
    },
    difficultyReached: {
      type: Number,
      default: 1,
      min: 1,
    }, // highest difficulty level reached this session
    sessionAccuracy: {
      type: Number,
      min: 0,
      max: 100,
    }, // balloons popped / (popped + missed) * 100
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// ─── Compound Indexes for fast dashboard queries ─────────────────────
gameProgressSchema.index({ userId: 1, gameType: 1, date: -1 });
gameProgressSchema.index({ userId: 1, date: -1 });
gameProgressSchema.index({ gameType: 1, date: -1 }); // admin-wide queries

// ─── Virtual: display-friendly date string ───────────────────────────
gameProgressSchema.virtual('dateString').get(function () {
  return this.date.toISOString().split('T')[0];
});

export default mongoose.model('GameProgress', gameProgressSchema);
