import postgres from 'postgres';
import { env } from './env.js';

export const sql = postgres({
  ...env.db,
  transform: postgres.camel,
});
