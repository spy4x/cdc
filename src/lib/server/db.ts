import { env } from '$env/dynamic/private';
import postgres from 'postgres';
import type { User, DesiredDay, BaseModel, DesiredDayBase } from '@shared';

export const sql = postgres({
  host: env.DB_HOST,
  user: env.DB_USER,
  pass: env.DB_PASS,
  db: env.DB_NAME,
  transform: postgres.camel,
  debug: (_, query, parameters) => console.log(query, parameters.length ? parameters : ''),
});

export const db = {
  $connect: async (): Promise<unknown> => sql`SELECT 1`,
  $shutdown: async (): Promise<void> => sql.end({ timeout: 5 }),
  user: {
    count: async (): Promise<number> => +(await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`)[0].count,
    findOne: async (id: number): Promise<null | User> => (await sql<User[]>`SELECT * FROM users WHERE id = ${id}`)[0],
    updateOne: async (id: number, update: Partial<User>): Promise<User> => {
      update.updatedAt = new Date();
      return (await sql<User[]>`UPDATE users SET ${sql(update)} WHERE id = ${id} RETURNING *`)[0];
    },
    deleteOne: async (id: number): Promise<void> => {
      await sql`DELETE FROM users WHERE id = ${id}`;
    },
  },
  desiredDay: {
    doesOneExist: async (id: number, userId: number): Promise<boolean> =>
      !!(
        await sql<
          { exists: number }[]
        >`SELECT CASE WHEN EXISTS(SELECT 1 FROM desired_days WHERE id = ${id} and user_id = ${userId}) THEN 1 ELSE 0 END as exists`
      )[0].exists,
    findMany: async (userId: number): Promise<DesiredDay[]> =>
      await sql<
        DesiredDay[]
      >`SELECT * FROM desired_days WHERE user_id = ${userId} ORDER BY day_of_week, start_at_hour, start_at_minute`,
    updateOne: async (id: number, update: Partial<DesiredDay>, userId: number): Promise<DesiredDay> => {
      update.updatedAt = new Date();
      return (
        await sql<DesiredDay[]>`UPDATE desired_days
                          SET ${sql(update)}
                          WHERE id = ${id} AND user_id = ${userId}
                          RETURNING *`
      )[0];
    },
    createOne: async (userId: number, desiredDay: DesiredDayBase): Promise<DesiredDay> => {
      desiredDay.userId = userId;
      // using transaction - first check if desiredDay with such day_of_week exists. If yes - update it and return. If no - create new
      return sql.begin(async tx => {
        const existing = await tx<DesiredDay[]>`
SELECT * 
FROM desired_days 
WHERE user_id = ${userId} 
  AND day_of_week = ${desiredDay.dayOfWeek} 
LIMIT 1 
FOR UPDATE`;
        if (existing.length) {
          const updated = await tx<DesiredDay[]>`UPDATE desired_days
                                                  SET ${sql(desiredDay)}
                                                  WHERE id = ${existing[0].id}
                                                  RETURNING *`;
          return updated[0];
        }
        const created = await tx<DesiredDay[]>`INSERT INTO desired_days ${sql(desiredDay)} RETURNING *`;
        return created[0];
      });
    },
    updateMany: async (
      updates: (Pick<BaseModel, 'id'> & Partial<DesiredDay>)[],
      userId: number,
    ): Promise<DesiredDay[]> => {
      // using transaction - run for each
      return sql.begin(async tx => {
        const result: DesiredDay[] = [];
        for (const update of updates) {
          const { id, ...rest } = update;
          const updated = await tx<DesiredDay[]>`UPDATE desired_days
                                                 SET ${sql(rest)}
                                                 WHERE id = ${id}
                                                   AND user_id = ${userId}
                                                 RETURNING *`;
          result.push(updated[0]);
        }
        return result;
      });
    },
    deleteOne: async (id: number, userId: number): Promise<void> => {
      await sql`DELETE FROM desired_days WHERE id = ${id} AND user_id = ${userId}`;
    },
  },
};
