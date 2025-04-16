
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'slangify';

// Create a MongoDB client
const client = new MongoClient(MONGO_URI);

// Connect to the MongoDB server
export const connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(DB_NAME);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Get the database instance
export const getDb = () => {
  return client.db(DB_NAME);
};

// Close the MongoDB connection
export const closeMongoDB = async () => {
  await client.close();
  console.log('MongoDB connection closed');
};

export const mongodb = {
  client,
  getDb,
  connectToMongoDB,
  closeMongoDB
};
