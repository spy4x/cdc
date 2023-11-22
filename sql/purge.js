import { env } from './lib/env.js';
import { sql } from './lib/db.js';

/** Drops all tables from the database.
 *  if NODE_ENV!='prod' || 'production' and not --prod - then abort */
async function purge() {
  if (env.isProd && !process.argv.includes('--prod')) {
    console.error('❌ Cannot purge database in production');
    process.exit(1);
  }
  let tables = [];
  try {
    console.log('Fetching table names...');
    const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;
    tables = result.map(({ tableName }) => tableName);
  } catch (err) {
    console.error('❌ Failed to fetch table names', err);
    process.exit(1);
  }

  if (!tables.length) {
    console.log('\n✅ No tables to purge.');
    process.exit(0);
  }

  try {
    console.log(`Purging ${tables.length} tables:`);
    for (let table of tables) {
      console.log('- ' + table);
      await sql`DROP TABLE ${sql(table)} CASCADE`;
    }
    console.log('\n✅ Database purged.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Failed to purge database\n', err);
    process.exit(1);
  }
}

void purge();
