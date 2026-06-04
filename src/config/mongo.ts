import { MongoClient } from 'mongodb';
import { env } from './env';

export const mongoClient = new MongoClient(env.MONGO_URL, {
  serverSelectionTimeoutMS: 2000,
});

let isMongoConnected = false;

export const connectMongo = async (): Promise<void> => {
  if (!isMongoConnected) {
    await mongoClient.connect();
    isMongoConnected = true;
  }
};

export const checkMongoConnection = async (): Promise<void> => {
  await connectMongo();

  const db = mongoClient.db(env.MONGO_DB_NAME);
  const result = await db.command({ ping: 1 });

  if (result.ok !== 1) {
    throw new Error('MongoDB health check failed');
  }
};
