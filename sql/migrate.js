import { readdirSync, readFileSync } from 'fs';
import { extname, join } from 'path';
import { sql } from './lib/db.js';

const migrationsFolder = './sql/migrations';
const fileExtension = '.sql';

async function applyMigrations() {
  try {
    // check if migrations table exists
    const tableExists =
      await sql`SELECT exists (SELECT FROM information_schema.tables WHERE  table_name = 'migrations')`;

    // create migrations table if it does not exist
    if (!tableExists[0].exists) {
      await sql`
                CREATE TABLE migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `;
      console.log('Migrations table was created.\n');
    }
  } catch (err) {
    console.error('❌ Failed to create migrations table', err);
    process.exit(1);
  }

  let migrations = [];

  try {
    // get list of migrations from database
    const migrationsResult = await sql`SELECT name FROM migrations`;
    migrations = migrationsResult.map(({ name }) => name);
  } catch (err) {
    console.error('❌ Failed to get migrations from database', err);
    process.exit(1);
  }

  try {
    // read directory and get .sql files
    const files = readdirSync(migrationsFolder);

    const migrationsToApply = files
      .filter(file => extname(file) === fileExtension)
      .map(file => file.replace(fileExtension, ''))
      .filter(file => !migrations.includes(file))
      .sort();

    if (!migrationsToApply.length) {
      console.log('✅ No new migrations to apply.');
      process.exit(0);
    }
    console.log(`Applying ${migrationsToApply.length} migration(s):`);

    for (let migration of migrationsToApply) {
      console.log('- ' + migration);
      // read SQL file
      const sqlScript = readFileSync(join(migrationsFolder, migration + fileExtension), 'utf8');
      // execute the SQL script
      await sql.begin(async tx => {
        await tx.unsafe(sqlScript);
        // record that this migration has been run
        await tx`INSERT INTO migrations (name) VALUES (${migration})`;
      });
    }

    console.log('\n✅ Migrations successfully applied.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Failed to apply migrations\n', err);
    process.exit(1);
  }
}

void applyMigrations();
