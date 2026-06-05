import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(5000),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('debug'),

  DATABASE_URL: z.string().min(1),

  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  REDIS_URL: z.string().url(),

  MONGO_URL: z.string().min(1),
  MONGO_DB_NAME: z.string().min(1).default('supportdesk_pro_activity'),

  ACCESS_TOKEN_SECRET: z.string().min(32),

  ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(900),

  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),

  GOOGLE_OAUTH_REDIRECT_URI: z
    .url()
    .default('http://localhost:5000/auth/google/callback'),

  OAUTH_STATE_SECRET: z.string().min(32),
  UPLOAD_DIR: z.string().min(1).default('uploads'),

  MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(5242880),

  AWS_REGION: z.string().min(1).default('ap-south-1'),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  S3_PRESIGNED_URL_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(300),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),

  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),

  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  AWS_DYNAMODB_NOTIFICATION_EVENTS_TABLE: z
    .string()
    .min(1)
    .default('supportdesk_notification_events'),

  AWS_DYNAMODB_ENDPOINT: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    'Invalid environment variables:',
    console.error(z.flattenError(parsedEnv.error).fieldErrors),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
