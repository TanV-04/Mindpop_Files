// migration.js
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Find all users without privacySettings
    const users = await User.find({ privacySettings: { $exists: false } });
    logger.info(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Add default values for new fields
      user.privacySettings = {
        shareProgressWithTeachers: false,
        allowActivityTracking: true,
        receiveEmails: true
      };
      user.name = user.name || user.username;
      
      await user.save();
      logger.info(`Migrated user: ${user.username}`);
    }

    logger.info('User migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during migration:', error);
    process.exit(1);
  }
};

migrateUsers();