import mongoose from 'mongoose'; 

export const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // Remove the deprecated options
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};