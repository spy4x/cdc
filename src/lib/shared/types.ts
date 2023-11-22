import { z, type ZodTypeAny } from 'zod';

// region Errors
export const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
export const SERVER_ERROR = 'SERVER_ERROR';
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
export const UPLOAD_ERROR = 'UPLOAD_ERROR';
export interface UIError {
  code: string;
  message: string;
}
export interface RequestError extends UIError {
  code: typeof SERVER_ERROR | typeof UNKNOWN_ERROR | typeof UPLOAD_ERROR;
  body?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ValidationError<T extends ZodTypeAny> extends UIError {
  code: typeof VALIDATION_ERROR_CODE;
  errors: z.inferFlattenedErrors<T>['fieldErrors'];
}
// endregion Errors

// region VM Helpers
export interface ResponseList<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export enum AsyncOperationStatus {
  IDLE = 'IDLE',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}
// endregion VM Helpers

// region Auth Requests
export const AuthEmailPasswordSchema = z.object({
  email: z.string().email().max(50),
  password: z.string().min(8).max(50),
});

export const AuthPasswordResetRequestSchema = z.object({
  email: z.string().email().max(50),
});

export const AuthPasswordResetSchema = z.object({
  password: z.string().min(8).max(50),
  token: z.string().length(32),
});
// endregion Auth Requests

// region BaseModel
export const BaseModelSchema = z.object({
  id: z.number(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});
export type BaseModel = z.infer<typeof BaseModelSchema>;
// endregion BaseModel

// region User
export enum UserPermission {
  ADMIN = 1,
}
export const UserBaseSchema = z.object({
  cdcAuthToken: z.string().max(250).nullable().default(null),
  learner_id: z.number().nullable().default(null),
  email: z.string().email().max(50).nullable().default(null),
  firstName: z.string().max(50).nullable().default(null),
  lastName: z.string().max(50).nullable().default(null),
  photoUrl: z.string().max(200).nullable().default(null),
});
export const UserSchema = z.intersection(BaseModelSchema, UserBaseSchema);
export const UserUpdateSchema = UserBaseSchema.partial();
export type User = z.infer<typeof UserSchema>;
// endregion User

// region DesiredDay
export const DesiredDayBaseSchema = z.object({
  userId: z.number(),
  dayOfWeek: z.number().min(0).max(6),
  startAtHour: z.number().min(0).max(23),
  startAtMinute: z.number().min(0).max(59),
  endAtHour: z.number().min(0).max(23),
  endAtMinute: z.number().min(0).max(59),
});
export const DesiredDaySchema = z.intersection(BaseModelSchema, DesiredDayBaseSchema);
export type DesiredDayBase = z.infer<typeof DesiredDayBaseSchema>;
export const DesiredDayCreateSchema = DesiredDayBaseSchema.omit({ userId: true });
export type DesiredDayCreate = z.infer<typeof DesiredDayCreateSchema>;
export type DesiredDay = z.infer<typeof DesiredDaySchema>;
export const DesiredDayCompareFields = Object.keys(
  DesiredDayBaseSchema.pick({
    startAtHour: true,
    startAtMinute: true,
    endAtHour: true,
    endAtMinute: true,
  }).shape,
) as (keyof DesiredDayBase)[];
export const DesiredDayUpdateSchema = DesiredDayBaseSchema.partial();
// endregion DesiredDay
