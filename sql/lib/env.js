import { config } from 'dotenv';

const isProd = process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production';
config({ path: isProd ? '.env.prod' : '.env' });

export const env = {
  isProd,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    db: process.env.DB_NAME,
  },
};
