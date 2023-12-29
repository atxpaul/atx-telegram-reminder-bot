import mongoose from 'mongoose';

export const databaseConnect = async () => {
    const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

    if (!MONGO_CONNECTION_STRING) {
        throw new Error(
            'MONGO_CONNECTION_STRING environment variable is missing'
        );
    }

    try {
        await mongoose.connect(MONGO_CONNECTION_STRING);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};
