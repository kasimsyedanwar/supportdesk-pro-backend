import { Db, MongoClient } from 'mongodb';
import { env } from './env';
import { logger } from './logger';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export const connectMongo = async (): Promise<void> => {
  if (mongoClient && mongoDb) {
    return;
  }

  mongoClient = new MongoClient(env.MONGO_URL);
  await mongoClient.connect();

  mongoDb = mongoClient.db(env.MONGO_DB_NAME);

  logger.info('MongoDB connected');
};

export const getMongoDb = (): Db => {
  if (!mongoDb) {
    throw new Error('MongoDB is not connected');
  }

  return mongoDb;
};

export const checkMongoConnection = async (): Promise<void> => {
  if (!mongoDb) {
    await connectMongo();
  }

  await getMongoDb().command({ ping: 1 });
};

export const disconnectMongo = async (): Promise<void> => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
  }
};
