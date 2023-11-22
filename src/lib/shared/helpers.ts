import type { RequestHelperError } from '@stores/helpers';
import type { z, ZodTypeAny } from 'zod';
import { type RequestError, SERVER_ERROR, UNKNOWN_ERROR, VALIDATION_ERROR_CODE, type ValidationError } from './types';

/**
 * Returns random string of given length
 * @param length length of string, default is 5.
 * @returns random string
 */
export function getRandomStringSimple(length = 5): string {
  let result = '';
  while (result.length < length) {
    result += Math.random().toString(36).substring(9);
  }
  return result.substring(0, length);
}

export function handleValidationError<T extends ZodTypeAny>(error: z.ZodError<T>): ValidationError<T> {
  return {
    code: VALIDATION_ERROR_CODE,
    message: 'Please check correctness of fields',
    errors: error.flatten().fieldErrors,
  };
}

export function handleRequestError<T extends ZodTypeAny>(error: RequestHelperError): RequestError | ValidationError<T> {
  if (error.status === 400 && error.body.code === VALIDATION_ERROR_CODE) {
    return error.body as ValidationError<T>;
  }
  return {
    code: error.status === 500 ? SERVER_ERROR : UNKNOWN_ERROR,
    message: error.body.message || 'Unknown error',
    body: error.body,
  };
}

export async function er<T>(promise: Promise<T>): Promise<[null, T] | [Error, null]> {
  try {
    return [null, await promise];
  } catch (error: unknown) {
    if (error instanceof Error) {
      return [error, null];
    }
    if (typeof error === 'string') {
      return [new Error(error), null];
    }
    return [new Error('Unknown error'), null];
  }
}

export function clone<T>(object: T): T {
  if (structuredClone) {
    // if supported
    return structuredClone<T>(object);
  }
  return JSON.parse(JSON.stringify(object)); // this may cause problems with Date objects and similar complex types
}
