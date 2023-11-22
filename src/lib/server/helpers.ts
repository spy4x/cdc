import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import { db } from './db';

export const execPromise = promisify(execCb);

export async function exec(command: string): Promise<string> {
  const { stdout, stderr } = await execPromise(command);
  if (stderr) {
    console.error(`"${command}" stderr:\n${stderr}`);
  }
  if (stdout) {
    console.log(`"${command}" stdout:\n${stdout}`);
  }
  return stdout;
}

export function getRandomStringSecure(length = 10): string {
  return randomBytes(length / 2).toString('hex');
}

type Signal = 'SIGINT' | 'SIGTERM';
export async function shutdown(signal: Signal): Promise<void> {
  console.log(`${signal} received. Shutting down...`);
  await db.$shutdown();
  process.exit(0);
}
