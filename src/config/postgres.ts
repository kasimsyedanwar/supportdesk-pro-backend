import { Pool } from 'pg';
import { env } from './env';

export const postgresPool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  connectionTimeoutMillis: 2000,
  max: 5,
});

export const checkPostgresConnection = async (): Promise<void> => {
  const result = await postgresPool.query('SELECT 1 AS ok');

  if (result.rows[0]?.ok !== 1) {
    throw new Error('PostgreSQL health check failed');
  }
};
