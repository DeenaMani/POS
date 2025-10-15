// db/getDatabase.ts
import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const db = process.env.DB_DATABASE || 'test';

let mongoConnection: Connection | null = null;

async function getDatabase(): Promise<Connection> {
    if (mongoConnection) {
        return mongoConnection;
    }

    const mongoUri = `mongodb://${host}:${port}/${db}`;
    console.log('🔌 Connecting to MongoDB:', mongoUri);

    try {
        await mongoose.connect(mongoUri);
        mongoConnection = mongoose.connection;
        console.log(`✅ Connected to MongoDB: ${db}`);
        return mongoConnection;
    } catch (error: any) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        throw error;
    }
}

export { getDatabase };
