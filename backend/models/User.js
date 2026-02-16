// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    name: {
      type: String,
      trim: true,
    },

    birthDate: {
      type: Date,
      // Not required for admin accounts
    },

    profilePicture: {
      type: String,
    },

    /**
     * isAdmin: set to true during signup via admin toggle.
     * Admin users can view all children's progress metrics.
     * Admin users are NOT subject to the age 5-14 restriction.
     */
    isAdmin: {
      type: Boolean,
      default: false,
    },

    privacySettings: {
      shareProgressWithTeachers: { type: Boolean, default: false },
      allowActivityTracking:    { type: Boolean, default: true },
      receiveEmails:            { type: Boolean, default: true },
    },

    tokens: [{ type: String }],

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: computed age (null for admins with no birthDate) ────────
userSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  const diff = Date.now() - this.birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// ─── Encrypt password before save ────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Generate signed JWT ──────────────────────────────────────────────
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ─── Compare password ─────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
